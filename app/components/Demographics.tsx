import { Bar, Doughnut } from "react-chartjs-2";
import { Breakdown, DemographicsData, DemoResults } from "../config";
import Chart from "chart.js/auto";
import { ChartOptions, LinearScale } from "chart.js";
import { labelize, mapData } from "../utils";
import { useState } from "react";

Chart.register(LinearScale);

interface IDemographics {
  data: DemographicsData;
  breakdown: Breakdown;
}

const maxResults = 6;

const mapResults = (
  results: DemoResults[],
  breakdown: Breakdown
): DemoResults[] => {
  const returnValue = results;
  if (breakdown !== "age") {
    returnValue.sort((a, b) => b.value - a.value);
    returnValue.splice(maxResults, results.length - maxResults);
  }
  return returnValue;
};

const mapGender = (str: string): string => {
  switch (str) {
    case "F":
      return "👩";
    case "M":
      return "👨";
    case "U":
      return "🤔";
    default:
      return str;
  }
};

const Demographics = ({ data, breakdown }: IDemographics) => {
  const [currentBreakdown] = useState(breakdown);

  const results = mapResults(
    data.total_value.breakdowns[0].results,
    currentBreakdown
  );

  const topSix: DemographicsData = {
    ...data,
    total_value: {
      breakdowns: [
        {
          dimension_keys: data.total_value.breakdowns[0].dimension_keys,
          results,
        },
      ],
    },
  };

  const { title, desc, subValues, metric, subTitle } = mapData(
    topSix,
    currentBreakdown
  );

  const graphData = {
    labels: subValues?.map((val) => {
      if (currentBreakdown === "gender") {
        return mapGender(val.title);
      }
      return val.title.split(",")[0];
    }),
    datasets: [
      {
        label: labelize(metric),
        data: subValues?.map((val) => val.value),
        borderWidth: 1,
      },
    ],
  };

  const style = { height: "100%", width: "100%" };

  const options: ChartOptions<"bar" | "doughnut"> = {
    indexAxis: subTitle === "age" ? "x" : "y",
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        color: "#000",
        font: {
          family: "'Inter', sans-serif",
          size: 24,
          weight: "bold",
        },
        align: "start",
        text: labelize(title),
      },
      subtitle: {
        display: true,
        color: "#000",
        font: {
          family: "'Inter', sans-serif",
          size: 16,
        },
        align: "start",
        text: desc,
        padding: {
          top: 0,
          bottom: 16,
        },
      },
      legend: {
        labels: {
          font: {
            size: 24,
          },
        },
        display: subTitle === "gender",
      },
    },
  };

  const renderGraph = () => {
    switch (subTitle) {
      case "gender":
        return <Doughnut style={style} data={graphData} options={options} />;

      default:
        return <Bar style={style} data={graphData} options={options} />;
    }
  };

  return <div className="max-h-96 w-full">{renderGraph()}</div>;
};

export default Demographics;
