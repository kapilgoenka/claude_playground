import { useState } from 'react'

export default function PersonalRecords({ records }) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter records
  let filteredRecords = records

  if (searchTerm) {
    filteredRecords = filteredRecords.filter(r =>
      r.exercise.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (filter !== 'all') {
    filteredRecords = filteredRecords.filter(r => {
      const exercise = r.exercise.toLowerCase()
      switch (filter) {
        case 'upper':
          return exercise.includes('bench') || exercise.includes('row') ||
                 exercise.includes('press') || exercise.includes('pull') ||
                 exercise.includes('chest') || exercise.includes('back') ||
                 exercise.includes('shoulder') || exercise.includes('curl') ||
                 exercise.includes('tricep')
        case 'lower':
          return exercise.includes('leg') || exercise.includes('squat') ||
                 exercise.includes('glute') || exercise.includes('calf') ||
                 exercise.includes('hip') || exercise.includes('hack')
        case 'core':
          return exercise.includes('crunch') || exercise.includes('plank') ||
                 exercise.includes('ab') || exercise.includes('torso')
        default:
          return true
      }
    })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const [datePart] = dateStr.split(', ')
    return datePart
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Personal Records
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search exercise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All</option>
            <option value="upper">Upper Body</option>
            <option value="lower">Lower Body</option>
            <option value="core">Core</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                Exercise
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                Max Weight
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                Date
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                Best Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.slice(0, 15).map((record, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-2 text-sm text-gray-900">
                  {record.exercise.replace(/\[.*?\]\s*/g, '')}
                </td>
                <td className="py-3 px-2 text-sm text-right font-semibold text-purple-600">
                  {record.maxWeight} lbs
                </td>
                <td className="py-3 px-2 text-sm text-right text-gray-500">
                  {formatDate(record.maxWeightDate)}
                </td>
                <td className="py-3 px-2 text-sm text-right text-green-600">
                  {record.maxVolume.toLocaleString()} lbs
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length > 15 && (
        <p className="text-sm text-gray-400 mt-3 text-center">
          Showing 15 of {filteredRecords.length} records
        </p>
      )}

      {filteredRecords.length === 0 && (
        <p className="text-sm text-gray-400 py-8 text-center">
          No records found
        </p>
      )}
    </div>
  )
}
