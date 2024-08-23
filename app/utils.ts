import {
  Breakdown,
  DemographicsData,
  MappedResponse,
  Metric,
  SimpleData,
  ThreadsData,
  ViewData,
} from "./config";

export const labelize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.replace("_", " ").slice(1);

export const readableNumber = (num: number): string =>
  num.toLocaleString("en-GB", { notation: "compact" }).replace(",", ".");

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .reduce((a, b) => `${a}${b}`);
}

const mapTitle = (str: Metric): string => {
  switch (str) {
    case "views":
      return `${str} 👀`;
    case "likes":
      return `${str} ❤️`;
    case "replies":
      return `${str} ↩️`;
    case "reposts":
      return `${str} 🔁`;
    case "quotes":
      return `${str} 📃`;
    case "followers_count":
      return `${str} 🧮`;
    case "follower_demographics":
      return `${str} 🏠👨👩`;
    default:
      return str;
  }
};

export const mapData = (
  data: ThreadsData,
  breakdown?: Breakdown
): MappedResponse => {
  switch (data.name) {
    case "views": {
      return {
        metric: data.name,
        title: mapTitle(data.name),
        desc: data.description,
        total: (data as ViewData).values.reduce(
          (prev, curr) => prev + curr.value,
          0
        ),
        subValues: (data as ViewData).values.map((v) => ({
          title: v.end_time,
          value: v.value.toString(),
        })),
      };
    }
    case "follower_demographics": {
      const current = (data as DemographicsData).total_value.breakdowns[0];
      return {
        metric: data.name,
        title: mapTitle(data.name),
        desc: data.description,
        subTitle: current.dimension_keys[0],
        subValues: current.results.map((res) => ({
          title:
            breakdown === "country"
              ? getFlagEmoji(res.dimension_values[0])
              : res.dimension_values[0],
          value: res.value.toString(),
        })),
      };
    }
    default:
      return {
        metric: data.name,
        title: mapTitle(data.name),
        desc: data.description,
        total: (data as SimpleData).total_value.value,
      };
  }
};
