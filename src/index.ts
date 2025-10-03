#!/usr/bin/env node

import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { validateAnalysisOptions } from "./lib/validateOptions.js";
import { analyze } from "./lib/analyze.js";

const program = new Command();

const version = packageJson.version;

const envApiKey = process.env.SPEEDVITALS_API_KEY || "";

program
  .name("speedvitals")
  .description("Speedvitals CLI Tool for Website Performance Analysis")
  .version(version);

// Main command for URL analysis
program
  .command("analyze")
  .description("Analyze URLs for performance metrics")
  .option(
    "--config <path>",
    "Array of URLs to analyze with device and location example: [['https://example.com', 'mobile', 'us'], ['https://example.com/about', 'desktop', 'in']]"
  )
  .option(
    "--urls <urls>",
    "Array of URLs to analyze example: ['https://example.com', 'https://example.com/about']"
  )
  .option(
    "--device <device>",
    "Device type (allowed: mobile, desktop, macbookAirM1, highEndLaptop, ipad102, galaxyTabS7, iphone13ProMax, iphone11, galaxyS10Plus, redmiNote8Pro, iphone7, galaxyA50, galaxyJ8, motoG5, redmi5A) (default: mobile)"
  )
  .option(
    "--location <location>",
    "Testing location (allowed: us, ca, br, de, uk, nl, pl, ch, jp, in, sg, au, id, kr, tw) (default: us)"
  )
  .option("--lcp <ms>", "Largest Contentful Paint budget in milliseconds")
  .option("--cls <score>", "Cumulative Layout Shift budget as a decimal score")
  .option("--fcp <ms>", "First Contentful Paint budget in milliseconds")
  .option("--tbt <ms>", "Total Blocking Time budget in milliseconds")
  .option("--tti <ms>", "Time to Interactive budget in milliseconds")
  .option(
    "--server-response-time <ms>",
    "Server response time budget in milliseconds"
  )
  .option("--speed-index <ms>", "Speed Index budget in milliseconds")
  .option("--performance-score <score>", "Performance score (0-100)")
  .option(
    "--fail-on-regression <boolean>",
    "Exit with error code on budget regression (true/false)",
    "true"
  )
  .option("--baseBranch <branch>", "Base branch")
  .option(
    "--api-key <key>",
    "API key for authentication (get it from https://speedvitals.com/account/api). API key can also be set via SPEEDVITALS_API_KEY environment variable."
  )
  .action(async (options) => {
    // Load configuration defaults

    const apiKey = options.apiKey || envApiKey;
    const baseBranch = options.baseBranch;
    const failOnRegression =
      options.failOnRegression === "true" || options.failOnRegression === true;

    const budget = {
      lcp: options.lcp ? parseInt(options.lcp) : undefined,
      cls: options.cls ? parseFloat(options.cls) : undefined,
      fcp: options.fcp ? parseInt(options.fcp) : undefined,
      tbt: options.tbt ? parseInt(options.tbt) : undefined,
      tti: options.tti ? parseInt(options.tti) : undefined,
      firstMeaningfulPaint: options["first-meaningful-paint"]
        ? parseInt(options["first-meaningful-paint"])
        : undefined,
      serverResponseTime: options["server-response-time"]
        ? parseInt(options["server-response-time"])
        : undefined,
      speedIndex: options["speed-index"]
        ? parseInt(options["speed-index"])
        : undefined,
      performanceScore: options["performance-score"]
        ? parseInt(options["performance-score"])
        : undefined,
    };

    let config: Array<[string, string, string]> | undefined = undefined;
    if (options.config) {
      try {
        config = JSON.parse(options.config);
      } catch (error) {
        console.error(
          `❌ Invalid JSON format for --config option. Please provide a valid JSON array.`
        );
        console.error(
          `Example: '[["https://example.com", "mobile", "us"], ["https://example.com/about", "desktop", "uk"]]'`
        );
        console.error(`Error: ${error}`);
        process.exit(1);
      }
    }

    let urls: string[] = [];
    if (options.urls) {
      try {
        urls = JSON.parse(options.urls);
      } catch (error) {
        console.error(
          `❌ Invalid JSON format for --urls option. Please provide a valid JSON array.`
        );
        console.error(
          `Example: '["https://example.com", "https://example.com/about"]'`
        );
        console.error(`Error: ${error}`);
        process.exit(1);
      }
    }

    // Validate options
    const { isValid, errors } = validateAnalysisOptions({
      apiKey,
      config,
      baseBranch,
      failOnRegression,
      budget,
      device: options.device,
      location: options.location,
      urls: urls,
    });

    if (!isValid) {
      console.error(`❌ Invalid options:`, errors);
      process.exit(1);
    }

    analyze({
      config,
      apiKey,
      baseBranch,
      failOnRegression,
      budget,
      device: options.device,
      location: options.location,
      urls: urls,
    });
  });

program.parse();
