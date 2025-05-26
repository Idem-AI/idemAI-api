export interface DiagramModel {
  id: string;
  projectId: string;
  name: string;
  type?: string; // e.g., 'flowchart', 'architecture', 'mindmap'
  data: any; // Could be JSON, SVG content, or a link to an image
  createdAt: Date;
  updatedAt: Date;
}
