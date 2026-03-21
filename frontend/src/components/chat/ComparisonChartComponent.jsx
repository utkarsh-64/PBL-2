import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ComparisonChartComponent = ({ scenarios, chartType = "income" }) => {
  const [activeChart, setActiveChart] = useState(chartType);

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <p className="text-gray-600">No data available for chart.</p>
      </div>
    );
  }

  const colors = [
    "rgb(59, 130, 246)", // Blue
    "rgb(34, 197, 94)", // Green
    "rgb(249, 115, 22)", // Orange
    "rgb(168, 85, 247)", // Purple
  ];

  const generateIncomeProjection = () => {
    const years = Array.from({ length: 20 }, (_, i) => i + 1);

    const datasets = scenarios.map((scenario, index) => {
      const monthlyIncome = scenario.monthlyIncome;
      const data = years.map((year) => {
        if (scenario.id === "lump-sum") {
          const remaining = Math.max(
            0,
            scenario.totalValue * Math.pow(1.05, year) -
              monthlyIncome * 12 * year
          );
          return remaining > 0 ? monthlyIncome : 0;
        } else if (scenario.id === "annuity" || scenario.id === "joint-life") {
          return monthlyIncome;
        } else {
          return monthlyIncome * Math.pow(1.03, year);
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

    return {
      labels: years.map((year) => `Year ${year}`),
      datasets: datasets,
    };
  };

  const generateComparisonBar = () => {
    const labels = scenarios.map((s) => s.name);

    return {
      labels: labels,
      datasets: [
        {
          label: "Monthly Income (₹)",
          data: scenarios.map((s) => s.monthlyIncome),
          backgroundColor: colors[0] + "80",
          borderColor: colors[0],
          borderWidth: 1,
        },
        {
          label: "Tax Impact (₹)",
          data: scenarios.map((s) => s.taxImplication),
          backgroundColor: colors[2] + "80",
          borderColor: colors[2],
          borderWidth: 1,
        },
      ],
    };
  };

  const generateSuitabilityChart = () => {
    return {
      labels: scenarios.map((s) => s.name),
      datasets: [
        {
          label: "Suitability Score (%)",
          data: scenarios.map((s) => s.suitability),
          backgroundColor: scenarios.map(
            (_, index) => colors[index % colors.length] + "80"
          ),
          borderColor: scenarios.map(
            (_, index) => colors[index % colors.length]
          ),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (activeChart === "income" || activeChart === "comparison") {
              return `${
                context.dataset.label
              }: ₹${context.parsed.y.toLocaleString("en-IN")}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            if (activeChart === "suitability") {
              return value + "%";
            }
            return "₹" + value.toLocaleString("en-IN");
          },
        },
      },
    },
  };

  const renderChart = () => {
    switch (activeChart) {
      case "income":
        return (
          <Line data={generateIncomeProjection()} options={chartOptions} />
        );
      case "comparison":
        return <Bar data={generateComparisonBar()} options={chartOptions} />;
      case "suitability":
        return <Bar data={generateSuitabilityChart()} options={chartOptions} />;
      default:
        return (
          <Line data={generateIncomeProjection()} options={chartOptions} />
        );
    }
  };

  const chartTitles = {
    income: "Monthly Income Projection Over 20 Years",
    comparison: "Monthly Income vs Tax Impact Comparison",
    suitability: "Suitability Score Comparison",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {chartTitles[activeChart]}
        </h3>

        {/* Chart Type Selector */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveChart("income")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === "income"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Income Projection</span>
          </button>
          <button
            onClick={() => setActiveChart("comparison")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === "comparison"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Side by Side</span>
          </button>
          <button
            onClick={() => setActiveChart("suitability")}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === "suitability"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Suitability</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">{renderChart()}</div>

      {/* Key Insights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-green-700">
              Highest Monthly Income:
            </span>
            <span className="ml-2 text-gray-600">
              {
                scenarios.reduce((max, s) =>
                  s.monthlyIncome > max.monthlyIncome ? s : max
                ).name
              }
              (₹
              {scenarios
                .reduce((max, s) =>
                  s.monthlyIncome > max.monthlyIncome ? s : max
                )
                .monthlyIncome.toLocaleString("en-IN")}
              )
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Best Suitability:</span>
            <span className="ml-2 text-gray-600">
              {
                scenarios.reduce((max, s) =>
                  s.suitability > max.suitability ? s : max
                ).name
              }
              (
              {
                scenarios.reduce((max, s) =>
                  s.suitability > max.suitability ? s : max
                ).suitability
              }
              %)
            </span>
          </div>
          <div>
            <span className="font-medium text-red-700">Lowest Tax Impact:</span>
            <span className="ml-2 text-gray-600">
              {
                scenarios.reduce((min, s) =>
                  s.taxImplication < min.taxImplication ? s : min
                ).name
              }
              (₹
              {scenarios
                .reduce((min, s) =>
                  s.taxImplication < min.taxImplication ? s : min
                )
                .taxImplication.toLocaleString("en-IN")}
              )
            </span>
          </div>
          <div>
            <span className="font-medium text-purple-700">Risk Balance:</span>
            <span className="ml-2 text-gray-600">
              {scenarios.filter((s) => s.riskLevel === "Medium").length > 0
                ? "Moderate options available"
                : "Consider risk vs return"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChartComponent;
