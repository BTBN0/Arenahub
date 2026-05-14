# ArenaHub – IT Learning Platform

## 🚀 Quick Start
```bash
npx prisma db push --force-reset
npm run db:seed        # users
npm run db:roadmap     # courses, lessons, tasks
npm run dev            # localhost:3000
```

## 📁 Project Structure
```
arenahub-next/
├── app/                    # Next.js App Router pages
│   ├── api/               # Backend API routes
│   │   ├── auth/          # Authentication
│   │   ├── execute/       # Code sandbox runner
│   │   ├── courses/       # Course CRUD
│   │   ├── lessons/       # Lesson CRUD
│   │   └── tasks/         # Task CRUD
│   ├── dashboard/         # User dashboard
│   ├── lessons/           # Course & lesson list
│   ├── leaderboard/       # Global rankings
│   └── profile/           # User profile
│
├── components/
│   ├── TaskModal.tsx      # Main task modal (Hackerrank-style)
│   ├── game/
│   │   └── GameCanvas.tsx # All 16 game draw functions + canvas
│   ├── task/
│   │   ├── GuidePanel.tsx # Game guide panel
│   │   └── HintSystem.tsx # Progressive hint system (3 levels)
│   ├── layout/
│   │   └── Sidebar.tsx    # Navigation sidebar
│   └── ui/
│       ├── AuthModal.tsx  # Login/Register modal
│       ├── CodeEditor.tsx # Standalone code editor
│       └── PixelModel3D.tsx # 3D pixel art models
│
├── lib/
│   ├── api-client.ts      # Frontend API calls
│   ├── api-helpers.ts     # Backend response helpers
│   ├── auth.ts            # JWT auth utils
│   ├── db.ts              # Prisma client
│   └── services/          # Business logic layer
│       ├── auth.service.ts
│       ├── user.service.ts
│       ├── task.service.ts
│       └── ...
│
├── context/
│   ├── AuthContext.tsx    # Auth state provider
│   └── NextAuthProvider.tsx
│
├── prisma/
│   ├── schema.prisma      # DB schema
│   ├── seed.ts            # User seed
│   └── roadmap-seed.ts    # 7 courses, 49 lessons, 245+ tasks
│
└── styles/
    └── globals.css        # Global styles + CSS variables
```

## 🎮 Courses (7 total)
| # | Course | Game | Tasks |
|---|---|---|---|
| 1 | HTML – Game World | 💻 Evolution Game | 35 |
| 2 | CSS – Game Style | 🗺 Pixel World | 35 |
| 3 | JavaScript | ⚔️ Code Quest Battle | 50 |
| 4 | Advanced JS | ⚔️ Task Battle Survival | 35 |
| 5 | React | 🤖 Auto Code Runner | 50 |
| 6 | Backend / Node.js | 🏭 Online Code Factory | 50 |
| 7 | Database + Multiplayer | 🌐 Multiplayer Arena | 35 |

## 🔑 Test Accounts
- `admin@arenahub.mn` / `admin123`
- `pixel_ninja@arenahub.mn` / `student123`
