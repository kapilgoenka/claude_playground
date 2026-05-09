function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function StatsOverview({ workouts, workoutDates, streaks }) {
  const totalWorkouts = Object.keys(workoutDates).length

  // Calculate total volume
  const totalVolume = Object.values(workoutDates)
    .reduce((sum, d) => sum + d.totalVolume, 0)

  // Calculate average workouts per week
  const dates = Object.keys(workoutDates).sort()
  let avgPerWeek = 0
  if (dates.length > 1) {
    const firstDate = new Date(dates[0])
    const lastDate = new Date(dates[dates.length - 1])
    const weeks = (lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000)
    avgPerWeek = weeks > 0 ? (totalWorkouts / weeks).toFixed(1) : totalWorkouts
  }

  // Calculate average duration
  const avgDuration = workouts
    .filter(w => w.startTime && w.endTime)
    .reduce((sum, w, _, arr) => {
      return sum + (w.endTime - w.startTime) / 60000 / arr.length
    }, 0)

  const formatVolume = (vol) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`
    return vol.toFixed(0)
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total Workouts"
        value={totalWorkouts}
        subtitle="sessions logged"
      />
      <StatCard
        title="Avg per Week"
        value={avgPerWeek}
        subtitle="workouts"
      />
      <StatCard
        title="Total Volume"
        value={`${formatVolume(totalVolume)} lbs`}
        subtitle={`Avg ${Math.round(avgDuration)} min/session`}
      />
    </div>
  )
}
