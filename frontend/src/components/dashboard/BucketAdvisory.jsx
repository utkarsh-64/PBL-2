import React, { useState, useCallback } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Loader2, AlertTriangle, Shield, TrendingUp, Banknote, CheckCircle2, Zap } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';

const STATUS_STYLES = {
  good: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
};

const BUCKET_STYLES = [
  { icon: <Shield className="w-5 h-5" />, gradient: 'from-green-500 to-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { icon: <Banknote className="w-5 h-5" />, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { icon: <TrendingUp className="w-5 h-5" />, gradient: 'from-purple-500 to-pink-600', bg: 'bg-purple-50', border: 'border-purple-200' },
];

/**
 * BucketAdvisory
 *
 * Displays the 3-bucket investment plan with actionable items.
 *
 * Props:
 *   corpus          {number}  — total pension corpus in ₹
 *   riskProfile     {string}  — "Conservative" | "Moderate" | "Aggressive"
 *   selectedScenario {string} — "lump-sum" | "annuity" | "phased"
 */
const BucketAdvisory = ({ corpus, riskProfile = 'Moderate', selectedScenario = 'phased' }) => {
  const [open, setOpen] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdvisory = useCallback(async () => {
    if (advisory) {
      setOpen((prev) => !prev);
      return;
    }

    setOpen(true);
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/ai/bucket-advisory/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          corpus: corpus || 10000000,
          risk_profile: riskProfile,
          selected_scenario: selectedScenario,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch advisory');

      const data = await response.json();
      if (data.advisory && !data.advisory.error) {
        setAdvisory(data.advisory);
      } else {
        setError(data.advisory?.error || 'Could not generate advisory.');
      }
    } catch (err) {
      setError('Could not load investment advisory. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [corpus, riskProfile, selectedScenario, advisory]);

  const status = advisory?.health_check?.status || 'good';
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.good;

  return (
    <div className="mt-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-indigo-50/40 overflow-hidden shadow-sm">
      {/* Toggle button */}
      <button
        onClick={fetchAdvisory}
        id="bucket-advisory-toggle"
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-violet-50/80 transition-all duration-200"
      >
        <span className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-violet-800">AI Investment Advisory</div>
            <div className="text-xs text-violet-500">Get your personalised 3-Bucket investment plan</div>
          </div>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-violet-500" /> : <ChevronDown className="w-4 h-4 text-violet-500" />}
      </button>

      {/* Collapsible panel */}
      {open && (
        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-violet-100 mb-4" />

          {loading && (
            <div className="flex items-center gap-2 text-violet-600 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>FinScope AI is building your investment plan…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {advisory && !loading && (
            <div className="space-y-4">
              {/* Summary */}
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {advisory.summary}
              </p>

              {/* Health check */}
              <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border text-sm ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                {statusStyle.icon}
                <span>{advisory.health_check?.message}</span>
              </div>

              {/* ── What is the 3-Bucket Plan? ────────────────────── */}
              <div className="bg-white/80 border border-violet-100 rounded-xl p-4 text-xs text-gray-600 leading-relaxed space-y-2">
                <div className="font-bold text-violet-800 text-sm mb-1">🪣 What is the 3-Bucket Plan?</div>
                <p>
                  Think of your retirement savings like three buckets. Each bucket has a different job to do, and together they make sure you never run out of money — no matter how long you live.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span><strong className="text-emerald-700">Safety Bucket (0–3 yrs):</strong> This is your emergency cash. Kept in safe, easily accessible places like a savings account or short-term deposits. It covers your first 3 years of expenses so you're never forced to sell investments at a bad time.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span><strong className="text-blue-700">Income Bucket (3–7 yrs):</strong> This money is invested in moderate, stable instruments like bonds or debt funds. It grows slowly but steadily, and gets moved into Bucket 1 as you spend it down.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span><strong className="text-purple-700">Growth Bucket (7+ yrs):</strong> This money works hard in the stock market. Since you won't need it for years, it has time to recover from any market dips — and it beats inflation over the long run.</span>
                  </div>
                </div>
              </div>

              {/* Bucket cards */}
              <div className="space-y-3">
                {(advisory.buckets || []).map((bucket, idx) => {
                  const style = BUCKET_STYLES[idx] || BUCKET_STYLES[0];
                  return (
                    <div key={idx} className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-sm`}>
                            {style.icon}
                          </div>
                          <span className="text-sm font-bold text-gray-800">{bucket.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-600">{bucket.allocation_percent}%</div>
                          <div className="text-xs text-gray-500">{bucket.amount}</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{bucket.why}</p>
                      <div className="flex flex-wrap gap-1">
                        {(bucket.where_to_invest || []).map((instrument, i) => (
                          <span key={i} className="text-xs bg-white/70 border border-gray-200 rounded-full px-2 py-0.5 text-gray-700">
                            {instrument}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Immediate actions */}
              {advisory.immediate_actions?.length > 0 && (
                <div className="bg-white/70 rounded-xl border border-violet-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-bold text-violet-800">Your Next Steps</span>
                  </div>
                  <ol className="space-y-1">
                    {advisory.immediate_actions.map((action, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tax tip */}
              {advisory.tax_tip && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-800">
                  <span className="font-bold">💡 Tax Tip: </span>{advisory.tax_tip}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BucketAdvisory;
