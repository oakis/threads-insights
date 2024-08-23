export const breakdowns = ["country", "city", "age", "gender"];

export const metrics = [
  "views",
  "likes",
  "replies",
  "reposts",
  "quotes",
  "followers_count",
  "follower_demographics",
] as const;

export const allMetrics = metrics.join(",");

export type Breakdown = (typeof breakdowns)[number];
export type Metric = (typeof metrics)[number];

export interface ViewData {
  name: Metric;
  period: string;
  values: [
    {
      value: number;
      end_time: string;
    }
  ];
  title: string;
  description: string;
  id: string;
}

export interface SimpleData {
  name: Metric;
  period: string;
  title: string;
  description: string;
  total_value: { value: number };
  id: string;
}

export interface DemoResults {
  dimension_values: string[];
  value: number;
}

export interface DemographicsData {
  name: Metric;
  period: string;
  title: string;
  description: string;
  total_value: {
    breakdowns: [
      {
        dimension_keys: Breakdown[];
        results: DemoResults[];
      }
    ];
  };
  id: string;
}

export type ThreadsData = ViewData | SimpleData | DemographicsData;

interface SubValue {
  title: string;
  value: string;
}

export interface MappedResponse {
  metric: Metric;
  title: string;
  desc: string;
  total?: number;
  subTitle?: string;
  subValues?: SubValue[];
}

export interface ThreadsError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  is_transient?: boolean;
  error_user_title?: string;
  error_user_msg?: string;
  fbtrace_id: string;
}

export interface ThreadsResponse {
  data: ThreadsData[];
  error?: ThreadsError;
}
