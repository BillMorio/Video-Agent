# Video Editor Platform

A semi-automated video editing platform for content creators, built with Next.js 15.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the editor.

---

## Features

| Feature | Description |
|---------|-------------|
| **Scene Management** | Create, edit, and organize video scenes |
| **Drag & Drop** | Reorder scenes by dragging |
| **Scene Editor** | Edit script, duration, shot type per scene |
| **Dark/Light Mode** | Toggle between themes |
| **Responsive** | Works on desktop and mobile |

---

## Project Structure

```
video-editor/
├── app/
│   ├── globals.css      # Theme variables & utilities
│   ├── layout.tsx       # Root layout with fonts
│   └── page.tsx         # Main editor page
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── dialog.tsx
│   ├── scenes/          # Scene-specific components
│   │   ├── scene-card.tsx
│   │   ├── scene-editor-modal.tsx
│   │   └── scene-header.tsx
│   ├── theme-toggle.tsx
│   └── theme-provider.tsx
├── lib/
│   └── utils.ts         # Utility functions
└── docs/
    └── README.md        # This file
```

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Drag & Drop:** @dnd-kit
- **UI Primitives:** Radix UI
- **Icons:** Lucide React
- **Theme:** next-themes

---

## Design Notes

- **Sharp corners** (4-8px border radius)
- **Technical labels** (JetBrains Mono, uppercase, letter-spacing)
- **Dark theme default** with light mode toggle
- **Glass effect** for cards and modals
