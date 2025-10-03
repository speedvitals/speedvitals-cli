export const BASE_API_URL = "https://api.speedvitals.com/v1";

export const LH_TEST_CONCURRENCY = 3;

export const LH_TEST_POLL_INTERVAL_MS = 5000;

export const LH_TEST_MAX_ATTEMPTS = 60;

export const LH_MAX_TEST_RETRIES = 2;

export const DEFAULT_BUDGET = {
  lcp: 515,
  cls: 0.0,
  performanceScore: 90,
  fcp: 1800,
  tbt: 200,
  serverResponseTime: 600,
  speedIndex: 2300,
};

export const DEFAULT_DEVICE = "mobile";

export const DEFAULT_LOCATION = "us";
