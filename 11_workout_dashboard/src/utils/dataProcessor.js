/**
 * Parse date string from Hevy export format
 * Format: "May 8, 2026, 9:22 AM"
 */
export function parseDate(dateStr) {
  if (!dateStr) return null
  const match = dateStr.match(
    /^(\w+)\s+(\d+),\s+(\d+),\s+(\d+):(\d+)\s+(AM|PM)$/
  )
  if (!match) return null
  const [, month, day, year, hours, minutes, ampm] = match
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  }
  let h = parseInt(hours)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return new Date(parseInt(year), months[month], parseInt(day), h, parseInt(minutes))
}

/**
 * Get unique workouts (sessions) from raw data
 */
export function getWorkouts(data) {
  const workoutsMap = new Map()

  data.forEach(row => {
    const key = `${row.title}-${row.start_time}`
    if (!workoutsMap.has(key)) {
      workoutsMap.set(key, {
        title: row.title,
        startTime: parseDate(row.start_time),
        endTime: parseDate(row.end_time),
        sets: []
      })
    }
    workoutsMap.get(key).sets.push(row)
  })

  return Array.from(workoutsMap.values())
    .sort((a, b) => a.startTime - b.startTime)
}

/**
 * Get unique workout dates (for calendar heatmap)
 */
export function getWorkoutDates(workouts) {
  const dates = {}

  workouts.forEach(workout => {
    if (!workout.startTime) return
    const dateKey = workout.startTime.toISOString().split('T')[0]
    if (!dates[dateKey]) {
      dates[dateKey] = { count: 0, totalVolume: 0, duration: 0 }
    }
    dates[dateKey].count++

    // Calculate duration in minutes
    if (workout.endTime && workout.startTime) {
      dates[dateKey].duration += (workout.endTime - workout.startTime) / 60000
    }

    // Calculate volume
    workout.sets.forEach(set => {
      const weight = parseFloat(set.weight_lbs) || 0
      const reps = parseInt(set.reps) || 0
      dates[dateKey].totalVolume += weight * reps
    })
  })

  return dates
}

/**
 * Get the week number (Sunday-based) for a date
 */
function getWeekKey(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay()) // Start of week (Sunday)
  return d.toISOString().split('T')[0]
}

/**
 * Calculate workout streaks in weeks
 */
export function calculateStreaks(workoutDates) {
  const dates = Object.keys(workoutDates).sort()
  if (dates.length === 0) return { current: 0, longest: 0 }

  // Get unique weeks that have workouts
  const weeksWithWorkouts = new Set()
  dates.forEach(date => {
    weeksWithWorkouts.add(getWeekKey(date))
  })

  const weeks = Array.from(weeksWithWorkouts).sort()
  if (weeks.length === 0) return { current: 0, longest: 0 }

  let longestStreak = 1
  let tempStreak = 1

  // Calculate longest streak in weeks
  for (let i = 1; i < weeks.length; i++) {
    const prevWeek = new Date(weeks[i - 1])
    const currWeek = new Date(weeks[i])
    const diffWeeks = (currWeek - prevWeek) / (7 * 86400000)

    if (diffWeeks === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Calculate current streak
  const currentWeekKey = getWeekKey(new Date())
  const lastWeekKey = getWeekKey(new Date(Date.now() - 7 * 86400000))

  let currentStreak = 0
  const lastWorkoutWeek = weeks[weeks.length - 1]

  if (lastWorkoutWeek === currentWeekKey || lastWorkoutWeek === lastWeekKey) {
    currentStreak = 1
    for (let i = weeks.length - 2; i >= 0; i--) {
      const prevWeek = new Date(weeks[i])
      const currWeek = new Date(weeks[i + 1])
      const diffWeeks = (currWeek - prevWeek) / (7 * 86400000)
      if (diffWeeks === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { current: currentStreak, longest: longestStreak }
}

/**
 * Get all unique exercises
 */
export function getUniqueExercises(data) {
  const exercises = new Set()
  data.forEach(row => {
    if (row.exercise_title) {
      exercises.add(row.exercise_title)
    }
  })
  return Array.from(exercises).sort()
}

/**
 * Get exercise data for strength progress
 */
export function getExerciseProgress(data, exerciseName) {
  const progress = []
  const exerciseSets = data.filter(row =>
    row.exercise_title === exerciseName && row.set_type === 'normal'
  )

  // Group by workout date
  const byDate = {}
  exerciseSets.forEach(set => {
    const date = parseDate(set.start_time)
    if (!date) return
    const dateKey = date.toISOString().split('T')[0]

    if (!byDate[dateKey]) {
      byDate[dateKey] = { maxWeight: 0, maxReps: 0, totalVolume: 0, sets: [] }
    }

    const weight = parseFloat(set.weight_lbs) || 0
    const reps = parseInt(set.reps) || 0

    byDate[dateKey].maxWeight = Math.max(byDate[dateKey].maxWeight, weight)
    byDate[dateKey].maxReps = Math.max(byDate[dateKey].maxReps, reps)
    byDate[dateKey].totalVolume += weight * reps
    byDate[dateKey].sets.push({ weight, reps })
  })

  Object.entries(byDate).forEach(([date, data]) => {
    progress.push({ date, ...data })
  })

  return progress.sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Get exercise frequency counts
 */
export function getExerciseFrequency(data) {
  const counts = {}
  data.forEach(row => {
    if (row.exercise_title) {
      counts[row.exercise_title] = (counts[row.exercise_title] || 0) + 1
    }
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
}

/**
 * Get muscle group distribution
 */
export function getMuscleGroupDistribution(data) {
  const groups = {
    'Back': 0,
    'Chest': 0,
    'Legs': 0,
    'Shoulders': 0,
    'Biceps': 0,
    'Triceps': 0,
    'Core': 0,
    'Other': 0
  }

  data.forEach(row => {
    const exercise = row.exercise_title || ''
    if (exercise.includes('[Back]') || exercise.includes('Row') ||
        exercise.includes('Pulldown') || exercise.includes('Pull Up')) {
      groups['Back']++
    } else if (exercise.includes('[Chest]') || exercise.includes('Bench') ||
               exercise.includes('Chest') || exercise.includes('Fly')) {
      groups['Chest']++
    } else if (exercise.includes('Leg') || exercise.includes('Squat') ||
               exercise.includes('Glute') || exercise.includes('Calf') ||
               exercise.includes('Hip') || exercise.includes('Hack')) {
      groups['Legs']++
    } else if (exercise.includes('[Shoulders]') || exercise.includes('Shoulder') ||
               exercise.includes('Lateral Raise') || exercise.includes('Military')) {
      groups['Shoulders']++
    } else if (exercise.includes('[Biceps]') || exercise.includes('Curl')) {
      groups['Biceps']++
    } else if (exercise.includes('[Triceps]') || exercise.includes('Tricep') ||
               exercise.includes('Pushdown') || exercise.includes('Dip')) {
      groups['Triceps']++
    } else if (exercise.includes('Crunch') || exercise.includes('Plank') ||
               exercise.includes('Torso') || exercise.includes('Ab')) {
      groups['Core']++
    } else {
      groups['Other']++
    }
  })

  return Object.entries(groups)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => ({ name, count }))
}

/**
 * Get personal records for each exercise
 */
export function getPersonalRecords(data) {
  const prs = {}

  data.forEach(row => {
    if (!row.exercise_title || row.set_type === 'warmup') return

    const exercise = row.exercise_title
    const weight = parseFloat(row.weight_lbs) || 0
    const reps = parseInt(row.reps) || 0
    const date = row.start_time

    if (!prs[exercise]) {
      prs[exercise] = { maxWeight: 0, maxWeightDate: null, maxReps: 0,
                        maxRepsDate: null, maxVolume: 0, maxVolumeDate: null }
    }

    if (weight > prs[exercise].maxWeight) {
      prs[exercise].maxWeight = weight
      prs[exercise].maxWeightDate = date
    }

    if (reps > prs[exercise].maxReps) {
      prs[exercise].maxReps = reps
      prs[exercise].maxRepsDate = date
    }

    const volume = weight * reps
    if (volume > prs[exercise].maxVolume) {
      prs[exercise].maxVolume = volume
      prs[exercise].maxVolumeDate = date
    }
  })

  return Object.entries(prs)
    .map(([exercise, records]) => ({ exercise, ...records }))
    .filter(pr => pr.maxWeight > 0)
    .sort((a, b) => b.maxWeight - a.maxWeight)
}

/**
 * Get time of day distribution
 */
export function getTimeDistribution(workouts) {
  const hours = Array(24).fill(0)
  const days = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  workouts.forEach(workout => {
    if (!workout.startTime) return
    hours[workout.startTime.getHours()]++
    days[dayNames[workout.startTime.getDay()]]++
  })

  return { hours, days }
}

/**
 * Get volume over time (weekly aggregates)
 */
export function getVolumeOverTime(workouts) {
  const weeklyVolume = {}

  workouts.forEach(workout => {
    if (!workout.startTime) return

    // Get week start (Sunday)
    const date = new Date(workout.startTime)
    const day = date.getDay()
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - day)
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!weeklyVolume[weekKey]) {
      weeklyVolume[weekKey] = 0
    }

    workout.sets.forEach(set => {
      const weight = parseFloat(set.weight_lbs) || 0
      const reps = parseInt(set.reps) || 0
      weeklyVolume[weekKey] += weight * reps
    })
  })

  return Object.entries(weeklyVolume)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([week, volume]) => ({ week, volume }))
}

/**
 * Get workout duration over time
 */
export function getDurationOverTime(workouts) {
  return workouts
    .filter(w => w.startTime && w.endTime)
    .map(workout => ({
      date: workout.startTime.toISOString().split('T')[0],
      duration: (workout.endTime - workout.startTime) / 60000, // minutes
      title: workout.title
    }))
}
