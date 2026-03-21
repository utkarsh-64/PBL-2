import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { BarChart3, Info, Loader2, TrendingUp, TrendingDown, IndianRupee, Building2, Calendar, X, ExternalLink } from 'lucide-react';
import stocksData from "../../public/data/stocks_data.json";
import predictedData from "../../public/data/predicted_price.json";
import { API_BASE_URL } from '../utils/constants';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const FinancePage = () => {
    const [userStocks, setUserStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [totalInvestedAmount, setTotalInvestedAmount] = useState(0);
    const [selectedStock, setSelectedStock] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch user's stock holdings from Zerodha
    const fetchUserStocks = async () => {
        try {
            setLoading(true);
            setError('');

            let token = localStorage.getItem("token");
            if (!token) {
                const cookies = document.cookie.split(';');
                const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
                if (tokenCookie) token = tokenCookie.split('=')[1];
            }

            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/api/financial/stocks/details/`, {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            setUserStocks(result.stocks || []);

            // Set portfolio summary data
            if (result.portfolio_summary) {
                setTotalInvestedAmount(result.portfolio_summary.total_invested_amount || 0);
                setPortfolioValue(result.portfolio_summary.total_current_value || 0);
            } else {
                // Fallback calculation for backward compatibility
                const totalValue = result.stocks?.reduce((sum, stock) => {
                    return sum + (stock.currentPrice || 0);
                }, 0) || 0;
                setPortfolioValue(totalValue);
            }

            // Historical chart data now sourced from local JSON only

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Backend chart fetching removed; charts now read from local stocks_data.json

    // Load user stocks on component mount
    useEffect(() => {
        fetchUserStocks();
    }, []);

    // Removed selected period logic tied to backend charts



    // Format percentage
    const formatPercentage = (current, previous) => {
        if (!current || !previous) return '0%';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    };

    // Get price change color
    const getPriceChangeColor = (current, previous) => {
        if (!current || !previous) return 'text-gray-500';
        return current >= previous ? 'text-green-600' : 'text-red-600';
    };

    // Resolve a time series from local JSON for a given stock's symbol
    const getLocalSeriesForStock = (stock) => {
        const raw = stock.originalSymbol || stock.symbol || '';
        const base = (raw || '').trim();
        const baseUpper = base.toUpperCase();
        const baseNoSuffix = baseUpper.replace(/\.(NS|BO)$/i, '');

        const candidates = [
            base,
            baseUpper,
            `${baseNoSuffix}.NS`,
            `${baseNoSuffix}.BO`,
            baseNoSuffix,
        ];

        for (const key of candidates) {
            if (stocksData[key]) return { key, series: stocksData[key] };
        }

        // Final fallback: try to find a key that starts with baseNoSuffix
        const fuzzyKey = Object.keys(stocksData).find(k => k.toUpperCase().startsWith(baseNoSuffix));
        if (fuzzyKey) return { key: fuzzyKey, series: stocksData[fuzzyKey] };

        return null;
    };

    // Removed unused createChartData; chart uses local JSON directly

    // Open stock modal
    const openStockModal = (stock) => {
        setSelectedStock(stock);
        setIsModalOpen(true);
    };

    // Close stock modal
    const closeStockModal = () => {
        setIsModalOpen(false);
        setSelectedStock(null);
    };

    return (
        <div className="w-[80%] h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto">
            <div className="w-full max-w-none p-6 overflow-y-auto" >
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                            My Portfolio Dashboard
                        </h1>
                        <p className="text-slate-600 text-lg mt-1">
                            Track your Zerodha investments and get real-time market insights
                        </p>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">Portfolio Overview</h2>
                        <button
                            onClick={fetchUserStocks}
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                            Refresh
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-lg">
                                    <IndianRupee className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Total Value</p>
                                    <p className="text-xl font-bold text-green-800">₹{portfolioValue?.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-xl border border-orange-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Invested Amount</p>
                                    <p className="text-xl font-bold text-orange-800">₹{totalInvestedAmount?.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${portfolioValue >= totalInvestedAmount ? 'bg-green-500' : 'bg-red-500'}`}>
                                    <TrendingUp className={`w-5 h-5 text-white ${portfolioValue < totalInvestedAmount ? 'rotate-180' : ''}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Profit/Loss</p>
                                    <p className={`text-xl font-bold ${portfolioValue >= totalInvestedAmount ? 'text-green-800' : 'text-red-800'}`}>
                                        {portfolioValue >= totalInvestedAmount ? '+' : ''}₹{(portfolioValue - totalInvestedAmount).toFixed(2)}
                                    </p>
                                    <p className={`text-xs font-medium ${portfolioValue >= totalInvestedAmount ? 'text-green-600' : 'text-red-600'}`}>
                                        {portfolioValue >= totalInvestedAmount ? '+' : ''}{((portfolioValue - totalInvestedAmount) / totalInvestedAmount * 100).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl border border-purple-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Last Updated</p>
                                    <p className="text-lg font-bold text-purple-800">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                        <p className="text-red-700 text-sm"><strong>Error:</strong> {error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-blue-600">Loading your portfolio...</span>
                    </div>
                )}

                {/* Stock Grid - 2 Column Layout */}
                {!loading && userStocks.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Your Stocks</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {userStocks.map((stock, index) => (
                                <div
                                    key={index}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                                    onClick={() => openStockModal(stock)}
                                >
                                    {/* Stock Header */}
                                    <div className="flex items-start justify-between mb-4 gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors ">
                                                {stock.longName}
                                            </h3>
                                            <p className="text-lg text-slate-600 font-mono">{stock.originalSymbol || stock.symbol}</p>
                                            {stock.sector && (
                                                <p className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full inline-block mt-1">
                                                    {stock.sector}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-slate-900">₹{stock.currentPrice?.toFixed(2)}</p>
                                            <p className={`text-lg font-semibold ${getPriceChangeColor(stock.currentPrice, stock.previousClose)}`}>
                                                {formatPercentage(stock.currentPrice, stock.previousClose)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 font-medium">Quantity</p>
                                            <p className="text-sm font-semibold text-slate-700">{stock.quantity || 'N/A'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 font-medium">Invested</p>
                                            <p className="text-sm font-semibold text-slate-700">₹{stock.investedAmount?.toFixed(2) || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Profit/Loss for this stock */}
                                    {stock.investedAmount && stock.currentValue && (
                                        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500 font-medium">P&L</span>
                                                <span className={`text-sm font-semibold ${stock.currentValue >= stock.investedAmount ? 'text-green-600' : 'text-red-600'}`}>
                                                    {stock.currentValue >= stock.investedAmount ? '+' : ''}₹{(stock.currentValue - stock.investedAmount).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-slate-500">Return</span>
                                                <span className={`text-sm font-semibold ${stock.currentValue >= stock.investedAmount ? 'text-green-600' : 'text-red-600'}`}>
                                                    {stock.currentValue >= stock.investedAmount ? '+' : ''}{((stock.currentValue - stock.investedAmount) / stock.investedAmount * 100).toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mini Chart from local JSON */}
                                    {(() => {
                                        const chartKey = stock.originalSymbol || stock.symbol;
                                        const series = stocksData[chartKey];
                                        if (!series || series.length === 0) return null;

                                        const dates = series.map((d) => d.Date.split(" ")[0]);
                                        const prices = series.map((d) => d.Close);
                                        const isPositive = prices[prices.length - 1] >= prices[0];

                                        const miniChartData = {
                                            labels: dates,
                                            datasets: [
                                                {
                                                    label: `${chartKey} Closing Price`,
                                                    data: prices,
                                                    borderColor: isPositive ? '#10b981' : '#ef4444',
                                                    backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    fill: true,
                                                    tension: 0.4,
                                                    pointRadius: 0,
                                                    pointHoverRadius: 2,
                                                },
                                            ],
                                        };

                                        return (
                                            <div className="h-28">
                                                <Line
                                                    data={miniChartData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                                                        scales: {
                                                            x: { display: false },
                                                            y: { display: false },
                                                        },
                                                        elements: { line: { borderWidth: 2 } },
                                                    }}
                                                />
                                            </div>
                                        );
                                    })()}

                                    {/* Click Indicator */}
                                    <div className="flex items-center justify-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Click to view details
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && userStocks.length === 0 && !error && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12 text-center">
                        <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Stocks Found</h3>
                        <p className="text-slate-500 mb-6">
                            It looks like you don't have any stock holdings in your Zerodha account, or there was an issue fetching your portfolio.
                        </p>
                        <button
                            onClick={fetchUserStocks}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Stock Detail Modal */}
            {isModalOpen && selectedStock && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-slate-900">{selectedStock.longName}</h2>
                                    <p className="text-xl text-slate-600 font-mono">{selectedStock.originalSymbol || selectedStock.symbol}</p>
                                    {selectedStock.sector && (
                                        <p className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block mt-2">
                                            {selectedStock.sector}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right ml-6">
                                    <p className="text-4xl font-bold text-slate-900">₹{selectedStock.currentPrice?.toFixed(2)}</p>
                                    <p className={`text-xl font-semibold ${getPriceChangeColor(selectedStock.currentPrice, selectedStock.previousClose)}`}>
                                        {formatPercentage(selectedStock.currentPrice, selectedStock.previousClose)}
                                    </p>
                                </div>
                                <button
                                    onClick={closeStockModal}
                                    className="ml-6 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Stock Details */}
                                <div className="space-y-6">
                                    {/* Key Metrics */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Metrics</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Quantity</p>
                                                <p className="text-lg font-semibold text-slate-700">{selectedStock.quantity || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Average Price</p>
                                                <p className="text-lg font-semibold text-slate-700">₹{selectedStock.averagePrice?.toFixed(2) || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Invested Amount</p>
                                                <p className="text-lg font-semibold text-slate-700">₹{selectedStock.investedAmount?.toFixed(2) || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Current Value</p>
                                                <p className="text-lg font-semibold text-slate-700">₹{selectedStock.currentValue?.toFixed(2) || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 52 Week Range */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">52 Week Range</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Low</span>
                                                <span className="text-lg font-semibold text-red-600">{selectedStock.fiftyTwoWeekLow}</span>
                                            </div>
                                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-green-500"
                                                    style={{
                                                        width: `${((selectedStock.currentPrice - selectedStock.fiftyTwoWeekLow) / (selectedStock.fiftyTwoWeekHigh - selectedStock.fiftyTwoWeekLow)) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">High</span>
                                                <span className="text-lg font-semibold text-green-600">{selectedStock.fiftyTwoWeekHigh}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-6 mt-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Predicted Price</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-md text-slate-600">Q4' 25</span>
                                            <span className="text-lg font-semibold text-blue-600">
                                                ₹{predictedData[selectedStock.symbol]?.[0]?.Close || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Performance Summary removed; backend-derived metrics no longer used */}
                                </div>

                                {/* Right Column - Chart */}
                                <div className="space-y-6">
                                    {/* Chart */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Price Chart</h3>
                                        {(() => {
                                            const resolved = getLocalSeriesForStock(selectedStock);
                                            if (resolved && resolved.series && resolved.series.length > 0) {
                                                const dates = resolved.series.map((d) => String(d.Date).split(" ")[0]);
                                                const prices = resolved.series.map((d) => d.Close);

                                                const chartData = {
                                                    labels: dates,
                                                    datasets: [
                                                        {
                                                            label: `${resolved.key} Closing Price`,
                                                            data: prices,
                                                            borderColor: "#3b82f6",
                                                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                                                            fill: true,
                                                            tension: 0.4,
                                                            pointRadius: 0,
                                                            pointHoverRadius: 4,
                                                        },
                                                    ],
                                                };

                                                return (
                                                    <div className="h-80">
                                                        <Line
                                                            data={chartData}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: { display: false },
                                                                    tooltip: {
                                                                        mode: "index",
                                                                        intersect: false,
                                                                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                                        titleColor: "white",
                                                                        bodyColor: "white",
                                                                    },
                                                                },
                                                                scales: {
                                                                    x: {
                                                                        grid: { color: "rgba(0,0,0,0.1)" },
                                                                        ticks: { color: "#64748b" },
                                                                    },
                                                                    y: {
                                                                        grid: { color: "rgba(0,0,0,0.1)" },
                                                                        ticks: { color: "#64748b" },
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-lg">
                                                    <div className="text-center">
                                                        <X className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                        <p className="text-slate-500">No chart data found in local file for this symbol.</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                    </div>

                                    {/* Additional Info */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Exchange</span>
                                                <span className="font-medium text-slate-900">NSE</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Last Updated</span>
                                                <span className="font-medium text-slate-900">{new Date().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
