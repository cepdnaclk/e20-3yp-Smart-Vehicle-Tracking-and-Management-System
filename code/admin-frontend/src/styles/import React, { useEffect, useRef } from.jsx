import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const TemperatureChart = ({ data = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Get the context of the canvas element
      const ctx = chartRef.current.getContext('2d');
      
      // Generate labels for the chart (minutes ago)
      const labels = data.map((_, index) => `-${data.length - index} min`);
      labels[labels.length - 1] = 'Now';
      
      // Create the chart
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Temperature (°C)',
            data: data,
            fill: true,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              suggestedMin: 15,
              suggestedMax: 45,
              title: {
                display: true,
                text: 'Temperature (°C)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time'
              },
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#1f2937',
              bodyColor: '#1f2937',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 4,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `Temperature: ${context.raw}°C`;
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          animation: {
            duration: 1000
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <canvas ref={chartRef} />
  );
};

export default TemperatureChart;
