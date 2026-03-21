import { useState, useEffect, useRef } from "react";
import * as Chart from "chart.js";

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

const InflationPredictionChart = ({ defaultPredictionYear = 2028 }) => {
  const [predictionYear, setPredictionYear] = useState(defaultPredictionYear);
  const [historicalData, setHistoricalData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Load historical data
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const response = await fetch("/data/inflation_data.json");
        const data = await response.json();
        setHistoricalData(data);
      } catch (err) {
        console.error("Error loading historical data:", err);
        setError("Failed to load historical data");
      }
    };

    loadHistoricalData();
  }, []);

  // Fetch prediction data
  const fetchPredictionData = async (year) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict-inflation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ year: year.toString() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPredictionData(data);
    } catch (err) {
      console.error("Error fetching prediction data:", err);
      setError(
        "Failed to fetch prediction data. Please ensure the prediction service is running."
      );
      // Set fallback prediction data for demo purposes
      setPredictionData(generateFallbackPrediction(year));
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback prediction data if API is not available
  const generateFallbackPrediction = (year) => {
    const currentYear = new Date().getFullYear();
    const yearsToPredict = year - currentYear;
    const fallbackData = [];

    for (let i = 1; i <= yearsToPredict * 12; i++) {
      const date = new Date(currentYear, i - 1, 1);
      const baseInflation = 4.5;
      const variation = Math.sin(i / 6) * 1.5 + Math.random() * 0.5 - 0.25;
      const predictedInflation = Math.max(1, baseInflation + variation);

      fallbackData.push({
        Date: date.toISOString(),
        Predicted_Inflation: predictedInflation,
      });
    }

    return fallbackData;
  };

  // Process data for chart
  const processChartData = () => {
    const historicalLabels = historicalData.map((item) => {
      const date = new Date(item.Date);
      return (
        date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0")
      );
    });

    const historicalValues = historicalData.map((item) => item.Inflation);

    const predictionLabels = predictionData.map((item) => {
      const date = new Date(item.Date);
      return (
        date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0")
      );
    });

    const predictionValues = predictionData.map(
      (item) =>
        item.Predicted_Inflation ||
        item.predicted_Inflation ||
        item.redicted_Inflation
    );

    // Combine labels and ensure chronological order
    const allLabels = [...historicalLabels, ...predictionLabels];
    const historicalDataset = [
      ...historicalValues,
      ...new Array(predictionLabels.length).fill(null),
    ];
    const predictionDataset = [
      ...new Array(historicalLabels.length).fill(null),
      ...predictionValues,
    ];

    return {
      labels: allLabels,
      datasets: [
        {
          label: "Historical Inflation (%)",
          data: historicalDataset,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: false,
          tension: 0.1,
          pointRadius: 1,
          pointHoverRadius: 4,
          borderWidth: 2,
        },
        {
          label: "Predicted Inflation (%)",
          data: predictionDataset,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: false,
          tension: 0.1,
          pointRadius: 1,
          pointHoverRadius: 4,
          borderWidth: 2,
          borderDash: [5, 5],
        },
      ],
    };
  };

  // Create or update chart
  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!historicalData.length) return;

    const ctx = chartRef.current.getContext("2d");
    const chartData = processChartData();

    chartInstance.current = new Chart.Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                if (value === null) return null;
                return `${context.dataset.label}: ${value.toFixed(2)}%`;
              },
            },
          },
          legend: {
            display: true,
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Time Period (Year-Month)",
            },
            ticks: {
              maxTicksLimit: 10,
              callback: function (value, index) {
                const label = this.getLabelForValue(value);
                // Show only yearly labels for better readability
                if (label && label.endsWith("-01")) {
                  return label.split("-")[0];
                }
                return "";
              },
            },
          },
          y: {
            title: {
              display: true,
              text: "Inflation Rate (%)",
            },
            beginAtZero: false,
            ticks: {
              callback: (value) => `${value.toFixed(1)}%`,
            },
          },
        },
      },
    });
  };

  // Update chart when data changes
  useEffect(() => {
    createChart();
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [historicalData, predictionData]);

  // Fetch prediction data on component mount and when prediction year changes
  useEffect(() => {
    if (historicalData.length > 0) {
      fetchPredictionData(predictionYear);
    }
  }, [predictionYear, historicalData]);

  // Calculate statistics
  const getStatistics = () => {
    if (!historicalData.length && !predictionData.length) return null;

    const historicalValues = historicalData.map((item) => item.Inflation);
    const predictionValues = predictionData
      .map(
        (item) =>
          item.Predicted_Inflation ||
          item.predicted_Inflation ||
          item.redicted_Inflation
      )
      .filter((val) => val !== undefined);

    const historicalAvg =
      historicalValues.length > 0
        ? historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length
        : 0;

    const predictionAvg =
      predictionValues.length > 0
        ? predictionValues.reduce((a, b) => a + b, 0) / predictionValues.length
        : 0;

    const historicalMax =
      historicalValues.length > 0 ? Math.max(...historicalValues) : 0;
    const historicalMin =
      historicalValues.length > 0 ? Math.min(...historicalValues) : 0;

    return {
      historicalAvg,
      predictionAvg,
      historicalMax,
      historicalMin,
      totalDataPoints: historicalValues.length + predictionValues.length,
    };
  };

  const stats = getStatistics();

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl mr-4 shadow-lg">
            📊
          </span>
          Inflation Prediction Analysis
        </h3>
        
        <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <label htmlFor="predictionYear" className="text-sm font-medium text-gray-700">
            Target Year:
          </label>
          <select 
            id="predictionYear"
            value={predictionYear}
            onChange={(e) => setPredictionYear(parseInt(e.target.value))}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer"
          >
            {[2025, 2026, 2027, 2028, 2029, 2030, 2035].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">
              Historical Average
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {stats.historicalAvg.toFixed(2)}%
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="text-sm text-red-600 font-medium mb-1">
              Predicted Average
            </div>
            <div className="text-2xl font-bold text-red-800">
              {stats.predictionAvg.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div
        className="bg-gray-50 p-4 rounded-xl mb-6"
        style={{ height: "400px" }}
      >
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          🔍 Analysis Insights
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          {stats && (
            <>
              <p className="flex items-start">
                <span className="text-blue-500 mr-2">📈</span>
                <span>
                  Historical inflation averaged {stats.historicalAvg.toFixed(2)}
                  % with peaks reaching {stats.historicalMax.toFixed(1)}% and
                  lows of {stats.historicalMin.toFixed(1)}%.
                </span>
              </p>
              <p className="flex items-start">
                <span className="text-red-500 mr-2">🔮</span>
                <span>
                  AI model predicts inflation will average{" "}
                  {stats.predictionAvg.toFixed(2)}% through {predictionYear},
                  {stats.predictionAvg > stats.historicalAvg
                    ? " indicating higher"
                    : " suggesting lower"}{" "}
                  inflation compared to historical trends.
                </span>
              </p>
              <p className="flex items-start">
                <span className="text-orange-500 mr-2">💡</span>
                <span>
                  For retirement planning, consider using{" "}
                  {Math.max(stats.historicalAvg, stats.predictionAvg).toFixed(
                    1
                  )}
                  % as your inflation assumption to ensure adequate corpus
                  growth.
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InflationPredictionChart;
