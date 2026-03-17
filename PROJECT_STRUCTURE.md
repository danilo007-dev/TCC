# Focus Flow - ADHD Task Organizer

## Overview
Focus Flow is a cognitive assistance system designed specifically for people with ADHD and neurodivergent individuals. It helps reduce cognitive friction and assists users in starting and completing tasks.

## Key Features

### 1. **Onboarding** (`/`)
- 4-step introduction to the app
- Explains core concepts: quick capture, focus mode, small steps

### 2. **Dashboard** (`/dashboard`)
- Visual task cards with color coding
- Progress tracking
- Time estimates for each task
- Greeting based on time of day
- Shows only incomplete tasks to reduce overwhelm

### 3. **Quick Capture** (`/capture`)
- Simple text input for ideas
- AI-powered task breakdown
- Automatic subtask generation
- Estimated time suggestions

### 4. **Focus Mode** (`/focus/:taskId`)
- Dedicated view for single task
- Visual timer with start/pause/reset
- Subtask checklist
- Progress bar
- Celebration animation on completion

### 5. **AI Chat** (`/chat`)
- Conversational assistant
- Helps with task paralysis
- Provides encouragement
- Suggests small first steps
- Context-aware responses

### 6. **Progress** (`/progress`)
- Weekly completion graph
- Completion statistics
- Streak tracking
- Motivational tips

## Design Principles

1. **Minimal Cognitive Load**: Shows only what's needed right now
2. **Visual Time Representation**: Clear time blocks and durations
3. **Small Steps**: Breaks large tasks into micro-actions
4. **Immediate Feedback**: Visual progress bars and celebrations
5. **Calm & Encouraging**: Positive reinforcement without pressure
6. **No Complex Navigation**: Simple bottom navigation bar

## Tech Stack

- React 18
- TypeScript
- React Router (Data mode)
- Motion (Framer Motion)
- Tailwind CSS v4
- Lucide React (icons)
- Canvas Confetti (celebrations)

## File Structure

```
/src/app/
├── App.tsx                 # Main app component with RouterProvider
├── routes.tsx              # React Router configuration
├── types.ts                # TypeScript interfaces
├── store.ts                # In-memory task store with mock AI
├── hooks/
│   └── useTasks.ts        # Custom hook for task state
└── components/
    ├── Layout.tsx          # Main layout with navigation
    ├── Onboarding.tsx      # Welcome screens
    ├── Dashboard.tsx       # Main task view
    ├── QuickCapture.tsx    # Task input with AI
    ├── FocusMode.tsx       # Single task focus view
    ├── AIChat.tsx          # Conversational assistant
    ├── Progress.tsx        # Stats and motivation
    ├── HelpfulHint.tsx     # Reusable hint component
    └── NotFound.tsx        # 404 page
```

## Color System

Tasks are assigned random calming colors:
- Mint green (#A8E6CF)
- Peach (#FFD3B6)
- Coral (#FFAAA5)
- Lavender (#B4A7D6)
- Light yellow (#FFE5B4)

## Notes

- All content is in Portuguese (as per specification)
- Mock AI responses are hardcoded (no external API)
- Task data persists only in memory (resets on refresh)
- Designed for both desktop and mobile
- Uses safe area insets for mobile devices
