import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function TimeInsights({ timeDistribution }) {
  const { hours, days } = timeDistribution

  // Group hours into time blocks
  const timeBlocks = [
    { label: 'Early (5-8)', count: hours.slice(5, 9).reduce((a, b) => a + b, 0) },
    { label: 'Morning (8-11)', count: hours.slice(8, 12).reduce((a, b) => a + b, 0) },
    { label: 'Midday (11-14)', count: hours.slice(11, 15).reduce((a, b) => a + b, 0) },
    { label: 'Afternoon (14-17)', count: hours.slice(14, 18).reduce((a, b) => a + b, 0) },
    { label: 'Evening (17-20)', count: hours.slice(17, 21).reduce((a, b) => a + b, 0) },
    { label: 'Night (20+)', count: hours.slice(20).reduce((a, b) => a + b, 0) },
  ]

  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const dayData = {
    labels: dayOrder,
    datasets: [
      {
        label: 'Workouts',
        data: dayOrder.map(d => days[d]),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      }
    ]
  }

  const timeData = {
    labels: timeBlocks.map(t => t.label),
    datasets: [
      {
        label: 'Workouts',
        data: timeBlocks.map(t => t.count),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderRadius: 4,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          stepSize: 5,
          font: { size: 11 }
        }
      }
    }
  }

  // Find best day and time
  const bestDay = dayOrder.reduce((best, day) =>
    days[day] > days[best] ? day : best
  , 'Mon')

  const bestTimeBlock = timeBlocks.reduce((best, block) =>
    block.count > best.count ? block : best
  , timeBlocks[0])

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        When Do You Train?
      </h3>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-600 font-medium">Most Active Day</p>
          <p className="text-2xl font-bold text-blue-700">{bestDay}</p>
          <p className="text-xs text-blue-500">{days[bestDay]} workouts</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-center">
          <p className="text-sm text-purple-600 font-medium">Preferred Time</p>
          <p className="text-2xl font-bold text-purple-700">
            {bestTimeBlock.label.split(' ')[0]}
          </p>
          <p className="text-xs text-purple-500">{bestTimeBlock.count} workouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Day of Week */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            By Day of Week
          </h4>
          <div className="h-48">
            <Bar data={dayData} options={chartOptions} />
          </div>
        </div>

        {/* By Time of Day */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">
            By Time of Day
          </h4>
          <div className="h-48">
            <Bar data={timeData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
