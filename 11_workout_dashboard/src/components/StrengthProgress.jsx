import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { getExerciseProgress } from '../utils/dataProcessor'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function ExerciseCard({ exerciseName, data }) {
  const progress = useMemo(
    () => getExerciseProgress(data, exerciseName),
    [data, exerciseName]
  )

  if (progress.length === 0) return null

  const chartData = {
    labels: progress.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Weight',
        data: progress.map(d => d.maxWeight),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        tension: 0.2,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          afterBody: (context) => {
            const idx = context[0].dataIndex
            const p = progress[idx]
            if (p) {
              return `Best set: ${p.maxWeight} x ${p.maxReps}`
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 5, font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10 } }
      }
    }
  }

  const maxWeight = Math.max(...progress.map(p => p.maxWeight))
  const lastWeight = progress[progress.length - 1].maxWeight
  const firstWeight = progress[0].maxWeight
  const improvement = firstWeight > 0
    ? ((lastWeight - firstWeight) / firstWeight * 100).toFixed(1)
    : 0

  // Clean up exercise name (remove bracketed prefixes)
  const displayName = exerciseName.replace(/\[.*?\]\s*/g, '')

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-900 mb-2 truncate" title={displayName}>
        {displayName}
      </h4>

      {/* Quick Stats */}
      <div className="flex gap-2 mb-3 text-xs">
        <div className="flex-1 text-center p-2 bg-purple-50 rounded">
          <p className="text-purple-600 font-medium">PR</p>
          <p className="font-bold text-purple-700">{maxWeight}</p>
        </div>
        <div className="flex-1 text-center p-2 bg-green-50 rounded">
          <p className="text-green-600 font-medium">Sessions</p>
          <p className="font-bold text-green-700">{progress.length}</p>
        </div>
        <div className="flex-1 text-center p-2 bg-blue-50 rounded">
          <p className="text-blue-600 font-medium">Change</p>
          <p className={`font-bold ${
            parseFloat(improvement) >= 0 ? 'text-blue-700' : 'text-red-700'
          }`}>
            {improvement > 0 ? '+' : ''}{improvement}%
          </p>
        </div>
      </div>

      <div className="h-36">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

export default function StrengthProgress({ data, exercises }) {
  // Filter exercises that have at least one data point with weight
  const exercisesWithData = useMemo(() => {
    return exercises.filter(exercise => {
      const progress = getExerciseProgress(data, exercise)
      return progress.length > 0 && progress.some(p => p.maxWeight > 0)
    })
  }, [data, exercises])

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Strength Progress ({exercisesWithData.length} exercises)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exercisesWithData.map(exercise => (
          <ExerciseCard
            key={exercise}
            exerciseName={exercise}
            data={data}
          />
        ))}
      </div>
    </div>
  )
}
