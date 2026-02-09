#  Video Editing Agent  — System Architecture

## Overview

This document outlines the system architecture for a **semi-automated video editing platform**. The system automates script and voiceover generation while providing a prompt-based interface for human-guided motion graphics and stock footage selection.

This hybrid approach:
- Streamlines the workflow to produce production-ready videos
- Ensures all elements are perfectly synchronized to the voice
- Maintains creative control
- Empowers non-technical users to generate professional motion graphics through intuitive prompting

---

## High-Level Architecture

### Layer 1: User Interface

| Component | Technology | Features |
|-----------|------------|----------|
| **Frontend** | Next.js 14 | Add/generate script, upload voiceover, view/edit storyboard, preview video |

### Layer 2: Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | Supabase (PostgreSQL) | Project data, scene data, job status |
| **File Storage** | Supabase Storage | Temporary file handling |

### Layer 3: Processing & AI Services

| Service | Provider | Role |
|---------|----------|------|
| **Agentic AI** | Claude AI | Scene planning, orchestration |
| **Stock Video** | Pexels API | Real-world footage |
| **Motion Graphics (Simple)** | Hera AI | Animated text, shapes, infographics |
| **Motion Graphics (Complex)** | Wavespeed AI (Veo 3.1) | Advanced animations |
| **AI Avatars** | HeyGen | Talking head segments |
| **Voice Generation** | ElevenLabs | Script-to-voiceover |

### Layer 4: Video Processing

| Component | Technology | Operations |
|-----------|------------|------------|
| **Video Engine** | Node.js + FFmpeg | Trim, speed adjust, transitions, concatenation, audio overlay |
| **Hosting** | Hetzner Cloud | €10-20/month VPS |

### Layer 5: Media Storage

| Component | Technology | Features |
|-----------|------------|----------|
| **CDN & Storage** | Cloudinary | Video storage, optimization, global delivery |

---
## Complete Workflow

### Step 1: Script Preparation
User uploads or generates script via AI → Stored in Supabase.

### Step 2: Voiceover Generation
Script sent to ElevenLabs → Audio file generated and stored in Cloudinary.

### Step 3: AI Analysis
Claude AI receives voiceover and:
- Transcribes with word-level timing
- Breaks content into logical scenes
- Determines A-roll vs B-roll placement
- Assigns durations to each scene

### Step 4: Generate Scene Plan
System produces structured scene plan with timing, asset types, and prompts for each segment.

### Step 5: Fetch/Generate Visual Assets

**A-Roll Scenes:**
- Sent to HeyGen API
- Returns AI avatar videos (5-10s each)

**B-Roll Scenes (Decision Tree):**
- Stock Footage → Pexels API
- Motion Graphics (Simple) → Hera AI
- Motion Graphics (Complex) → Wavespeed AI (Veo 3.1)

### Step 6: Save Assets
All generated videos uploaded to Cloudinary with CDN URLs stored in database.

### Step 7: Video Processing
FFmpeg service receives job with:
- Master voiceover URL
- Scene video URLs with timing data
- Transition specifications

### Step 8: FFmpeg Operations
For each scene:
1. Download video from Cloudinary
2. Trim/fit to exact duration
3. Apply transition effects where necessary

Then:
4. Concatenate all scenes in order
5. Overlay master voiceover audio
6. Export final video

### Step 9: Delivery
- Upload final video to Cloudinary
- Store shareable URL in database
- Notify user (in-app notification)

---

## System Components

### 1. Frontend (Next.js)

**Purpose:** User interface for project management

**Features:**
- Upload voiceover files
- View AI-generated storyboard
- Edit scenes (change visuals, adjust timing)
- Preview video before final render
- Download finished videos

**Technology:** Next.js 14, React, TailwindCSS  
**Hosting:** Vercel

---

### 2. Backend Database (Supabase)

**Purpose:** Store all project data

**What It Stores:**
- Project metadata (title, status)
- Scene data (script, timing, assets)
- Processing job status
- Final video URLs

**Technology:** PostgreSQL via Supabase  
**Features:** Real-time subscriptions, row-level security

---

### 3. AI & Media Services

| Service | Role | Usage |
|---------|------|-------|
| **Claude AI** | System brain | Analyze transcripts, plan scenes, decide A/B-roll, generate prompts |
| **Pexels API** | Stock footage | Real-world video (people, places, things) — Free with attribution |
| **Wavespeed AI** | Complex motion graphics | Access to Veo 3.1 for advanced animations |
| **Hera AI** | Simple motion graphics | Animated text, shapes, infographics |
| **HeyGen API** | AI avatars | Talking head videos synchronized to script |
| **ElevenLabs** | Voice generation | Script-to-voiceover conversion |

---

### 4. Video Processing Service

**Purpose:** Heavy video editing operations

**Hosting Options:**
- DigitalOcean Droplet: $12-20/month
- Hetzner Cloud: €10-20/month (recommended)

**Server Specs:**
- 2-4 CPU cores
- 4-8 GB RAM
- 50-100 GB SSD (temporary files)

**Why Separate Server:**
- FFmpeg is CPU-intensive
- Vercel has 10-second serverless timeout
- Dedicated resources enable faster processing
- Handles videos of any length

---

### 5. Media Storage (Cloudinary)

**Purpose:** Store and deliver all video/image assets

**Stored Assets:**
- User-uploaded voiceovers
- AI-generated avatar videos
- Stock footage from Pexels
- Motion graphics from Hera/Veo
- Final rendered videos

**Benefits:**
- Built-in CDN (global fast delivery)
- Video optimization
- Automatic format conversion
- Generous free tier

---

## Technology Stack Summary

| Component | Technology | Purpose | Hosting |
|-----------|------------|---------|---------|
| Frontend | Next.js 14, React, TailwindCSS | User interface | Vercel |
| Database | Supabase (PostgreSQL) | Data storage | Supabase Cloud |
| AI Brain | Claude AI (Anthropic) | Scene planning & analysis | API |
| Stock Video | Pexels API | Real-world footage | API |
| AI Video | Wavespeed AI (Veo 3.1) | Complex motion graphics | API |
| Simple Graphics | Hera AI | Simple animations | API |
| AI Avatars | HeyGen | Talking head videos | API |
| Voice Gen | ElevenLabs | Voiceover generation | API |
| Video Processing | Node.js + FFmpeg | Trim, concat, render | Hetzner |
| Media Storage | Cloudinary | Asset storage & CDN | Cloudinary Cloud |

---

## Cost Estimates (Development Phase)

| Service | Cost |
|---------|------|
| Next.js (Vercel) | Free |
| Supabase | Free (500 MB) |
| FFmpeg Server (Hetzner) | €10-20/month |
| Cloudinary | Free (25 GB storage) |
| Claude AI | Already subscribed |
| Pexels | Free (with attribution) |
| HeyGen | Already subscribed |
| ElevenLabs | Already subscribed |
| Wavespeed | $25 credits, then pay-as-you-go |
| Hera | $12/month |

**Estimated Total: ~$60-100/month**

---

## Why This Architecture?

| Benefit | Explanation |
|---------|-------------|
| **Simple** | Only 3 main components (Frontend, Database, FFmpeg node) |
| **Scalable** | Each component scales independently |
| **Cost-Effective** | Only pay for what you use |
| **Fast** | Parallel processing, CDN delivery |
| **Maintainable** | Clear separation of concerns |
| **Flexible** | Easy to swap services (e.g., Pexels → Storyblocks) |

---

## Timeline Estimate

### Phase 1: Architecture & API Foundation (Week 1)
- Set up Next.js + Supabase core infrastructure
- Implement Claude AI orchestration for scene planning
- Connect primary generation APIs (HeyGen, Pexels, ElevenLabs)

### Phase 2: Video Engine & Processing (Week 2)
- Deploy FFmpeg processing node
- Build core video assembly logic (trim, concat, fit)
- Establish Cloudinary asset pipeline

### Phase 3: Integration & MVP Launch (Days 15-21)
- End-to-end workflow testing
- UI for storyboard/scene management
- Error handling and deployment

**Total: 2-3 weeks for MVP**

---

## Communication & Progress Tracking

| Item | Details |
|------|---------|
| **Time Tracking** | Hubstaff for all development hours |
| **Reporting** | Screenshots and progress reports every 2 days |
| **Live Demos** | Live URLs shared once deployable |
| **Availability** | Daily calls, 9:00 AM – 8:00 PM UTC |
