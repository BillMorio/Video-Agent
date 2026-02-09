"use client";

import { Scene } from "@/lib/types";
import { ARollModal } from "./a-roll-modal";
import { BRollModal } from "./b-roll-modal";
import { GraphicsModal } from "./graphics-modal";
import { ImageModal } from "./image-modal";

interface SceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene | null;
  onUpdate: (data: Partial<Scene>) => void;
}

export function SceneModal({ isOpen, onClose, scene, onUpdate }: SceneModalProps) {
  if (!scene || !isOpen) return null;

  // Route to correct modal based on visual type
  switch (scene.visualType) {
    case "a-roll":
      return <ARollModal isOpen={isOpen} onClose={onClose} scene={scene} onUpdate={onUpdate} />;
    case "b-roll":
      return <BRollModal isOpen={isOpen} onClose={onClose} scene={scene} onUpdate={onUpdate} />;
    case "graphics":
      return <GraphicsModal isOpen={isOpen} onClose={onClose} scene={scene} onUpdate={onUpdate} />;
    case "image":
      return <ImageModal isOpen={isOpen} onClose={onClose} scene={scene} onUpdate={onUpdate} />;
    default:
      return null;
  }
}
