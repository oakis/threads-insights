import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { Breakdown, MappedResponse } from "../config";
import Chart from "chart.js/auto";
import {
  BarOptions,
  ChartOptions,
  ChartTypeRegistry,
  LinearScale,
} from "chart.js";
import { labelize } from "../utils";
import { useState } from "react";

Chart.register(LinearScale);

interface IDemographics extends MappedResponse {
  breakdown: Breakdown;
}

const Demographics = ({
  title,
  desc,
  subValues,
  metric,
  subTitle,
}: IDemographics) => {
  const data = {
    labels: subValues?.map((val) => val.title),
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
        display: subTitle === "gender",
      },
    },
  };

  const renderGraph = () => {
    switch (subTitle) {
      case "gender":
        return <Doughnut style={style} data={data} options={options} />;

      default:
        return <Bar style={style} data={data} options={options} />;
    }
  };

  return <div className="h-96 w-full">{renderGraph()}</div>;
};

export default Demographics;
