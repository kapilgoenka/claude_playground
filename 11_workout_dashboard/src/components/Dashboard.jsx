import { useMemo } from 'react'
import StatsOverview from './StatsOverview'
import CalendarHeatmap from './CalendarHeatmap'
import DurationChart from './DurationChart'
import VolumeChart from './VolumeChart'
import StrengthProgress from './StrengthProgress'
import ExerciseAnalytics from './ExerciseAnalytics'
import PersonalRecords from './PersonalRecords'
import TimeInsights from './TimeInsights'
import {
  getWorkouts,
  getWorkoutDates,
  calculateStreaks,
  getUniqueExercises,
  getExerciseFrequency,
  getMuscleGroupDistribution,
  getPersonalRecords,
  getTimeDistribution,
  getVolumeOverTime,
  getDurationOverTime
} from '../utils/dataProcessor'

export default function Dashboard({ data }) {
  // Process all data
  const processedData = useMemo(() => {
    const workouts = getWorkouts(data)
    const workoutDates = getWorkoutDates(workouts)
    const streaks = calculateStreaks(workoutDates)
    const exercises = getUniqueExercises(data)
    const exerciseFrequency = getExerciseFrequency(data)
    const muscleGroups = getMuscleGroupDistribution(data)
    const personalRecords = getPersonalRecords(data)
    const timeDistribution = getTimeDistribution(workouts)
    const volumeOverTime = getVolumeOverTime(workouts)
    const durationOverTime = getDurationOverTime(workouts)

    return {
      workouts,
      workoutDates,
      streaks,
      exercises,
      exerciseFrequency,
      muscleGroups,
      personalRecords,
      timeDistribution,
      volumeOverTime,
      durationOverTime
    }
  }, [data])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Workout Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Track your gym progress and performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-6">
          <StatsOverview
            workouts={processedData.workouts}
            workoutDates={processedData.workoutDates}
            streaks={processedData.streaks}
          />
        </div>

        {/* Calendar Heatmap */}
        <div className="mb-6">
          <CalendarHeatmap workoutDates={processedData.workoutDates} />
        </div>

        {/* Duration & Volume Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DurationChart durationData={processedData.durationOverTime} />
          <VolumeChart volumeData={processedData.volumeOverTime} />
        </div>

        {/* Exercise Analytics */}
        <div className="mb-6">
          <ExerciseAnalytics
            exerciseFrequency={processedData.exerciseFrequency}
            muscleGroups={processedData.muscleGroups}
          />
        </div>

        {/* Personal Records & Time Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PersonalRecords records={processedData.personalRecords} />
          <TimeInsights timeDistribution={processedData.timeDistribution} />
        </div>

        {/* Strength Progress */}
        <div className="mb-6">
          <StrengthProgress
            data={data}
            exercises={processedData.exercises}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 mt-8 pb-4">
          Data from Hevy App Export
        </div>
      </div>
    </div>
  )
}
