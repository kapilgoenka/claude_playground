# Workout Dashboard PRD

## Overview

A visual dashboard to analyze and track gym workout progress using data exported from Hevy fitness app.

## Data Summary

- **Date Range**: May 6, 2025 - May 9, 2026 (~12 months)
- **Total Workout Days**: 223 sessions
- **Total Set Records**: 3,656 entries
- **Workout Types**: Primarily "Upper" (1,877 sets) and "Lower" (1,588 sets) splits
- **Exercise Variety**: 89 unique exercises

### Top Exercises by Frequency
| Exercise | Sets Logged |
|----------|-------------|
| Crunch (Machine) | 284 |
| Bench Press (Smith Machine) | 263 |
| Leg Press (Machine) | 237 |
| Glute Bridge (Machine) | 230 |
| Hammer Strength Row | 225 |
| Seated Leg Curl (Machine) | 189 |
| Lat Pulldown (Cable) | 168 |
| Decline Chest Press | 152 |
| Leg Extension (Machine) | 137 |
| Calf Extension (Machine) | 119 |

### Available Data Fields
- `title` - Workout name (Upper, Lower, etc.)
- `start_time` / `end_time` - Session timestamps
- `exercise_title` - Exercise name
- `set_index` - Set number within exercise
- `set_type` - "warmup" or "normal"
- `weight_lbs` - Weight used
- `reps` - Repetitions performed
- `distance_miles` - For cardio exercises
- `duration_seconds` - For timed exercises
- `rpe` - Rate of perceived exertion (mostly unused)

---

## Proposed Dashboard Features

### 1. Workout Frequency & Consistency

**Overview Stats**
- Total workouts completed
- Current streak / longest streak
- Average workouts per week
- Workouts by day of week (heatmap or bar chart)

**Calendar Heatmap**
- GitHub-style contribution graph showing workout days
- Color intensity based on workout duration or volume

---

### 2. Workout Duration Analysis

**Charts**
- Average workout duration over time
- Duration distribution (histogram)
- Upper vs Lower day duration comparison

---

### 3. Volume Tracking

**Total Volume** (weight x reps per session)
- Weekly/monthly volume trends
- Volume by muscle group (Back, Chest, Legs, etc.)

**Set Counts**
- Total sets per workout
- Working sets vs warmup sets ratio

---

### 4. Strength Progress (Per Exercise)

**Exercise Selector** - Pick any exercise to see:
- Max weight over time (line chart)
- Rep PRs at different weights
- Volume progression (weight x reps)
- Estimated 1RM trend

**Top Exercises to Track**
- Bench Press (Smith Machine)
- Leg Press
- Hack Squat
- Lat Pulldown
- Hammer Strength Row

---

### 5. Exercise Analytics

**Frequency Analysis**
- Most performed exercises (bar chart)
- Exercises by muscle group (pie/donut chart)
- Exercise variety over time

**Balance Check**
- Push vs Pull ratio
- Upper vs Lower volume comparison
- Left/right balance (if data available)

---

### 6. Personal Records (PRs)

**PR Board**
- Best weight lifted per exercise
- Best reps at a given weight
- Recent PRs (last 30 days)

---

### 7. Time-Based Insights

**When Do You Train?**
- Workout time of day distribution
- Performance by time of day
- Best training days (by volume/PRs)

---

## Decisions

- **Features**: All features (frequency, duration, volume, strength progress, exercise analytics, PRs, time insights)
- **Technology**: JavaScript-based web app (React + Chart.js)
- **Exercises**: Track all exercises
- **Deployment**: Run locally

---

## Technical Architecture

### Stack
- **Frontend**: React 18 with Vite
- **Charting**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS
- **Data Processing**: Papa Parse (CSV parsing)
- **Calendar Heatmap**: Custom or cal-heatmap library

### Project Structure
```
workout-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── StatsOverview.jsx
│   │   ├── CalendarHeatmap.jsx
│   │   ├── DurationChart.jsx
│   │   ├── VolumeChart.jsx
│   │   ├── StrengthProgress.jsx
│   │   ├── ExerciseAnalytics.jsx
│   │   ├── PersonalRecords.jsx
│   │   └── TimeInsights.jsx
│   └── utils/
│       ├── dataProcessor.js
│       └── calculations.js
└── public/
    └── hevy-export.csv
```

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  WORKOUT DASHBOARD                              [Upload CSV] │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Total    │ │ Current  │ │ Avg/Week │ │ Total    │       │
│  │ Workouts │ │ Streak   │ │ Workouts │ │ Volume   │       │
│  │   161    │ │  5 days  │ │   4.5    │ │ 1.2M lbs │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  CALENDAR HEATMAP                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [GitHub-style heatmap showing workout days]         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  WORKOUT DURATION          │  VOLUME OVER TIME             │
│  ┌───────────────────────┐ │ ┌───────────────────────────┐ │
│  │ [Line chart]          │ │ │ [Area chart]              │ │
│  └───────────────────────┘ │ └───────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  STRENGTH PROGRESS                                          │
│  [Exercise Dropdown ▼]                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Line chart: weight over time for selected exercise]│   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  EXERCISE ANALYTICS        │  PERSONAL RECORDS             │
│  ┌───────────────────────┐ │ ┌───────────────────────────┐ │
│  │ [Bar: top exercises]  │ │ │ Exercise      | Max | Date│ │
│  │ [Pie: muscle groups]  │ │ │ Bench Press   | 80  | ... │ │
│  └───────────────────────┘ │ │ Leg Press     | 220 | ... │ │
│                            │ └───────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  TIME INSIGHTS                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Bar: workouts by day of week] [Bar: by time of day]│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Setup & Data Loading
- Initialize React + Vite project
- Configure Tailwind CSS
- Implement CSV parsing with Papa Parse
- Create data processing utilities

### Phase 2: Core Components
- Stats overview cards
- Calendar heatmap
- Basic chart components

### Phase 3: Analytics Features
- Strength progress with exercise selector
- Volume tracking charts
- Exercise analytics (frequency, muscle groups)

### Phase 4: Advanced Features
- Personal records board
- Time-based insights
- Push/pull balance analysis

### Phase 5: Polish
- Responsive design
- Dark mode (optional)
- Export/share functionality (optional)
