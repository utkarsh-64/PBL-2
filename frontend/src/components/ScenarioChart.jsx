import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ScenarioChart = ({ scenarios }) => {
  // Generate 20 years of projection data
  const years = Array.from({ length: 20 }, (_, i) => i + 1);

  const colors = [
    "rgb(59, 130, 246)", // Blue
    "rgb(34, 197, 94)", // Green
    "rgb(249, 115, 22)", // Orange
    "rgb(168, 85, 247)", // Purple
  ];

  const datasets = scenarios.map((scenario, index) => {
    // Simple projection logic - in real app this would be more sophisticated
    const monthlyIncome = scenario.monthlyIncome;
    const data = years.map((year) => {
      if (scenario.id === "lump-sum") {
        // Lump sum with 5% growth, but depleting over time
        const remaining = Math.max(
          0,
          scenario.totalValue * Math.pow(1.05, year) - monthlyIncome * 12 * year
        );
        return remaining > 0 ? monthlyIncome : 0;
      } else if (scenario.id === "annuity" || scenario.id === "joint-life") {
        // Fixed annuity payments
        return monthlyIncome;
      } else {
        // Phased withdrawal with inflation adjustment
        return monthlyIncome * Math.pow(1.03, year); // 3% inflation adjustment
      }
    });

    return {
      label: scenario.name,
      data: data,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + "20",
      tension: 0.1,
    };
  });

  const data = {
    labels: years.map((year) => `Year ${year}`),
    datasets: datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Income Projection Over 20 Years",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${
              context.dataset.label
            }: ₹${context.parsed.y.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString("en-IN");
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default ScenarioChart;
