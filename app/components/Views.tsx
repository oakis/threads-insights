import { Line } from "react-chartjs-2";
import { MappedResponse } from "../config";
import Chart from "chart.js/auto";
import { LinearScale } from "chart.js";
import { labelize, readableNumber } from "../utils";

Chart.register(LinearScale);

const Views = ({ title, desc, total, subValues, metric }: MappedResponse) => {
  const data = {
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
    <div className="h-96 w-full">
      <Line
        style={{ height: "100%" }}
        data={data}
        options={{
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
