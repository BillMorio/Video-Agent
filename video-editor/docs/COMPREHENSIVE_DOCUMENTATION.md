# 🎬 Project Nexus: Comprehensive Documentation
**High-Fidelity Autonomous Video Orchestration Pipeline**

---

## 1. Project Overview & Architecture
The project is a state-of-the-art autonomous video production system that transforms scripts into fully-assembled, high-fidelity videos using a multi-agent orchestration architecture.

### The Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide Icons.
- **Backend Orchestration**: Next.js Server Actions + AI Agents (Claude 3.5 Sonnet / GPT-4o).
- **Video Engine**: A dedicated **FFmpeg Microservice** (Node.js/Express) handling all heavy lifting.
- **Persistence**: **Supabase** (PostgreSQL) for real-time state management, scene tracking, and agent memory buffers.
- **External Engines**: 
  - **HeyGen API (v2)**: Avatar & Lip-sync synthesis.
  - **Pexels API**: High-quality stock footage discovery.
  - **Anthropic Claude**: Complex reasoning for agent loops.
  - **OpenAI**: Transcription and supplementary agent logic.

---

## 2. Frontend:

### Key UI Features
- **Dynamic Storyboard Canvas**: A responsive grid that visualizes scenes as "Production Nodes".
- **Real-Time Activity Log**: A sidebar "Terminal" that streams logs directly from the Orchestration Engine's memory.
- **Scene Modal Environment**: A deep-dive editing context for each scene, allowing manual overrides of Director Notes, Scripts, and Asset Settings.
- **Production Controls**: High-visibility "Start Production" and "Export Master" actions with state-dependent UI shifts.

---

## 3. The Orchestration Engine
The "Brain" of the project lives in `lib/agents/orchestrator.ts` and is exposed via the main studio page.

### How it works
1. **The Loop**: When the user clicks "Start Production", the frontend initiates a server-side `while` loop via Next.js Server Actions.
2. **Task Routing**: The `Orchestrator` class fetches the project state from Supabase, finds the first `todo` scene, and identifies its `visual_type`.
3. **Agent Handoff**: Each scene type is "routed" to a specialized agent:
   - `a-roll` → **A-Roll Agent**
   - `b-roll` → **B-Roll Agent**
   - `image` → **Image Agent**
   - `graphics` → **Motion Graphics Agent**
4. **State Persistence**: Every tool call and agent decision is written back to the `memory_service` and `scene_service` in Supabase, allowing for persistent recovery across page refreshes.

---

## 4. AI Agents Deep-Dive
Agents are implemented using a **Multi-Turn Agentic Loop (Reason-Act-Feedback)**.

### 👤 A-Roll Agent (`a-roll-agent.ts`)
*Primary Task: Generating technical talking-head segments.*
- **Logic**: Uses **Claude 3.5 Sonnet** to sequence tools.
- **Workflow**:
  1. `cut_audio_segment`: Extracts the exact range from the master audio file.
  2. `generate_heygen_avatar_video`: Submits the trimmed audio and specified Avatar ID to HeyGen.
  3. **Polling**: Automatically polls the status until the video is ready.
  4. **Output**: Returns a finalized, lip-synced MP4 URL.

### 📹 B-Roll Agent (`b-roll-agent.ts`)
*Primary Task: Strategic footage acquisition and narration muxing.*
- **Logic**: Advanced multi-turn loop with Narrative-Visual alignment.
- **Workflow**:
  1. `search_pexels_library`: Finds stock footage matching the scene's script/keywords.
  2. `trim_master_audio`: Surgically extracts the narration for that specific timestamp.
  3. `fit_stock_footage_to_duration`: Scales the acquired clip to match the audio duration perfectly.
  4. `merge_audio_video`: Muxes the narration and video into a final production segment.

### 🎨 Image & Motion Agents
- **Roles**: Orchestrates SDXL image generations and technical UI plates.
- **Current Status**: Operating in high-fidelity simulation mode (preparing for full SDXL/Remotion integration).

---

## 5. The Playground Section
Located at `/playground`, this is the developer hub for testing individual modules in isolation.

- **Agent Orchestration**: Entry point to seed a 15-scene project and watch the pipeline run.
- **FFmpeg Operations**: Manual testing of `trim`, `zoom`, `speed`, and `stitch` operations.
- **HeyGen Hub**: Listing and previewing available AI avatars.
- **System Health**: A dashboard monitoring the connectivity of all 3rd party APIs.
- **UI Kit**: A technical reference for the standard Nexus design components.

---

## 6. FFmpeg API Reference
The FFmpeg server (`http://localhost:3333`) provides a high-performance REST API for video transformations.

### Core Endpoints

#### 📄 Probe & Metadata
- `POST /api/probe`: Returns detailed duration, bitrate, and stream info for a file.
- `GET /api/ffmpeg-info`: Lists available filters and codecs in the environment.

#### ✂️ Direct Transformations
- `POST /api/trim`: Cuts a video segment (Start/Duration).
- `POST /api/audio-trim`: Surgically extracts audio ranges.
- `POST /api/resize`: Scales video to specific resolutions (1080p, 4K, Vertical).
- `POST /api/thumbnail`: Captures a high-res frame at a specific timestamp.
- `POST /api/zoom`: Applies dynamic `zoompan` effects to static assets or clips.

#### 🧵 Advanced Compositing
- `POST /api/light-leak`: Blends transitions using screen-mode blending.
- `POST /api/merge`: Muxes an independent video and audio track (Production Standard).
- `POST /api/concat`: Stitches multiple scenes into a single contiguous file.
- `POST /api/project/stitch`: **The Finalizer** - Sequentially joins all processed scene assets into the master output.

#### 🤖 Agent Internal Routes (Optimized)
- `POST /api/agent/probe`: Path-based probing (no upload overhead).
- `POST /api/agent/trim`: Direct path trimming for server-side buffers.
- `POST /api/agent/merge`: Path-based muxing for audio-narrative finalization.

---

## 7. User Journey: From Audio to Final Production
The platform follows a linear, highly technical workflow that bridges raw audio inputs with agentic video assembly.

### 🎙️ Stage 1: Sonic Capture & Transcription
- **Location**: `/playground/openai/whisper`
- **Action**: Users upload raw audio files (MP3/WAV).
- **Process**: The system uses the **OpenAI Whisper v3** model to perform lexical extraction.
- **Output**: A "Linguistic Output Monitor" displays the raw transcript and a granular grid of **Word-Level Temporal Offsets** (precise start/end times for every word).

### 📝 Stage 2: Storyboard Synthesis
- **Location**: `/playground/openai/whisper/scenes`
- **Action**: The transcript is passed to the **Storyboard Synthesizer**.
- **Process**: Cinematic Intelligence (Claude/GPT-4o) deconstructs the temporal markers to dream up individual scenes.
- **Logic**: It assigns `visual_type` (A-Roll, B-Roll, etc.) based on the narrative flow and distribution settings.
- **Output**: A conceptual storyboard where users can edit scripts, change visual types, or adjust scene order before database allocation.

### 🚀 Stage 3: Orchestrated Production
- **Location**: `/playground/orchestration/[projectId]`
- **Action**: Finalizing the storyboard triggers "Database Allocation".
- **Process**: The project enters the **Nexus Studio**. 
- **Execution**: The Multi-Agent Loop wakes up. Agents (A-Roll, B-Roll, etc.) sequentially grab scenes marked as `todo` and execute their production logic (searching Pexels, calling HeyGen, or muxing audio).
- **Completion**: Once all "Production Nodes" are marked as `READY`, the Orchestrator triggers the high-fidelity stitch to assemble the master video.

---

## 🚀 Future Roadmap
1. **Hera Transition**: Moving image generation from simulation to the Hera SDXL engine.
2. **Advanced Transitions**: Implementing FFmpeg `xfade` kernels for cinematic pacing.

---
*Generated by Nexus Production Orchestrator 1.0*
