import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { BarChart3, Info, Loader2, TrendingUp, TrendingDown, IndianRupee, Building2, Calendar, X, ExternalLink } from 'lucide-react';
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
    const [stocksData, setStocksData] = useState({});
    const [predictedData, setPredictedData] = useState({});
    const [angelOneConnected] = useState(
        () => sessionStorage.getItem('angelone_connected') === 'true'
    );
    const [angelOneHoldings, setAngelOneHoldings] = useState([]);
    const [angelOneLoading, setAngelOneLoading] = useState(false);
    const [angelOneError, setAngelOneError] = useState('');
    const [angelOneSummary, setAngelOneSummary] = useState({
        total_current_value: 0,
        total_invested: 0,
        total_pnl: 0,
        total_pnl_percent: 0
    });

    // Helper to fetch chart/prediction data for any list of stocks
    const fetchChartDataForSymbols = async (stocks, currentHeaders) => {
        if (!stocks || stocks.length === 0) return;
        
        // Clean symbols (remove -EQ, -BE etc for Angel One lookup)
        const symbols = stocks.map(s => {
            const sym = s.symbol || '';
            return sym.split('-')[0].split('_')[0].trim();
        });

        try {
            const [chartRes, predRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/financial/stocks/`, {
                    method: 'POST',
                    headers: currentHeaders,
                    body: JSON.stringify({ symbols }),
                    credentials: 'include',
                }),
                fetch(`${API_BASE_URL}/api/financial/stocks/predictions/`, {
                    method: 'POST',
                    headers: currentHeaders,
                    body: JSON.stringify({ symbols }),
                    credentials: 'include',
                })
            ]);

            if (chartRes.ok) {
                const chartResult = await chartRes.json();
                setStocksData(prev => ({ ...prev, ...(chartResult.data || {}) }));
            }
            if (predRes.ok) {
                const predResult = await predRes.json();
                setPredictedData(prev => ({ ...prev, ...(predResult || {}) }));
            }
        } catch (e) {
            console.error("Error fetching live chart or prediction data:", e);
        }
    };

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
                const totalValue = result.stocks?.reduce((sum, stock) => sum + (stock.currentPrice || 0), 0) || 0;
                setPortfolioValue(totalValue);
            }

            // Fetch extra data for Zerodha stocks
            if (result.stocks && result.stocks.length > 0) {
                await fetchChartDataForSymbols(result.stocks, headers);
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user stocks on component mount
    useEffect(() => {
        fetchUserStocks();
    }, []);

    // Fetch Angel One holdings
    const fetchAngelOneHoldings = async () => {
        try {
            setAngelOneLoading(true);
            setAngelOneError('');

            let token = localStorage.getItem("token");
            if (!token) {
                const cookies = document.cookie.split(';');
                const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
                if (tokenCookie) token = tokenCookie.split('=')[1];
            }

            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/api/financial/angelone/holdings/`, {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error(
                    response.status === 503
                        ? 'Backend is still deploying. Please retry in a moment.'
                        : `Backend returned an unexpected response (HTTP ${response.status}). Please reconnect Angel One from Settings.`
                );
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }

            setAngelOneHoldings(result.holdings || []);
            setAngelOneSummary(result.portfolio_summary || {});

            // Fetch extra data for Angel One stocks
            if (result.holdings && result.holdings.length > 0) {
                await fetchChartDataForSymbols(result.holdings, headers);
            }
        } catch (err) {
            setAngelOneError(err.message);
        } finally {
            setAngelOneLoading(false);
        }
    };

    useEffect(() => {
        if (angelOneConnected) fetchAngelOneHoldings();
    }, [angelOneConnected]);

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

    // Resolve a time series from backend data for a given stock's symbol
    const getLocalSeriesForStock = (stock) => {
        const symbolForChart = (stock.symbol || '').split('-')[0].split('_')[0].trim();
        const symbolData = stocksData[symbolForChart];
        if (!symbolData) return null;
        
        const series = symbolData["1y"] || symbolData["6mo"] || symbolData["3mo"] || Object.values(symbolData)[0];
        if (!series || !series.history) return null;
        
        return { key: symbolForChart, series };
    };

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

    // Shared Stock Card Component
    const StockCard = ({ stock }) => {
        const symbolForChart = (stock.symbol || '').split('-')[0].split('_')[0].trim();
        const symbolData = stocksData[symbolForChart];
        
        let miniChartData = null;
        if (symbolData) {
            const series = symbolData["1mo"] || symbolData["3mo"] || Object.values(symbolData)[0];
            if (series && series.history && series.history.length > 0) {
                const prices = series.history;
                const isPositive = prices[prices.length - 1] >= prices[0];
                miniChartData = {
                    labels: series.dates,
                    datasets: [{
                        data: prices,
                        borderColor: isPositive ? '#10b981' : '#ef4444',
                        backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 2,
                    }]
                };
            }
        }

        return (
            <div
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                onClick={() => openStockModal(stock)}
            >
                <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 truncate">
                            {stock.longName || stock.name || stock.symbol}
                        </h3>
                        <p className="text-sm text-slate-500 font-mono">{stock.symbol}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">₹{stock.currentPrice?.toFixed(2)}</p>
                        <p className={`text-sm font-semibold ${stock.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.pnlPercent >= 0 ? '+' : ''}{stock.pnlPercent?.toFixed(2)}%
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-slate-500">Qty</p>
                        <p className="font-bold text-slate-700">{stock.quantity}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-slate-500">Value</p>
                        <p className="font-bold text-slate-700">₹{stock.currentValue?.toFixed(2)}</p>
                    </div>
                </div>

                {miniChartData ? (
                    <div className="h-20 mb-3">
                        <Line
                            data={miniChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                scales: { x: { display: false }, y: { display: false } },
                                elements: { line: { borderWidth: 2 } },
                            }}
                        />
                    </div>
                ) : (
                    <div className="h-20 mb-3 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                    </div>
                )}

                <div className="flex items-center justify-center text-blue-600 text-xs font-medium opacity-Group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3 mr-1" /> View Analysis
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="w-full p-6">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-700 to-blue-800 rounded-2xl shadow-xl shadow-indigo-100">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terminal Portfolio</h1>
                            <p className="text-slate-500 font-medium">Synced across Zerodha &amp; Angel One</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <button 
                            onClick={() => { fetchUserStocks(); if(angelOneConnected) fetchAngelOneHoldings(); }} 
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
                         >
                            <Loader2 className={`w-4 h-4 ${loading || angelOneLoading ? 'animate-spin' : ''}`} />
                            Sync All
                         </button>
                    </div>
                </div>

                {/* Main 2-Column Side-by-Side Layout */}
                <div className="flex flex-col xl:flex-row gap-8 items-start">
                    
                    {/* LEFT COLUMN: Zerodha */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>
                             <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Zerodha</h2>
                                <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">LIVE KITE CONNECT</p>
                             </div>
                        </div>

                        {/* Zerodha Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                             <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Portfolio Value</p>
                                    <h3 className="text-4xl font-extrabold text-slate-900">₹{portfolioValue?.toLocaleString()}</h3>
                                </div>
                                <div className="text-right">
                                    <p title="Realized + Unrealized P&L" className={`text-xl font-bold ${portfolioValue >= totalInvestedAmount ? 'text-green-600' : 'text-red-600'}`}>
                                        {portfolioValue >= totalInvestedAmount ? '+' : ''}₹{(portfolioValue - totalInvestedAmount).toFixed(2)}
                                    </p>
                                    <div className={`text-xs font-black inline-block px-2 py-1 rounded-lg ${portfolioValue >= totalInvestedAmount ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {portfolioValue >= totalInvestedAmount ? '+' : ''}{((portfolioValue - totalInvestedAmount) / totalInvestedAmount * 100 || 0).toFixed(2)}%
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Zerodha Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loading && userStocks.length === 0 ? (
                                <div className="col-span-full h-40 bg-white rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : userStocks.length > 0 ? (
                                userStocks.map((stock, idx) => <StockCard key={idx} stock={stock} />)
                            ) : (
                                <div className="col-span-full h-40 bg-white rounded-2xl flex items-center justify-center border border-dashed border-slate-200 italic text-slate-400">
                                    No Zerodha holdings found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Angel One */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-1.5 h-8 bg-orange-500 rounded-full shadow-lg shadow-orange-200"></div>
                             <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Angel One</h2>
                                <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block">LIVE SMARTAPI</p>
                             </div>
                        </div>

                        {/* Angel One Summary */}
                        {!angelOneConnected ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center justify-center h-28">
                                <a href="/home/profile" className="text-orange-600 font-bold hover:underline flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" /> Link Angel One Account
                                </a>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Portfolio Value</p>
                                        <h3 className="text-4xl font-extrabold text-slate-900">₹{angelOneSummary.total_current_value?.toLocaleString()}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${angelOneSummary.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {angelOneSummary.total_pnl >= 0 ? '+' : ''}₹{angelOneSummary.total_pnl?.toFixed(2)}
                                        </p>
                                        <div className={`text-xs font-black inline-block px-2 py-1 rounded-lg ${angelOneSummary.total_pnl >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {angelOneSummary.total_pnl >= 0 ? '+' : ''}{angelOneSummary.total_pnl_percent?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Angel One Grid */}
                        {angelOneConnected && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {angelOneLoading && angelOneHoldings.length === 0 ? (
                                    <div className="col-span-full h-40 bg-white rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    </div>
                                ) : angelOneHoldings.length > 0 ? (
                                    angelOneHoldings.map((stock, idx) => <StockCard key={idx} stock={stock} />)
                                ) : (
                                    <div className="col-span-full h-40 bg-white rounded-2xl flex items-center justify-center border border-dashed border-slate-200 italic text-slate-400">
                                        No Angel One holdings found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedStock && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-slate-100">
                        <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">{selectedStock.longName || selectedStock.name || selectedStock.symbol}</h2>
                                <p className="text-xs font-bold text-slate-400 font-mono italic">{selectedStock.symbol}</p>
                            </div>
                            <button onClick={closeStockModal} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Investment Performance</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500">Current Price</p>
                                            <p className="text-2xl font-black">₹{selectedStock.currentPrice?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">P&L Account</p>
                                            <p className={`text-2xl font-black ${selectedStock.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ₹{selectedStock.pnl?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
                                    <h5 className="font-bold flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4" /> AI Price Prediction</h5>
                                    <div className="flex items-center justify-between">
                                        <span className="opacity-80">Target Q4 2027</span>
                                        <span className="text-3xl font-black text-white">₹{predictedData[(selectedStock.symbol || '').split('-')[0]]?.[0]?.Close || "..." }</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-3xl p-6 h-[400px]">
                                {(() => {
                                    const resolved = getLocalSeriesForStock(selectedStock);
                                    if (resolved && resolved.series) {
                                        return (
                                            <Line 
                                                data={{
                                                    labels: resolved.series.dates,
                                                    datasets: [{
                                                        data: resolved.series.history,
                                                        borderColor: "#4f46e5",
                                                        backgroundColor: "rgba(79, 70, 229, 0.1)",
                                                        fill: true,
                                                        tension: 0.4,
                                                        pointRadius: 0
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                    scales: { x: { display: false }, y: { position: 'right', grid: { display: false } } }
                                                }}
                                            />
                                        );
                                    }
                                    return <div className="h-full flex items-center justify-center text-slate-400">Loading chart...</div>;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
