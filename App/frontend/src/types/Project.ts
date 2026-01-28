// frontend/src/types/Project.ts
export interface Project {
  id: number;
  title: string;
  description: string;
  gitUrl: string;
  previewUrl: string;
  restricted: boolean;
}
