import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function ExerciseAnalytics({ exerciseFrequency, muscleGroups }) {
  const top10 = exerciseFrequency.slice(0, 10)

  const barData = {
    labels: top10.map(e => {
      // Truncate long names
      const name = e.name.replace(/\[.*?\]\s*/g, '')
      return name.length > 20 ? name.substring(0, 20) + '...' : name
    }),
    datasets: [
      {
        label: 'Sets',
        data: top10.map(e => e.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      }
    ]
  }

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (context) => top10[context[0].dataIndex].name
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  }

  const colors = [
    'rgba(59, 130, 246, 0.8)',  // blue - Back
    'rgba(239, 68, 68, 0.8)',   // red - Chest
    'rgba(34, 197, 94, 0.8)',   // green - Legs
    'rgba(168, 85, 247, 0.8)',  // purple - Shoulders
    'rgba(249, 115, 22, 0.8)', // orange - Biceps
    'rgba(236, 72, 153, 0.8)', // pink - Triceps
    'rgba(234, 179, 8, 0.8)',   // yellow - Core
    'rgba(156, 163, 175, 0.8)', // gray - Other
  ]

  const doughnutData = {
    labels: muscleGroups.map(g => g.name),
    datasets: [
      {
        data: muscleGroups.map(g => g.count),
        backgroundColor: colors.slice(0, muscleGroups.length),
        borderWidth: 0,
      }
    ]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          font: { size: 11 },
          padding: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.raw / total) * 100).toFixed(1)
            return `${context.raw} sets (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Exercise Analytics
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Exercises */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            Top 10 Exercises by Sets
          </h4>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Muscle Group Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            Muscle Group Distribution
          </h4>
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
