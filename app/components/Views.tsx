import { Line } from "react-chartjs-2";
import { ViewData } from "../config";
import Chart from "chart.js/auto";
import { LinearScale } from "chart.js";
import { labelize, mapData, readableNumber } from "../utils";

Chart.register(LinearScale);

interface IViews {
  data: ViewData;
}

const Views = ({ data }: IViews) => {
  const {subValues, metric, desc, total, title} = mapData(data);
  const graphData = {
    labels: subValues?.map((val) =>
      new Intl.DateTimeFormat("sv-SE").format(new Date(val.title))
    ),
    datasets: [
      {
        label: labelize(metric),
        data: subValues?.map((val) => val.value),
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="md:h-96 w-full h-72">
      <Line
        style={{ height: "100%" }}
        data={graphData}
        options={{
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
              text: `${desc} A total of ${readableNumber(
                total as number
              )} times.`,
              padding: {
                top: 0,
                bottom: 16,
              },
            },
            legend: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
};

export default Views;
