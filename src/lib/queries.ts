import type {
  AnalyzeResultResponse,
  AnalyzeTestResponse,
} from "../types/analyze.js";
import { BASE_API_URL } from "./constants.js";

export const createLighthouseTest = async (param: {
  config: [string, string, string];
  ciEnv: Record<string, any>;
  apiKey: string;
}) => {
  const { config, ciEnv } = param;
  const [urlString, device, location] = config;
  const response = await fetch(BASE_API_URL + `/lighthouse-tests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": param.apiKey,
    },
    body: JSON.stringify({
      ciEnv,
      config: {},
      url: urlString,
      device: device,
      location: location,
    }),
  });
  const data = await response.json();
  return data as AnalyzeTestResponse;
};

export const getLighthouseTestResult = async (params: {
  testId: string;
  apiKey: string;
}) => {
  const response = await fetch(
    BASE_API_URL + `/lighthouse-tests/${params.testId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": params.apiKey,
      },
    }
  );
  const data = await response.json();
  return { data } as AnalyzeResultResponse;
};
