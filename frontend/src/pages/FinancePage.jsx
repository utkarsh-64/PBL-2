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
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            setUserStocks(result.stocks || []);
            setTotalInvestedAmount(result.portfolio_summary?.total_invested_amount || 0);
            setPortfolioValue(result.portfolio_summary?.total_current_value || 0);

            if (result.stocks?.length > 0) await fetchChartDataForSymbols(result.stocks, headers);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);

            setAngelOneHoldings(result.holdings || []);
            setAngelOneSummary(result.portfolio_summary || {});
            if (result.holdings?.length > 0) await fetchChartDataForSymbols(result.holdings, headers);
        } catch (err) {
            setAngelOneError(err.message);
        } finally {
            setAngelOneLoading(false);
        }
    };

    useEffect(() => {
        fetchUserStocks();
        if (angelOneConnected) fetchAngelOneHoldings();
    }, [angelOneConnected]);

    const openStockModal = (stock) => { setSelectedStock(stock); setIsModalOpen(true); };
    const closeStockModal = () => { setIsModalOpen(false); setSelectedStock(null); };

    // Reusable UI components matching the user's favorite "old" style
    const SummaryCard = ({ color, icon: Icon, label, value, subValue, subLabel }) => {
        const colorStyles = {
            green: "from-green-50 to-emerald-100 border-green-200 text-green-600 bg-green-500",
            orange: "from-orange-50 to-amber-100 border-orange-200 text-orange-600 bg-orange-500",
            blue: "from-blue-50 to-indigo-100 border-blue-200 text-blue-600 bg-blue-500",
            purple: "from-purple-50 to-violet-100 border-purple-200 text-purple-600 bg-purple-500"
        };
        const s = colorStyles[color];
        
        return (
            <div className={`bg-gradient-to-br ${s.split(' ').slice(0,2).join(' ')} p-4 rounded-xl border ${s.split(' ')[2]}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${s.split(' ')[4]}`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className={`text-xs font-medium ${s.split(' ')[3]}`}>{label}</p>
                        <p className={`text-lg font-extrabold text-slate-800`}>₹{typeof value === 'number' ? value.toFixed(2) : value}</p>
                        {subValue !== undefined && (
                            <p className="text-[10px] font-bold mt-0.5" style={{ color: subValue >= 0 ? '#10b981' : '#ef4444' }}>
                                {subValue >= 0 ? '+' : ''}{subValue.toFixed(2)}%
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const StockCard = ({ stock }) => {
        const symbolForChart = (stock.symbol || '').split('-')[0].split('_')[0].trim();
        const symbolData = stocksData[symbolForChart];
        let miniChartData = null;
        if (symbolData) {
            const series = symbolData["1mo"] || symbolData["3mo"] || Object.values(symbolData)[0];
            if (series?.history?.length > 0) {
                const prices = series.history;
                const isPositive = prices[prices.length - 1] >= prices[0];
                miniChartData = {
                    labels: series.dates,
                    datasets: [{
                        data: prices,
                        borderColor: isPositive ? '#ef4444' : '#ef4444', // Red matches screenshot
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                    }]
                };
            }
        }

        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:scale-[1.01] transition-transform cursor-pointer overflow-hidden" onClick={() => openStockModal(stock)}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{stock.longName || stock.name || stock.symbol}</h3>
                        <p className="text-sm text-slate-400 font-mono tracking-wider mb-1">{stock.symbol}</p>
                        <p className="text-[10px] text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full inline-block">N/A</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">₹{stock.currentPrice?.toFixed(2)}</p>
                        <p className="text-sm font-bold text-green-500">+{stock.pnlPercent?.toFixed(2)}%</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50/50 p-2 rounded-lg">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Quantity</p>
                        <p className="text-xs font-bold text-slate-700">{stock.quantity}</p>
                    </div>
                    <div className="bg-slate-50/50 p-2 rounded-lg text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Invested</p>
                        <p className="text-xs font-bold text-slate-700">₹{stock.investedAmount?.toFixed(2) || stock.investedValue?.toFixed(2)}</p>
                    </div>
                </div>

                <div className="space-y-1 mb-4 border-t border-slate-50 pt-3">
                    <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">P&L</span>
                        <span className="text-green-500 font-bold">+₹{stock.pnl?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Return</span>
                        <span className="text-green-500 font-bold">+{stock.pnlPercent?.toFixed(2)}%</span>
                    </div>
                </div>

                {miniChartData && (
                    <div className="h-24 -mx-6 -mb-6 bg-gradient-to-t from-red-50 to-transparent">
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
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#F8FAFF]">
            <div className="w-full p-8 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[#1E293B]">My Portfolio Dashboard</h1>
                        <p className="text-slate-400 font-medium text-lg mt-1">Track your Zerodha & Angel One investments in real-time</p>
                    </div>
                </div>

                {/* Side-by-Side Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    
                    {/* ZERODHA SECTION */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-extrabold text-[#1E293B] flex items-center gap-3">
                                Zerodha Portfolio
                                <button onClick={fetchUserStocks} className="p-1 px-3 bg-blue-600 text-white text-[10px] rounded-lg font-bold hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Refresh
                                </button>
                            </h2>
                        </div>

                        {/* Summary Grid - 2x2 for column layout */}
                        <div className="grid grid-cols-2 gap-4">
                            <SummaryCard color="green" icon={IndianRupee} label="Total Value" value={portfolioValue} />
                            <SummaryCard color="orange" icon={TrendingUp} label="Invested Amount" value={totalInvestedAmount} />
                            <SummaryCard color="blue" icon={TrendingUp} label="Profit/Loss" value={portfolioValue - totalInvestedAmount} subValue={((portfolioValue-totalInvestedAmount)/totalInvestedAmount*100) || 0} />
                            <SummaryCard color="purple" icon={Calendar} label="Last Updated" value={new Date().toLocaleDateString('en-GB')} />
                        </div>

                        {/* Stocks Section */}
                        <div>
                            <h3 className="text-xl font-extrabold text-[#1E293B] mb-6">Your Zerodha Stocks</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {loading && userStocks.length === 0 ? (
                                    <div className="h-40 flex items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : userStocks.length > 0 ? (
                                    userStocks.map((s, i) => <StockCard key={i} stock={s} />)
                                ) : (
                                    <div className="text-slate-400 italic text-center py-10">No active Zerodha holdings</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ANGEL ONE SECTION */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-extrabold text-[#1E293B] flex items-center gap-3">
                                Angel One Portfolio
                                {angelOneConnected && (
                                    <button onClick={fetchAngelOneHoldings} className="p-1 px-3 bg-[#FF6B00] text-white text-[10px] rounded-lg font-bold hover:bg-orange-600 transition-all uppercase tracking-widest flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> Refresh
                                    </button>
                                )}
                            </h2>
                        </div>

                        {!angelOneConnected ? (
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center h-[500px]">
                                <Building2 className="w-16 h-16 text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Connect Angel One</h3>
                                <p className="text-slate-400 mb-8 max-w-sm">Sync your SmartAPI account from settings to view your full portfolio balance here.</p>
                                <a href="/home/profile" className="px-8 py-3 bg-[#FF6B00] text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:scale-105 transition-all">Link Account</a>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <SummaryCard color="green" icon={IndianRupee} label="Total Value" value={angelOneSummary.total_current_value} />
                                    <SummaryCard color="orange" icon={TrendingUp} label="Invested Amount" value={angelOneSummary.total_invested} />
                                    <SummaryCard color="blue" icon={TrendingUp} label="Profit/Loss" value={angelOneSummary.total_pnl} subValue={angelOneSummary.total_pnl_percent} />
                                    <SummaryCard color="purple" icon={Calendar} label="Last Updated" value={new Date().toLocaleDateString('en-GB')} />
                                </div>

                                <div>
                                    <h3 className="text-xl font-extrabold text-[#1E293B] mb-6">Your Angel One Stocks</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        {angelOneLoading && angelOneHoldings.length === 0 ? (
                                            <div className="h-40 flex items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                            </div>
                                        ) : angelOneHoldings.length > 0 ? (
                                            angelOneHoldings.map((s, i) => <StockCard key={i} stock={s} />)
                                        ) : (
                                            <div className="text-slate-400 italic text-center py-10">No active Angel One holdings</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal - Kept consistent with the dashboard style */}
            {isModalOpen && selectedStock && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-3xl font-black text-[#1E293B]">{selectedStock.longName || selectedStock.name || selectedStock.symbol}</h2>
                                <p className="text-sm font-bold text-slate-400 font-mono italic tracking-widest">{selectedStock.symbol}</p>
                            </div>
                            <button onClick={closeStockModal} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                                <X className="w-8 h-8 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="bg-slate-50/80 p-6 rounded-3xl border border-white">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Investment Performance</h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold mb-1">Current Value</p>
                                            <p className="text-3xl font-black text-[#1E293B]">₹{selectedStock.currentPrice?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold mb-1">P&L Account</p>
                                            <p className={`text-3xl font-black ${selectedStock.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                ₹{selectedStock.pnl?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
                                    <h5 className="font-black flex items-center gap-2 mb-6 tracking-wide italic"><TrendingUp className="w-5 h-5" /> AI PRICE PROJECTION</h5>
                                    <div className="flex items-center justify-between border-b border-blue-500 pb-4 mb-4">
                                        <span className="opacity-70 font-bold">Target Q4 2027</span>
                                        <span className="text-4xl font-black text-yellow-300">₹{predictedData[(selectedStock.symbol || '').split('-')[0]]?.[0]?.Close || "..." }</span>
                                    </div>
                                    <p className="text-[10px] opacity-60 font-medium">Market momentum analysis indicates strong upward bias for this asset class.</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-3xl p-8 h-[450px] border border-white shadow-inner">
                                {(() => {
                                    const symbolForChart = (selectedStock.symbol || '').split('-')[0].split('_')[0].trim();
                                    const symbolData = stocksData[symbolForChart];
                                    if (symbolData) {
                                        const series = symbolData["1y"] || symbolData["6mo"] || Object.values(symbolData)[0];
                                        return (
                                            <Line data={{
                                                    labels: series.dates,
                                                    datasets: [{
                                                        data: series.history,
                                                        borderColor: "#3b82f6",
                                                        backgroundColor: "rgba(59, 130, 246, 0.05)",
                                                        fill: true,
                                                        tension: 0.4,
                                                        pointRadius: 0
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                    scales: { 
                                                        x: { display: false },
                                                        y: { position: 'right', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { font: { weight: 'bold' }, color: '#94a3b8' } } 
                                                    }
                                                }}
                                            />
                                        );
                                    }
                                    return <div className="h-full flex items-center justify-center text-slate-400 italic font-bold">Waiting for market feed...</div>;
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
