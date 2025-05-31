import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CombinedSensorChart = ({ speedHistory, temperatureHistory, humidityHistory }) => {
  // Prepare data for the chart
  const chartData = {
    labels: speedHistory.map(item => item.time),
    datasets: [
      {
        label: 'Speed (km/h)',
        data: speedHistory.map(item => item.speed),
        borderColor: '#00BFFF', // Brighter blue
        backgroundColor: 'rgba(0, 191, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: 'Temperature (°C)',
        data: temperatureHistory.map(item => item.temperature),
        borderColor: '#FF4500', // Brighter orange-red
        backgroundColor: 'rgba(255, 69, 0, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: 'Humidity (%)',
        data: humidityHistory.map(item => item.humidity),
        borderColor: '#32CD32', // Lime green
        backgroundColor: 'rgba(50, 205, 50, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y2',
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Sensor Data History',
        font: {
          size: 18, // Slightly larger title font
          weight: 'bold',
          family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
        },
        color: '#000' // Strong black
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 13, // Increased legend font size
            weight: 'bold',
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000', // Strong black
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000', // Strong black
        titleFont: {
          size: 15, // Increased tooltip title font size
          weight: 'bold',
          family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
        },
        bodyColor: '#000', // Strong black
        bodyFont: {
          size: 14, // Increased tooltip body font size
          family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
        },
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 13, // Increased x-axis title font size
            weight: 'bold',
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000' // Strong black
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12, // Increased x-axis tick font size
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000' // Strong black
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Speed (km/h)',
          font: {
            size: 13, // Increased y-axis title font size
            weight: 'bold',
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000' // Strong black
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12, // Increased y-axis tick font size
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000' // Strong black
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: {
            size: 13, // Increased y1-axis title font size
            weight: 'bold',
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000' // Strong black
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12, // Increased y1-axis tick font size
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000' // Strong black
        }
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Humidity (%)',
          font: {
            size: 13, // Increased y2-axis title font size
            weight: 'bold',
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000' // Strong black
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12, // Increased y2-axis tick font size
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#000' // Strong black
        }
      }
    }
  };

  return (
    <div style={{ 
      height: '300px', 
      width: '100%',
      padding: '10px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CombinedSensorChart;