export interface AnalyzeOptions {
  config?: Array<[string, string, string]> | undefined;
  urls?: string[] | undefined;
  baseBranch?: string;
  failOnRegression: boolean;
  apiKey: string;
  device?: string;
  location?: string;
  budget?: {
    lcp?: number | undefined;
    cls?: number | undefined;
    fcp?: number | undefined;
    tbt?: number | undefined;
    serverResponseTime?: number | undefined;
    speedIndex?: number | undefined;
    performanceScore?: number | undefined;
  };
}

export type BudgetRule = {
  metric: keyof AnalyzeMetrics;
  threshold: number;
  direction: "above" | "below";
};

export interface AnalyzeMetrics {
  speed_index: number | null;
  performance_score: number | null;
  total_blocking_time: number | null;
  server_response_time: number | null;
  first_contentful_paint: number | null;
  cumulative_layout_shift: number | null;
  largest_contentful_paint: number | null;
}

export type Status = "success" | "idle" | "failed" | "active";

export interface AnalyzeDataItem {
  id: string;
  url: string;
  error: string | null;
  config: Record<string, string | number | boolean>;
  device: string;
  status: Status;
  metrics: AnalyzeMetrics;
  location: string;
  created_at: number;
  expires_at: number;
  report_url: string;
  lighthouse_version: string;
}

export interface AnalyzeResultSuccessResponse {
  data: AnalyzeDataItem;
}

export interface AnalyzeErrorResponse {
  code: string;
  message: string;
}

export type AnalyzeResultResponse =
  | AnalyzeResultSuccessResponse
  | AnalyzeErrorResponse;

export type AnalyzeTestSuccessResponse = {
  id: string;
  url: string;
  device: string;
  location: string;
  config: Record<string, string | number | boolean>;
  status: Status;
  lighthouse_version: string;
  metrics: AnalyzeMetrics | null;
  report_url: string | null;
  created_at: number;
  expires_at: number;
  error: string | null;
};

export type AnalyzeTestResponse =
  | AnalyzeTestSuccessResponse
  | AnalyzeErrorResponse;
