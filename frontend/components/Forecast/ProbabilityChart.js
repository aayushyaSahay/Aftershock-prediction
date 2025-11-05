import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ProbabilityChart({ probabilities }) {
  const sortedProbs = Object.entries(probabilities)
    .sort((a, b) => b[1].magnitude - a[1].magnitude);
  
  const data = {
    labels: sortedProbs.map(([key]) => key),
    datasets: [
      {
        label: 'Probability',
        data: sortedProbs.map(([_, prob]) => prob.percentage),
        backgroundColor: sortedProbs.map((_, idx) => {
          const alpha = 0.8 - (idx * 0.1);
          return `rgba(249, 115, 22, ${alpha})`;
        }),
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 31, 58, 0.95)',
        titleColor: '#e8eaed',
        bodyColor: '#e8eaed',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `${context.parsed.x.toFixed(1)}% probability`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#9aa0a6',
          callback: function (value) {
            return value + '%';
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        ticks: {
          color: '#9aa0a6',
        },
        grid: {
          display: false,
        },
      },
    },
  };
  
  return (
    <div className="h-48">
      <Bar data={data} options={options} />
    </div>
  );
}