import React, { useEffect } from 'react';
import { useChartHighlight } from '../context/ChartHighlightContext';

const ChartOverlay = ({ chartId = 'retirementChart', chartInstance }) => {
  const { highlights } = useChartHighlight();
  const chartHighlights = highlights[chartId] || {};

  useEffect(() => {
    if (chartInstance && chartInstance.current) {
      const chart = chartInstance.current;
      const canvas = chart.canvas;
      const ctx = canvas.getContext('2d');
      
      // Store original draw function if not already stored
      if (!chart._originalDraw) {
        chart._originalDraw = chart.draw;
      }
      
      // Override draw function to add highlights
      chart.draw = function() {
        // Call original draw first
        chart._originalDraw.call(this);
        
        // Add highlights on top
        if (chartHighlights.allLines) {
          addAllLinesGlow(ctx, chart);
        }
        if (chartHighlights.blueLine) {
          addBlueLineGlow(ctx, chart);
        }
        if (chartHighlights.greenLine) {
          addGreenLineGlow(ctx, chart);
        }
        if (chartHighlights.redLine) {
          addRedLineGlow(ctx, chart);
        }
        if (chartHighlights.curvePeaks) {
          addCurvePeaksHighlight(ctx, chart);
        }
        if (chartHighlights.growthPhase) {
          addGrowthPhaseHighlight(ctx, chart);
        }
        if (chartHighlights.withdrawalPhase) {
          addWithdrawalPhaseHighlight(ctx, chart);
        }
        if (chartHighlights.bothPhases) {
          addGrowthPhaseHighlight(ctx, chart);
          addWithdrawalPhaseHighlight(ctx, chart);
        }
        if (chartHighlights.lastTenYears) {
          addLastTenYearsHighlight(ctx, chart);
        }
      };
      
      // Trigger redraw
      chart.update('none');
    }
    
    return () => {
      // Cleanup: restore original draw function
      if (chartInstance && chartInstance.current && chartInstance.current._originalDraw) {
        try {
          chartInstance.current.draw = chartInstance.current._originalDraw;
          // Check if chart is still mounted before updating
          if (chartInstance.current.canvas && chartInstance.current.canvas.ownerDocument) {
            chartInstance.current.update('none');
          }
        } catch (error) {
          // Silently handle cleanup errors when component is unmounted
          console.warn('Chart cleanup error:', error);
        }
      }
    };
  }, [chartHighlights, chartInstance]);

  const addAllLinesGlow = (ctx, chart) => {
    // Highlight all three lines with subtle glow
    for (let datasetIndex = 0; datasetIndex < chart.data.datasets.length; datasetIndex++) {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta.data || meta.data.length === 0) continue;
      
      ctx.save();
      ctx.shadowColor = chart.data.datasets[datasetIndex].borderColor;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = chart.data.datasets[datasetIndex].borderColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;
      
      ctx.beginPath();
      for (let i = 0; i < meta.data.length; i++) {
        const point = meta.data[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }
  };

  const addBlueLineGlow = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0); // Base Case (Blue)
    if (!meta.data || meta.data.length === 0) return;
    
    ctx.save();
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.8;
    
    ctx.beginPath();
    for (let i = 0; i < meta.data.length; i++) {
      const point = meta.data[i];
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  const addGreenLineGlow = (ctx, chart) => {
    const meta = chart.getDatasetMeta(1); // Best Case (Green)
    if (!meta.data || meta.data.length === 0) return;
    
    ctx.save();
    ctx.shadowColor = '#16a34a';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.8;
    
    ctx.beginPath();
    for (let i = 0; i < meta.data.length; i++) {
      const point = meta.data[i];
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  const addRedLineGlow = (ctx, chart) => {
    const meta = chart.getDatasetMeta(2); // Worst Case (Red)
    if (!meta.data || meta.data.length === 0) return;
    
    ctx.save();
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.8;
    
    ctx.beginPath();
    for (let i = 0; i < meta.data.length; i++) {
      const point = meta.data[i];
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  const addCurvePeaksHighlight = (ctx, chart) => {
    // Find and highlight peak points for each dataset
    for (let datasetIndex = 0; datasetIndex < chart.data.datasets.length; datasetIndex++) {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta.data || meta.data.length === 0) continue;
      
      // Find peak (maximum value)
      let peakIndex = 0;
      let peakValue = chart.data.datasets[datasetIndex].data[0];
      
      for (let i = 1; i < chart.data.datasets[datasetIndex].data.length; i++) {
        if (chart.data.datasets[datasetIndex].data[i] > peakValue) {
          peakValue = chart.data.datasets[datasetIndex].data[i];
          peakIndex = i;
        }
      }
      
      const peakPoint = meta.data[peakIndex];
      
      ctx.save();
      const time = Date.now() * 0.005;
      const pulseRadius = 8 + Math.sin(time + datasetIndex) * 2;
      
      ctx.strokeStyle = chart.data.datasets[datasetIndex].borderColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7 + Math.sin(time + datasetIndex) * 0.3;
      
      ctx.beginPath();
      ctx.arc(peakPoint.x, peakPoint.y, pulseRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.restore();
    }
  };

  const addRedDotPulse = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || meta.data.length === 0) return;
    
    // Find retirement point by checking actual chart configuration
    const dataset = chart.data.datasets[0];
    let retirementIndex = -1;
    
    // Look for the point with larger radius (retirement point)
    for (let i = 0; i < meta.data.length; i++) {
      if (typeof dataset.pointRadius === 'function') {
        const radius = dataset.pointRadius({ dataIndex: i });
        if (radius === 6) {
          retirementIndex = i;
          break;
        }
      }
    }
    
    if (retirementIndex === -1) {
      retirementIndex = Math.floor(meta.data.length * 0.6);
    }
    
    const point = meta.data[retirementIndex];
    
    ctx.save();
    // Pulsing ring effect - perfectly centered on existing dot
    const time = Date.now() * 0.005;
    const pulseRadius = 10 + Math.sin(time) * 3;
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7 + Math.sin(time) * 0.3;
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, pulseRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.restore();
  };

  const addGrowthPhaseHighlight = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || meta.data.length === 0) return;
    
    // Find peak dynamically for base case
    let peakIndex = 0;
    let peakValue = chart.data.datasets[0].data[0];
    
    for (let i = 1; i < chart.data.datasets[0].data.length; i++) {
      if (chart.data.datasets[0].data[i] > peakValue) {
        peakValue = chart.data.datasets[0].data[i];
        peakIndex = i;
      }
    }
    
    const chartArea = chart.chartArea;
    
    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Draw vertical line at peak (end of growth phase)
    const peakPoint = meta.data[peakIndex];
    ctx.beginPath();
    ctx.moveTo(peakPoint.x, chartArea.top);
    ctx.lineTo(peakPoint.x, chartArea.bottom);
    ctx.stroke();
    
    // Add background highlight for growth area (left of peak)
    ctx.fillRect(chartArea.left, chartArea.top, peakPoint.x - chartArea.left, chartArea.height);
    
    ctx.restore();
  };

  const addWithdrawalPhaseHighlight = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || meta.data.length === 0) return;
    
    // Find peak dynamically for base case
    let peakIndex = 0;
    let peakValue = chart.data.datasets[0].data[0];
    
    for (let i = 1; i < chart.data.datasets[0].data.length; i++) {
      if (chart.data.datasets[0].data[i] > peakValue) {
        peakValue = chart.data.datasets[0].data[i];
        peakIndex = i;
      }
    }
    
    const chartArea = chart.chartArea;
    
    ctx.save();
    ctx.fillStyle = 'rgba(249, 115, 22, 0.1)';
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Draw vertical line at peak (start of withdrawal phase)
    const peakPoint = meta.data[peakIndex];
    ctx.beginPath();
    ctx.moveTo(peakPoint.x, chartArea.top);
    ctx.lineTo(peakPoint.x, chartArea.bottom);
    ctx.stroke();
    
    // Add background highlight for withdrawal area (right of peak)
    ctx.fillRect(peakPoint.x, chartArea.top, chartArea.right - peakPoint.x, chartArea.height);
    
    ctx.restore();
  };

  const addLastTenYearsHighlight = (ctx, chart) => {
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || meta.data.length === 0) return;
    
    // Find retirement point (peak) dynamically
    let peakIndex = 0;
    let peakValue = chart.data.datasets[0].data[0];
    
    for (let i = 1; i < chart.data.datasets[0].data.length; i++) {
      if (chart.data.datasets[0].data[i] > peakValue) {
        peakValue = chart.data.datasets[0].data[i];
        peakIndex = i;
      }
    }
    
    // Calculate 10 years before retirement (assuming each data point is 1 year)
    const tenYearsBeforeIndex = Math.max(0, peakIndex - 10);
    
    const chartArea = chart.chartArea;
    
    ctx.save();
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)'; // Purple highlight
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    
    // Get x positions for the 10-year range
    const startPoint = meta.data[tenYearsBeforeIndex];
    const endPoint = meta.data[peakIndex];
    
    // Draw vertical lines to mark the range
    ctx.beginPath();
    ctx.moveTo(startPoint.x, chartArea.top);
    ctx.lineTo(startPoint.x, chartArea.bottom);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(endPoint.x, chartArea.top);
    ctx.lineTo(endPoint.x, chartArea.bottom);
    ctx.stroke();
    
    // Add background highlight for the last 10 years
    ctx.fillRect(startPoint.x, chartArea.top, endPoint.x - startPoint.x, chartArea.height);
    
    // Add label
    ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    const labelX = (startPoint.x + endPoint.x) / 2;
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText('Last 10 Years', labelX, chartArea.top + 8);
    ctx.fillText('before retirement', labelX, chartArea.top + 20);
    
    ctx.restore();
  };


  return null; // No DOM elements needed
};

export default ChartOverlay;
