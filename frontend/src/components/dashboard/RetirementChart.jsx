import { useEffect, useRef } from "react";
import * as Chart from "chart.js";
import { useSelector } from "react-redux";
import ChartOverlay from "../ChartOverlay";

// Register Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.LineElement,
  Chart.PointElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend
);

const RetirementChart = ({
  currentAge = 25,
  lifeExpectancy = 85,
  initialSavings = 200000,
  annualContribution = 10000,
  growthRate = 6, // percentage
  withdrawalRate = 6, // percentage
  postRetirementGrowthRate = 4, // percentage
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { userData } = useSelector((state) => state.userData);
  currentAge = userData.age || currentAge;
  const { retirementAge } = useSelector((state) => state.dashboardData);

  // Flexible calculator for different assumptions
  const calculateRetirementData = (
    gRate = growthRate,
    wRate = withdrawalRate,
    postRate = postRetirementGrowthRate
  ) => {
    const data = [];
    const labels = [];

    let corpus = initialSavings;
    const currentYear = new Date().getFullYear();

    // Growth phase
    for (let age = currentAge; age <= retirementAge; age++) {
      const year = currentYear + (age - currentAge);
      labels.push(year);

      if (age === currentAge) {
        data.push(corpus);
      } else {
        corpus = corpus * (1 + gRate / 100) + annualContribution;
        data.push(Math.round(corpus));
      }
    }

    // Withdrawal phase
    let peakCorpus = corpus;
    for (let age = retirementAge + 1; age <= lifeExpectancy; age++) {
      const year = currentYear + (age - currentAge);
      labels.push(year);

      const annualWithdrawal = peakCorpus * (wRate / 100);
      corpus = (corpus - annualWithdrawal) * (1 + postRate / 100);

      corpus = Math.max(0, corpus);
      data.push(Math.round(corpus));
    }

    return { labels, data };
  };

  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // Base Case
    const { labels, data: baseData } = calculateRetirementData();

    // Best Case (slightly optimistic)
    const { data: bestData } = calculateRetirementData(
      growthRate + 2,
      withdrawalRate,
      postRetirementGrowthRate + 1
    );

    // Worst Case (pessimistic)
    const { data: worstData } = calculateRetirementData(
      growthRate - 2,
      withdrawalRate + 1,
      postRetirementGrowthRate - 1
    );

    chartInstance.current = new Chart.Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Base Case",
            data: baseData,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: false,
            tension: 0.1,
          },
          {
            label: "Best Case (Optimistic)",
            data: bestData,
            borderColor: "#16a34a",
            backgroundColor: "rgba(22, 163, 74, 0.1)",
            fill: false,
            borderDash: [5, 5], // dashed line for distinction
            tension: 0.1,
          },
          {
            label: "Worst Case (Pessimistic)",
            data: worstData,
            borderColor: "#dc2626",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            fill: false,
            borderDash: [3, 3],
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(context.raw);

                const age = currentAge + context.dataIndex;
                const phase =
                  age <= retirementAge ? "Accumulation" : "Withdrawal";

                return [`${value}`, `Age: ${age}`, `Phase: ${phase}`];
              },
            },
          },
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Year",
            },
          },
          y: {
            title: {
              display: true,
              text: "Corpus Value (₹)",
            },
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                  notation: "compact",
                }).format(value);
              },
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    createChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    initialSavings,
    annualContribution,
    growthRate,
    withdrawalRate,
  ]);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white">
      {/* Chart */}
      <div className="bg-gray-50 p-4 rounded-lg relative" style={{ height: "500px" }}>
        <canvas ref={chartRef}></canvas>
        <ChartOverlay chartId="retirementChart" chartInstance={chartInstance} />
      </div>
    </div>
  );
};

export default RetirementChart;
