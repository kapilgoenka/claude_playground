import { useMemo } from 'react'

export default function CalendarHeatmap({ workoutDates }) {
  const { weeks, months } = useMemo(() => {
    const dates = Object.keys(workoutDates).sort()
    if (dates.length === 0) return { weeks: [], months: [] }

    // Get date range (last 52 weeks)
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 364)

    // Adjust to start on Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const weeks = []
    const months = []
    let currentDate = new Date(startDate)
    let currentMonth = -1

    while (currentDate <= endDate) {
      const week = []

      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const hasWorkout = workoutDates[dateStr]

        // Track month changes for labels
        if (currentDate.getMonth() !== currentMonth) {
          currentMonth = currentDate.getMonth()
          months.push({
            month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex: weeks.length
          })
        }

        week.push({
          date: dateStr,
          hasWorkout: !!hasWorkout,
          volume: hasWorkout?.totalVolume || 0,
          count: hasWorkout?.count || 0,
          isToday: dateStr === new Date().toISOString().split('T')[0],
          isFuture: currentDate > new Date()
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      weeks.push(week)
    }

    return { weeks, months }
  }, [workoutDates])

  const getColor = (day) => {
    if (day.isFuture) return 'bg-gray-50'
    if (!day.hasWorkout) return 'bg-gray-100'

    // Color intensity based on volume
    const maxVolume = Math.max(...Object.values(workoutDates).map(d => d.totalVolume))
    const intensity = day.volume / maxVolume

    if (intensity > 0.75) return 'bg-green-600'
    if (intensity > 0.5) return 'bg-green-500'
    if (intensity > 0.25) return 'bg-green-400'
    return 'bg-green-300'
  }

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat']

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Workout Activity
      </h3>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex ml-8">
            {months.map((m, i) => (
              <div
                key={i}
                className="text-xs text-gray-400"
                style={{
                  marginLeft: i === 0 ? 0 : `${(m.weekIndex - (months[i-1]?.weekIndex || 0)) * 14 - 28}px`,
                  width: '28px'
                }}
              >
                {m.month}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {dayLabels.map((day, i) => (
                <div key={i} className="w-6 h-3 text-xs text-gray-400 text-right pr-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getColor(day)} ${
                      day.isToday ? 'ring-1 ring-blue-500' : ''
                    }`}
                    title={`${day.date}${day.hasWorkout ? ` - ${day.count} workout(s)` : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <div className="w-3 h-3 rounded-sm bg-green-300" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-600" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
