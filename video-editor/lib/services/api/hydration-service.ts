import { projectService } from './project-service';
import { sceneService } from './scene-service';
import { memoryService } from './memory-service';

export const hydrationService = {
  /**
   * Seeds a full 15-scene project programmatically
   */
  async seedProject(title: string = "AI Cities: 2050 Masterclass") {
    console.log(`[Hydration] Starting seed for: ${title}`);
    
    // 1. Create Project (Draft Status)
    console.log("[Hydration] Step 1: Creating project...");
    const project = await projectService.create({
      title,
      status: 'draft',
      orientation: 'landscape',
      total_duration: 75.0
    });
    console.log("[Hydration] Project created successfully:", project.id);

    // 2. Initialize Memory (Idle Status)
    console.log("[Hydration] Step 2: Initializing agent memory...");
    await memoryService.initialize(project.id, {
      project_name: title, // Added to match NOT NULL constraint in DB
      workflow_status: 'idle',
      project_system_prompt: 'You are a high-end cinematic AI editor. Focus on environmental sustainability and premium aesthetic.',
      total_scenes: 15,
      completed_count: 0,
      failed_count: 0,
      metadata: {
        tone: "Premium & Technical",
        aspectRatio: "16:9",
        resolution: "4K"
      },
      last_log: 'Relational project hydrated. Awaiting simulation start.'
    });
    console.log("[Hydration] Memory initialized.");

    // 3. Create 15 Scenes (Production Mix)
    console.log("[Hydration] Step 3: Seeding 15 scenes...");
    const sceneTemplates = [
      // Intro A-Roll
      { script: "Imagine a city that breathes. A city where nature and technology live in harmony.", visualType: "a-roll", payload: { avatarId: "avatar_01", emotion: "inspiring" } },
      // Expansion B-Roll
      { script: "Vertical forests are replacing concrete jungles, cooling our streets naturally.", visualType: "b-roll", payload: { searchQuery: "vertical forest architecture" } },
      { script: "Solar skins on skyscrapers are turning every building into a power plant.", visualType: "b-roll", payload: { searchQuery: "solar panel skyscraper" } },
      // Bridge A-Roll
      { script: "But it is not just about the plants. It is about how we move.", visualType: "a-roll", payload: { avatarId: "avatar_01", emotion: "professional" } },
      // Tech B-Roll
      { script: "Autonomous electric shuttles navigate quiet, pedestrian-first boulevards.", visualType: "b-roll", payload: { searchQuery: "autonomous shuttle city" } },
      { script: "Smart grids utilize AI to distribute energy where it is needed most.", visualType: "b-roll", payload: { searchQuery: "smart city grid data" } },
      // Stats Graphics
      { script: "Integrated transit reduces city emissions by over sixty percent.", visualType: "graphics", payload: { prompt: "emissions reduction bar chart" } },
      // Community B-Roll
      { script: "Community-led urban farms are providing fresh produce within walking distance.", visualType: "b-roll", payload: { searchQuery: "urban rooftop garden" } },
      { script: "Public spaces are designed for connection, fostering a new era of urban living.", visualType: "b-roll", payload: { searchQuery: "modern city park people" } },
      // Deep Dive A-Roll
      { script: "This transition requires significant global investment and willpower.", visualType: "a-roll", payload: { avatarId: "avatar_01", emotion: "serious" } },
      // Vision B-Roll
      { script: "Architects are already drafting the blueprints for our 2050 goals.", visualType: "b-roll", payload: { searchQuery: "architect drawing future city" } },
      { script: "Cleaner air and quieter streets for the next generation.", visualType: "b-roll", payload: { searchQuery: "children playing in clean city" } },
      // Technical Graphics
      { script: "The infrastructure for 2050 starts with decentralized energy nodes.", visualType: "graphics", payload: { prompt: "decentralized energy node map" } },
      // Outro A-Roll
      { script: "The tools are already in our hands. The question is: will we build it in time?", visualType: "a-roll", payload: { avatarId: "avatar_01", emotion: "challenging" } },
      // Final CTA Image
      { script: "Join the revolution. Subscribe to Sustainable Future.", visualType: "image", payload: { prompt: "sustainable city logo branding" } },
    ];

    for (let i = 0; i < sceneTemplates.length; i++) {
      const template = sceneTemplates[i];
      await sceneService.create({
        project_id: project.id,
        index: i + 1,
        start_time: i * 5,
        end_time: (i + 1) * 5,
        duration: 5,
        script: template.script,
        visual_type: template.visualType as any,
        status: 'todo',
        fitting_strategy: 'trim',
        transition: { type: "none", duration: 0 },
        payload: template.payload
      });
    }

    console.log(`[Hydration] Successfully seeded 15 scenes for project: ${project.id}`);
    return project;
  }
};
