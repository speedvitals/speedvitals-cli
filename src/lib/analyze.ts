import type {
  AnalyzeMetrics,
  AnalyzeOptions,
  AnalyzeResultSuccessResponse,
  BudgetRule,
  Status,
} from "../types/analyze.js";
import envCi from "env-ci";
import { SpinnerProgressBar } from "./progress-bar.js";
import { createLighthouseTest, getLighthouseTestResult } from "./queries.js";
import {
  DEFAULT_BUDGET,
  DEFAULT_DEVICE,
  DEFAULT_LOCATION,
  LH_TEST_CONCURRENCY,
  LH_TEST_MAX_ATTEMPTS,
  LH_TEST_POLL_INTERVAL_MS,
  LH_MAX_TEST_RETRIES,
} from "./constants.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hasPendingStatus = (statuses: Status[]) =>
  statuses.some((status) => status === "active" || status === "idle");

const formatErrorDetails = (error: unknown): string => {
  if (error === undefined || error === null) {
    return "Unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      return maybeMessage;
    }

    try {
      return JSON.stringify(error);
    } catch (jsonError) {
      return String(error);
    }
  }

  return String(error);
};

const isNullMetric = (
  metrics: AnalyzeMetrics,
  budgetConfig: BudgetRule[]
): string[] => {
  const budgetedMetrics = budgetConfig.map((rule) => rule.metric);
  return budgetedMetrics.filter(
    (metric) => metrics[metric] === null || metrics[metric] === undefined
  );
};

const pollLighthouseTestResult = async (params: {
  testId: string;
  apiKey: string;
  progressBar: SpinnerProgressBar;
  onComplete: () => void;
}): Promise<AnalyzeResultSuccessResponse> => {
  for (let attempt = 1; attempt <= LH_TEST_MAX_ATTEMPTS; attempt += 1) {
    const result = await getLighthouseTestResult({
      testId: params.testId,
      apiKey: params.apiKey,
    });

    if ("code" in result) {
      throw new Error(
        `❌ Analysis failed: ${result.message} (code: ${result.code})`
      );
    }

    if (result.data.error) {
      throw new Error(
        `❌ Analysis error: ${formatErrorDetails(result.data.error)}`
      );
    }
    const status = result.data.status;
    const isStillRunning = hasPendingStatus([status]);

    if (!isStillRunning) {
      params.onComplete();
      return result;
    }

    if (attempt === LH_TEST_MAX_ATTEMPTS) {
      throw new Error(
        `⏰ Timed out waiting for test ${params.testId} to leave the active/idle state. Last known status: ${status}`
      );
    }

    await sleep(LH_TEST_POLL_INTERVAL_MS);
  }

  throw new Error(
    `❌ Unexpected error while polling results for test ${params.testId}`
  );
};

const formatMetricValue = (value: number | null, metric: string): string => {
  if (value === null || value === undefined) return "N/A";

  // CLS is already a decimal, don't multiply by 1000
  if (metric === "cumulative_layout_shift") {
    return value.toFixed(3);
  }

  // Performance score is 0-100
  if (metric === "performance_score") {
    return value.toFixed(0);
  }

  // All other metrics are in milliseconds
  return `${Math.round(value)}ms`;
};

const logResultsTable = (results: AnalyzeResultSuccessResponse[]): void => {
  results.forEach((result, index) => {
    const { data } = result;
    console.log(
      `┌─ Test ${index + 1}: ${data.url} | Device: ${data.device} | Location: ${data.location}`
    );
    console.log(`└─  📄 Report: ${data.report_url}`);

    console.log(``);
  });
};

const checkBudgetRegressions = (
  results: AnalyzeResultSuccessResponse[],
  failOnRegression: boolean,
  budgets: BudgetRule[] = []
): boolean => {
  let hasRegression = false;
  results.forEach((result) => {
    budgets.forEach((budget) => {
      const metricValue = result.data.metrics[budget.metric];

      const formattedMetricValue =
        typeof metricValue === "number" ? metricValue : "N/A";

      const isRegression =
        metricValue === null ||
        metricValue === undefined ||
        (budget.direction === "above" && metricValue < budget.threshold) ||
        (budget.direction === "below" && metricValue > budget.threshold);

      if (isRegression) {
        hasRegression = true;
        const comparator = budget.direction === "above" ? "<" : ">";
        console.warn(
          `⚠️ Budget regression detected for ${budget.metric}: \x1b[31m${formattedMetricValue}\x1b[0m ${comparator} \x1b[32m${budget.threshold}\x1b[0m | URL ${result.data.url} Device: ${result.data.device}, Location: ${result.data.location}`
        );
      }
    });
  });
  if (hasRegression && failOnRegression) {
    throw new Error(`❌ Budget regression detected Exited with error.`);
  }
  if (!hasRegression) {
    console.log(`✅ No budget regressions detected.`);
  }
  return hasRegression;
};

export const analyze = async (
  analysisOptions: AnalyzeOptions
): Promise<AnalyzeResultSuccessResponse[]> => {
  try {
    const ciEnv = envCi();

    const {
      urls,
      config,
      budget,
      device,
      location,
      apiKey,
      baseBranch,
      failOnRegression,
    } = analysisOptions;

    const mainConfig: Array<[string, string, string]> = config
      ? config
      : urls
        ? urls.map((url) => [
            url,
            device || DEFAULT_DEVICE,
            location || DEFAULT_LOCATION,
          ])
        : [];
    const inputBudget =
      budget &&
      Object.entries(budget)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => {
          const mappings: Record<
            string,
            { metric: string; direction: "above" | "below" }
          > = {
            performanceScore: {
              metric: "performance_score",
              direction: "above",
            },
            lcp: { metric: "largest_contentful_paint", direction: "below" },
            cls: { metric: "cumulative_layout_shift", direction: "below" },
            fcp: { metric: "first_contentful_paint", direction: "below" },
            tbt: { metric: "total_blocking_time", direction: "below" },
            serverResponseTime: {
              metric: "server_response_time",
              direction: "below",
            },
            speedIndex: { metric: "speed_index", direction: "below" },
          };
          const mapping = mappings[key];
          if (!mapping) throw new Error(`Unknown budget metric: ${key}`);
          return {
            metric: mapping.metric as keyof AnalyzeMetrics,
            threshold: value as number,
            direction: mapping.direction,
          };
        });
    const budgetConfig: BudgetRule[] =
      inputBudget && inputBudget?.length > 0
        ? inputBudget
        : // Default Budget
          [
            {
              metric: "performance_score",
              threshold: DEFAULT_BUDGET.performanceScore,
              direction: "above",
            },
            {
              metric: "largest_contentful_paint",
              threshold: DEFAULT_BUDGET.lcp,
              direction: "below",
            },
            {
              metric: "cumulative_layout_shift",
              threshold: DEFAULT_BUDGET.cls,
              direction: "below",
            },
            {
              metric: "first_contentful_paint",
              threshold: DEFAULT_BUDGET.fcp,
              direction: "below",
            },
            {
              metric: "total_blocking_time",
              threshold: DEFAULT_BUDGET.tbt,
              direction: "below",
            },
            {
              metric: "server_response_time",
              threshold: DEFAULT_BUDGET.serverResponseTime,
              direction: "below",
            },
            {
              metric: "speed_index",
              threshold: DEFAULT_BUDGET.speedIndex,
              direction: "below",
            },
          ];

    const { isCi, branch, commit } = ciEnv;

    // Extract CI-specific properties with safe access
    const name = isCi ? (ciEnv as any).name : undefined;
    const service = isCi ? (ciEnv as any).service : undefined;
    const tag = isCi ? (ciEnv as any).tag : undefined;
    const build = isCi ? (ciEnv as any).build : undefined;
    const buildUrl = isCi ? (ciEnv as any).buildUrl : undefined;
    const job = isCi ? (ciEnv as any).job : undefined;
    const jobUrl = isCi ? (ciEnv as any).jobUrl : undefined;
    const isPr = isCi ? (ciEnv as any).isPr : false;
    const pr = isCi ? (ciEnv as any).pr : undefined;
    const prBranch = isCi ? (ciEnv as any).prBranch : undefined;
    const slug = isCi ? (ciEnv as any).slug : undefined;
    const root = isCi ? (ciEnv as any).root : undefined;

    const lhResults: AnalyzeResultSuccessResponse[] = [];

    console.log(`🚀 Starting analysis of ${mainConfig.length} URL(s)...`);
    const progressBar = new SpinnerProgressBar(mainConfig.length, 50);
    progressBar.start();
    progressBar.update(0);

    let completedUrls = 0;

    // Process URLs with controlled concurrency (max 3 at a time)
    const processUrl = async (
      testUrl: [string, string, string]
    ): Promise<AnalyzeResultSuccessResponse> => {
      let retries = 0;
      while (retries <= LH_MAX_TEST_RETRIES) {
        try {
          // Create lighthouse test
          const lhTestData = await createLighthouseTest({
            apiKey,
            config: testUrl,
            ciEnv: {
              isCi,
              name,
              service,
              isPr,
              pr,
              prBranch,
              commit,
              branch: baseBranch || branch,
              build,
              slug,
            },
          });

          if ("code" in lhTestData) {
            throw new Error(
              `❌ Analysis failed for ${testUrl}: ${lhTestData.message} (code: ${lhTestData.code})`
            );
          }
          if (lhTestData.error) {
            throw new Error(
              `❌ Analysis error for ${testUrl}: ${formatErrorDetails(
                lhTestData.error
              )}`
            );
          }

          // Poll for results
          const result = await pollLighthouseTestResult({
            testId: lhTestData.id,
            apiKey,
            progressBar,
            onComplete: () => {
              completedUrls += 1;
              progressBar.update(completedUrls);
            },
          });
          const nullMetrics = isNullMetric(result.data.metrics, budgetConfig);
          if (nullMetrics.length > 0) {
            throw new Error(
              `❌ Analysis returned null for url ${testUrl[0]} and metric(s) ${nullMetrics.join(", ")}`
            );
          }

          return result;
        } catch (error) {
          retries += 1;
          progressBar.update(
            completedUrls,
            ` (retrying for ${testUrl[0]} ${retries}/${LH_MAX_TEST_RETRIES})`
          );
          if (retries > LH_MAX_TEST_RETRIES) {
            throw error;
          }
        }
      }
      throw new Error(
        `❌ Failed to analyze ${testUrl[0]} after ${LH_MAX_TEST_RETRIES} retries.`
      );
    };

    // Create a semaphore to limit concurrency
    const runningPromises = new Set<Promise<void>>();
    const maxConcurrency = LH_TEST_CONCURRENCY; // 3

    for (const testUrl of mainConfig) {
      // Wait if we've reached max concurrency
      while (runningPromises.size >= maxConcurrency) {
        await Promise.race(runningPromises);
      }

      // Start processing this URL
      const promise = processUrl(testUrl)
        .then((result) => {
          lhResults.push(result);
        })
        .catch((error) => {
          throw error;
        })
        .finally(() => {
          runningPromises.delete(promise);
        });

      runningPromises.add(promise);
    }

    // Wait for all remaining promises to complete
    await Promise.all(runningPromises);

    progressBar.complete();

    logResultsTable(lhResults);

    checkBudgetRegressions(lhResults, failOnRegression, budgetConfig);
    if (lhResults.length > 0) {
      console.log(
        `🎉 Successfully completed analysis of ${lhResults.length} URL(s).`
      );
    }

    return lhResults;
  } catch (error) {
    console.error(
      `\n Error analyzing URL:`,
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
};
