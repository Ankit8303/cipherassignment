export interface ProjectFile {
  id: string
  name: string
  content: string
  type: "file" | "folder"
  children?: ProjectFile[]
  parentId?: string
}

export interface Project {
  id: string
  name: string
  files: ProjectFile[]
  entryPoint?: string
  createdAt: string
  updatedAt: string
}
