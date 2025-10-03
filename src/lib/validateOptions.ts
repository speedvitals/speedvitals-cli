import type { AnalyzeOptions } from "../types/analyze.js";
import * as z from "zod";

const analyzeOptionsSchema = z.object({
  apiKey: z
    .string()
    .min(
      1,
      "API key is required. Set it via --apiKey or SPEEDVITALS_API_KEY environment variable."
    ),
  config: z
    .array(
      z.tuple([z.string().url("Invalid URL format"), z.string(), z.string()])
    )
    .optional(),
  baseBranch: z.string().optional(),
  urls: z.array(z.string().url("Invalid URL format")).optional(),
  failOnRegression: z.boolean().optional(),
  device: z.string().optional(),
  location: z.string().optional(),
  budget: z
    .object({
      lcp: z
        .number()
        .positive("LCP budget must be a positive number")
        .optional(),
      cls: z.number().min(0, "CLS budget must be non-negative").optional(),
      fcp: z
        .number()
        .positive("FCP budget must be a positive number")
        .optional(),
      tbt: z.number().min(0, "TBT budget must be non-negative").optional(),
      tti: z
        .number()
        .positive("TTI budget must be a positive number")
        .optional(),
      firstMeaningfulPaint: z
        .number()
        .positive("First Meaningful Paint budget must be a positive number")
        .optional(),
      serverResponseTime: z
        .number()
        .positive("Server Response Time budget must be a positive number")
        .optional(),
      speedIndex: z
        .number()
        .positive("Speed Index budget must be a positive number")
        .optional(),
      performanceScore: z
        .number()
        .min(0, "Performance Score must be between 0 and 100")
        .max(100, "Performance Score must be between 0 and 100")
        .optional(),
    })
    .optional(),
});

export const validateAnalysisOptions = (options: AnalyzeOptions) => {
  const errors: string[] = [];
  const result = analyzeOptionsSchema.safeParse(options);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(issue.message);
    }
  }

  // Custom validation: either config or urls must be provided, but not both
  const hasConfig = options.config && options.config.length > 0;
  const hasUrls = options.urls && options.urls.length > 0;
  if (hasConfig && hasUrls) {
    errors.push(
      "Cannot provide both config and urls. Use either --config or --urls, not both."
    );
  } else if (!hasConfig && !hasUrls) {
    errors.push(
      "Either config or urls must be provided. Use --config or --urls."
    );
  }

  // Custom validation: location and device can only be provided with urls
  if ((options.location || options.device) && !hasUrls) {
    errors.push("--location and --device can only used with --urls option.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
