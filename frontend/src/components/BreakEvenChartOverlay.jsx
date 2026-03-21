import React, { useEffect } from 'react';
import { useChartHighlight } from '../context/ChartHighlightContext';

// Helper function to parse SVG path data into coordinate points
const parsePathData = (pathData) => {
  const points = [];
  const commands = pathData.match(/[ML][\d\.,\s-]+/g) || [];
  
  commands.forEach(command => {
    const type = command[0];
    const coords = command.slice(1).split(/[,\s]+/).filter(c => c).map(Number);
    
    if (type === 'M' || type === 'L') {
      for (let i = 0; i < coords.length; i += 2) {
        if (coords[i] !== undefined && coords[i + 1] !== undefined) {
          points.push({ x: coords[i], y: coords[i + 1] });
        }
      }
    }
  });
  
  return points;
};

// Helper function to find intersection point based on break-even year
const findIntersectionPoint = (bluePoints, greenPoints, breakEvenYear) => {
  if (!bluePoints.length || !greenPoints.length) return null;
  
  // Find the closest point index based on break-even year ratio
  const totalPoints = Math.min(bluePoints.length, greenPoints.length);
  const pointIndex = Math.floor((breakEvenYear / 30) * (totalPoints - 1)); // Assuming 30 years max
  const clampedIndex = Math.max(0, Math.min(pointIndex, totalPoints - 1));
  
  if (bluePoints[clampedIndex] && greenPoints[clampedIndex]) {
    // Interpolate between blue and green points at the break-even position
    const bluePoint = bluePoints[clampedIndex];
    const greenPoint = greenPoints[clampedIndex];
    
    return {
      x: (bluePoint.x + greenPoint.x) / 2,
      y: (bluePoint.y + greenPoint.y) / 2
    };
  }
  
  return null;
};

const BreakEvenChartOverlay = ({ chartId = 'breakEven', breakEvenData = null }) => {
  const { highlights } = useChartHighlight();
  const chartHighlights = highlights[chartId] || {};

  useEffect(() => {
    // Apply highlights to break even chart elements
    const applyHighlights = () => {
      // Get the chart container
      const chartContainer = document.querySelector('.recharts-wrapper');
      
      if (!chartContainer) return;

      // Remove all existing highlight classes and dots first
      chartContainer.classList.remove(
        'break-even-all-lines-highlight',
        'break-even-blue-line-highlight', 
        'break-even-green-line-highlight',
        'break-even-cross-point-highlight'
      );

      // Remove existing intersection dot
      const existingDot = chartContainer.querySelector('.break-even-intersection-dot');
      if (existingDot) {
        existingDot.remove();
      }

      // Apply highlights based on state
      if (chartHighlights.allLines) {
        chartContainer.classList.add('break-even-all-lines-highlight');
      }
      
      if (chartHighlights.blueLine) {
        chartContainer.classList.add('break-even-blue-line-highlight');
      }
      
      if (chartHighlights.greenLine) {
        chartContainer.classList.add('break-even-green-line-highlight');
      }
      
      if (chartHighlights.crossPoint && breakEvenData) {
        chartContainer.classList.add('break-even-cross-point-highlight');
        
        // Add intersection dot at the actual break-even point
        const chartArea = chartContainer.querySelector('.recharts-cartesian-grid');
        if (chartArea) {
          const dot = document.createElement('div');
          dot.className = 'break-even-intersection-dot';
          
          // Calculate precise position based on break-even data
          const chartRect = chartArea.getBoundingClientRect();
          const containerRect = chartContainer.getBoundingClientRect();
          
          let dotX = 0;
          let dotY = 0;
          
          // Get the actual data points from the chart
          const blueLine = chartContainer.querySelector('[stroke="#2563eb"]');
          const greenLine = chartContainer.querySelector('[stroke="#059669"]');
          
          if (blueLine && greenLine) {
            // Get the path data to find intersection point
            const bluePathData = blueLine.getAttribute('d');
            const greenPathData = greenLine.getAttribute('d');
            
            if (bluePathData && greenPathData) {
              // Parse path data to find coordinates
              const bluePoints = parsePathData(bluePathData);
              const greenPoints = parsePathData(greenPathData);
              
              // Find the intersection point based on break-even year
              const breakEvenYear = breakEvenData.year || 0;
              const intersectionPoint = findIntersectionPoint(bluePoints, greenPoints, breakEvenYear);
              
              if (intersectionPoint) {
                dotX = intersectionPoint.x - containerRect.left + chartRect.left - containerRect.left;
                dotY = intersectionPoint.y - containerRect.top + chartRect.top - containerRect.top;
              } else {
                // Fallback to estimated position
                const xAxisLabels = chartContainer.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick text');
                if (xAxisLabels.length > 0) {
                  const totalYears = xAxisLabels.length;
                  const xRatio = breakEvenYear / (totalYears - 1);
                  dotX = chartRect.left - containerRect.left + (chartRect.width * xRatio);
                  dotY = chartRect.top - containerRect.top + (chartRect.height * 0.5);
                }
              }
            }
          }
          
          dot.style.left = `${dotX}px`;
          dot.style.top = `${dotY}px`;
          
          chartContainer.appendChild(dot);
        }
      }

      // Step Up Slider Highlight
      const stepUpSliderElement = document.getElementById('break-even-step-up-slider');
      if (stepUpSliderElement) {
        if (chartHighlights.stepUpSlider) {
          stepUpSliderElement.classList.add('break-even-step-up-slider-highlight');
        } else {
          stepUpSliderElement.classList.remove('break-even-step-up-slider-highlight');
        }
      }
    };

    // Use a small delay to ensure chart is rendered
    const timeoutId = setTimeout(applyHighlights, 100);
    
    return () => clearTimeout(timeoutId);
  }, [chartHighlights, breakEvenData]);

  return null; // No DOM elements needed
};

export default BreakEvenChartOverlay;
