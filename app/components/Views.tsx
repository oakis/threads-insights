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
    <Line
      data={data}
      options={{
        plugins: {
          subtitle: {
            text: desc,
          },
          title: {
            display: true,
            color: "#000",
            font: {
              family: "inter",
              size: 24,
              weight: "bold",
            },
            text: `${labelize(title)} - ${readableNumber(total as number)}`,
          },
          legend: {
            display: false,
          },
        },
      }}
    />
  );
};

export default Views;
