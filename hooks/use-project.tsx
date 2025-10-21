"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { Project, ProjectFile } from "@/types/project"

const STORAGE_KEY = "cipher-studio-projects"
const AUTO_SAVE_DELAY = 1000 // 1 second

export function useProject() {
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize with default project
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const projects = JSON.parse(saved)
        if (projects.length > 0) {
          loadProjectData(projects[0])
          return
        }
      } catch (err) {
        console.error("Failed to load saved projects:", err)
      }
    }

    // Create default project
    createNewProject()
  }, [])

  // Auto-save on file changes (only save to localStorage, don't download)
  useEffect(() => {
    if (!project) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Auto-save only saves to localStorage, doesn't download
      if (!project) return

      setIsSaving(true)
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        const projects = saved ? JSON.parse(saved) : []

        const existingIndex = projects.findIndex((p: Project) => p.id === project.id)
        const updatedProject = {
          ...project,
          files,
          updatedAt: new Date().toISOString(),
        }

        if (existingIndex >= 0) {
          projects[existingIndex] = updatedProject
        } else {
          projects.push(updatedProject)
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
        setProject(updatedProject)
      } catch (err) {
        console.error("Failed to auto-save project:", err)
      } finally {
        setIsSaving(false)
      }
    }, AUTO_SAVE_DELAY)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [project, files])

  const loadProjectData = (proj: Project) => {
    setProject(proj)
    setFiles(proj.files)
    const firstFile = findFirstFile(proj.files)
    setSelectedFile(firstFile)
  }

  const findFirstFile = (fileList: ProjectFile[]): ProjectFile | null => {
    for (const file of fileList) {
      if (file.type === "file") {
        return file
      }
      if (file.type === "folder" && file.children) {
        const found = findFirstFile(file.children)
        if (found) return found
      }
    }
    return null
  }

  const createNewProject = useCallback(() => {
    const defaultFile: ProjectFile = {
      id: "1",
      name: "App.tsx",
      type: "file",
      content: `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to CipherStudio</h1>
      <p>Edit this file to see changes in the preview!</p>
    </div>
  );
}`,
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: "Untitled Project",
      files: [defaultFile],
      entryPoint: "App.tsx",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    loadProjectData(newProject)

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const projects = saved ? JSON.parse(saved) : []
      projects.push(newProject)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch (err) {
      console.error("Failed to save new project:", err)
    }
  }, [])

  const selectFile = useCallback((file: ProjectFile) => {
    setSelectedFile(file)
  }, [])

  const createFile = useCallback(
    (name: string, parentId?: string) => {
      if (!project) return

      const newFile: ProjectFile = {
        id: Date.now().toString(),
        name,
        type: "file",
        content: "",
      }

      let updatedFiles = [...files]

      if (parentId) {
        updatedFiles = addFileToFolder(updatedFiles, parentId, newFile)
      } else {
        updatedFiles.push(newFile)
      }

      setFiles(updatedFiles)
      setSelectedFile(newFile)
      setProject({ ...project, files: updatedFiles })
    },
    [project, files],
  )

  const addFileToFolder = (fileList: ProjectFile[], parentId: string, newFile: ProjectFile): ProjectFile[] => {
    return fileList.map((file) => {
      if (file.id === parentId && file.type === "folder") {
        return {
          ...file,
          children: [...(file.children || []), newFile],
        }
      }
      if (file.children) {
        return {
          ...file,
          children: addFileToFolder(file.children, parentId, newFile),
        }
      }
      return file
    })
  }

  const deleteFile = useCallback(
    (id: string) => {
      if (!project) return

      const updatedFiles = removeFileFromTree(files, id)
      setFiles(updatedFiles)

      if (selectedFile?.id === id) {
        const nextFile = findFirstFile(updatedFiles)
        setSelectedFile(nextFile)
      }

      setProject({ ...project, files: updatedFiles })
    },
    [project, files, selectedFile],
  )

  const removeFileFromTree = (fileList: ProjectFile[], id: string): ProjectFile[] => {
    return fileList
      .filter((f) => f.id !== id)
      .map((file) => {
        if (file.children) {
          return {
            ...file,
            children: removeFileFromTree(file.children, id),
          }
        }
        return file
      })
  }

  const renameFile = useCallback(
    (id: string, newName: string) => {
      if (!project) return

      const updatedFiles = renameFileInTree(files, id, newName)
      setFiles(updatedFiles)

      if (selectedFile?.id === id) {
        setSelectedFile({ ...selectedFile, name: newName })
      }

      setProject({ ...project, files: updatedFiles })
    },
    [project, files, selectedFile],
  )

  const renameFileInTree = (fileList: ProjectFile[], id: string, newName: string): ProjectFile[] => {
    return fileList.map((file) => {
      if (file.id === id) {
        return { ...file, name: newName }
      }
      if (file.children) {
        return {
          ...file,
          children: renameFileInTree(file.children, id, newName),
        }
      }
      return file
    })
  }

  const updateFileContent = useCallback(
    (id: string, content: string) => {
      if (!project) return

      const updatedFiles = updateFileInTree(files, id, content)
      setFiles(updatedFiles)

      if (selectedFile?.id === id) {
        setSelectedFile({ ...selectedFile, content })
      }

      setProject({ ...project, files: updatedFiles })
    },
    [project, files, selectedFile],
  )

  const updateFileInTree = (fileList: ProjectFile[], id: string, content: string): ProjectFile[] => {
    return fileList.map((file) => {
      if (file.id === id) {
        return { ...file, content }
      }
      if (file.children) {
        return {
          ...file,
          children: updateFileInTree(file.children, id, content),
        }
      }
      return file
    })
  }

  const saveProject = useCallback(() => {
    if (!project) return

    setIsSaving(true)

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const projects = saved ? JSON.parse(saved) : []

      const existingIndex = projects.findIndex((p: Project) => p.id === project.id)
      const updatedProject = {
        ...project,
        files,
        updatedAt: new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        projects[existingIndex] = updatedProject
      } else {
        projects.push(updatedProject)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
      setProject(updatedProject)
      
      // Also provide a download for user convenience
      const dataStr = JSON.stringify(updatedProject, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${updatedProject.name.replace(/\s+/g, "-")}-saved-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to save project:", err)
    } finally {
      setIsSaving(false)
    }
  }, [project, files])

  const loadProject = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const projects = JSON.parse(saved)
        if (projects.length > 0) {
          loadProjectData(projects[projects.length - 1])
        }
      } catch (err) {
        console.error("Failed to load project:", err)
      }
    }
  }, [])

  const getAllProjects = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as Project[]
      } catch (err) {
        console.error("Failed to get projects:", err)
        return []
      }
    }
    return []
  }, [])

  const deleteProject = useCallback((projectId: string) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const projects = JSON.parse(saved) as Project[]
        const filtered = projects.filter((p) => p.id !== projectId)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
        return true
      }
    } catch (err) {
      console.error("Failed to delete project:", err)
    }
    return false
  }, [])

  const exportProject = useCallback(() => {
    if (!project) return

    const dataStr = JSON.stringify(project, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${project.name.replace(/\s+/g, "-")}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [project])

  const importProject = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const importedProject = JSON.parse(content) as Project
          loadProjectData(importedProject)
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }, [])

  return {
    project,
    files,
    selectedFile,
    isSaving,
    selectFile,
    createFile,
    deleteFile,
    renameFile,
    updateFileContent,
    saveProject,
    loadProject,
    createNewProject,
    getAllProjects,
    deleteProject,
    exportProject,
    importProject,
  }
}
