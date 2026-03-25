import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';
import { API_BASE_URL } from '../../utils/constants';

/**
 * AIInsightCard
 *
 * A reusable "Explain this chart" button + collapsible insight panel.
 * Automatically re-fetches when chartData changes (real-time dashboard inputs).
 *
 * Props:
 *   chartType  {string}  — Human-readable name of the chart
 *   chartData  {string}  — Key numbers from the chart as a plain text summary.
 *                          When this string changes, the insight is auto-refreshed.
 */
const AIInsightCard = ({ chartType, chartData }) => {
  const [open, setOpen]       = useState(false);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [stale, setStale]     = useState(false); // true when inputs changed after last fetch

  // Track the chartData that was used for the current insight
  const lastFetchedData = useRef('');

  // When chartData changes after an insight has already been loaded, mark it stale
  useEffect(() => {
    if (insight && chartData !== lastFetchedData.current) {
      setStale(true);
    }
  }, [chartData, insight]);

  const fetchInsight = useCallback(async () => {
    // If panel is open and data hasn't changed, just toggle closed
    if (open && !stale && insight) {
      setOpen(false);
      return;
    }

    setOpen(true);
    setLoading(true);
    setError('');
    setStale(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/ai/chart-insight/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chart_type: chartType, chart_data: chartData }),
      });

      if (!response.ok) throw new Error('Failed to fetch insight');

      const data = await response.json();
      setInsight(data.insight || 'No insight returned.');
      lastFetchedData.current = chartData;
    } catch (err) {
      setError('Could not load AI insight. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [chartType, chartData, open, stale, insight]);

  return (
    <div className="mt-3 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 overflow-hidden shadow-sm">
      {/* Toggle button */}
      <button
        onClick={fetchInsight}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50/80 transition-all duration-200"
        id={`ai-insight-toggle-${chartType?.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>
            AI Insight — What does this chart mean for you?
            {stale && (
              <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                Inputs changed · click to refresh
              </span>
            )}
          </span>
        </span>
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          : open && !stale
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
        }
      </button>

      {/* Collapsible content */}
      {open && (
        <div className="px-4 pb-5 text-sm text-gray-700">
          <div className="h-px bg-indigo-100 mb-4" />

          {loading && (
            <div className="flex items-center gap-2 text-indigo-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>FinScope AI is analysing your chart…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {insight && !loading && (
            <>
              {/* Detailed markdown output */}
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <Markdown
                  components={{
                    strong: ({ node, ...props }) => (
                      <strong className="text-indigo-800 font-semibold" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-3 text-gray-700" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside space-y-1 mb-3" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr className="border-indigo-100 my-3" {...props} />
                    ),
                  }}
                >
                  {insight}
                </Markdown>
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchInsight}
                className="mt-3 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate with latest data
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsightCard;
