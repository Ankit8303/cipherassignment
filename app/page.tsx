"use client"

import { useState, useEffect } from "react"
import { FileTree } from "@/components/file-tree"
import { CodeEditor } from "@/components/code-editor"
import { PreviewPane } from "@/components/preview-pane"
import { TopBar } from "@/components/top-bar"
import { ProjectManager } from "@/components/project-manager"
import { AuthModal } from "@/components/auth-modal"
import { AuthGuard } from "@/components/auth-guard"
import { DeploymentModal } from "@/components/deployment-modal"
import { GitHubAuthModal } from "@/components/github-auth-modal"
import { GitHubExportModal } from "@/components/github-export-modal"
import { SplitViewToggle } from "@/components/split-view-toggle"
import { useProject } from "@/hooks/use-project"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

export default function Home() {
  const {
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
    exportProject,
    importProject,
    getAllProjects,
    deleteProject,
  } = useProject()

  const [isMounted, setIsMounted] = useState(false)
  const [showProjectManager, setShowProjectManager] = useState(false)
  const [projects, setProjects] = useState([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDeploymentModal, setShowDeploymentModal] = useState(false)
  const [showGitHubAuthModal, setShowGitHubAuthModal] = useState(false)
  const [showGitHubExportModal, setShowGitHubExportModal] = useState(false)
  const [isGitHubAuthenticated, setIsGitHubAuthenticated] = useState(false)
  const [mobileView, setMobileView] = useState<"split" | "editor" | "preview">("split")

  useEffect(() => {
    setIsMounted(true)
    const auth = localStorage.getItem("cipher-studio-auth")
    if (auth) {
      setIsAuthenticated(true)
    }
  }, [])

  useKeyboardShortcuts({
    onSave: saveProject,
    onNew: createNewProject,
    onLoad: () => setShowProjectManager(true),
  })

  const handleLoadProject = () => {
    setProjects(getAllProjects())
    setShowProjectManager(true)
  }

  const handleSelectProject = (selectedProject: any) => {
    window.location.reload()
  }

  const handleDeleteProject = (projectId: string) => {
    if (deleteProject(projectId)) {
      setProjects(getAllProjects())
      if (project?.id === projectId) {
        createNewProject()
      }
    }
  }

  const handleExportProject = (exportedProject: any) => {
    const dataStr = JSON.stringify(exportedProject, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${exportedProject.name.replace(/\s+/g, "-")}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleAuth = (user: any) => {
    // User is already authenticated by AuthGuard
    console.log("User authenticated:", user)
  }

  const handleShowAuth = () => {
    setShowAuthModal(true)
  }

  const handleDeploy = () => {
    setShowDeploymentModal(true)
  }

  const handleExportGithub = () => {
    if (!project) return
    
    // Check if user is authenticated with GitHub
    const githubToken = localStorage.getItem('github-token')
    if (!githubToken) {
      setShowGitHubAuthModal(true)
      return
    }
    
    setShowGitHubExportModal(true)
  }

  const handleGitHubAuthenticated = (token: string) => {
    setIsGitHubAuthenticated(true)
    setShowGitHubAuthModal(false)
    setShowGitHubExportModal(true)
  }

  const handleExportZip = () => {
    if (!project) return
    const projectJson = JSON.stringify(project, null, 2)
    const blob = new Blob([projectJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${project.name}.zip`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isMounted) return null

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen bg-background text-foreground">
      <TopBar
        projectName={project?.name || "Untitled Project"}
        isSaving={isSaving}
        onSave={saveProject}
        onNew={createNewProject}
        onLoad={handleLoadProject}
        onExport={exportProject}
        onImport={importProject}
        onDeploy={handleDeploy}
        isAuthenticated={true}
        onLogout={() => {}}
        onShowAuth={() => {}}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* File Tree Pane - Hidden on mobile */}
        {(mobileView === "split" || mobileView === "editor") && (
          <div className="w-64 border-r border-border bg-sidebar overflow-y-auto max-md:w-48 max-sm:hidden">
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onSelectFile={selectFile}
              onCreateFile={createFile}
              onDeleteFile={deleteFile}
              onRenameFile={renameFile}
            />
          </div>
        )}

        {/* Editor Pane */}
        {(mobileView === "split" || mobileView === "editor") && (
          <div className="flex-1 flex flex-col border-r border-border max-md:w-full">
            <div className="flex items-center px-4 py-2 border-b border-border bg-header max-md:hidden">
              <SplitViewToggle onViewChange={setMobileView} />
            </div>
            <CodeEditor file={selectedFile} onUpdateContent={updateFileContent} />
          </div>
        )}

        {/* Preview Pane */}
        {(mobileView === "split" || mobileView === "preview") && (
          <div className="w-1/3 border-l border-border bg-preview overflow-hidden max-lg:w-2/5 max-md:w-full">
            <PreviewPane files={files} entryPoint={project?.entryPoint} />
          </div>
        )}
      </div>

      {/* Project Manager Modal */}
      <ProjectManager
        isOpen={showProjectManager}
        projects={projects}
        onClose={() => setShowProjectManager(false)}
        onSelect={handleSelectProject}
        onDelete={handleDeleteProject}
        onExport={handleExportProject}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuth={handleAuth} />

      {/* Deployment Modal */}
      <DeploymentModal
        isOpen={showDeploymentModal}
        onClose={() => setShowDeploymentModal(false)}
        projectName={project?.name || "project"}
        onExportGithub={handleExportGithub}
        onExportZip={handleExportZip}
      />

      {/* GitHub Auth Modal */}
      <GitHubAuthModal
        isOpen={showGitHubAuthModal}
        onClose={() => setShowGitHubAuthModal(false)}
        onAuthenticated={handleGitHubAuthenticated}
      />

      {/* GitHub Export Modal */}
      <GitHubExportModal
        isOpen={showGitHubExportModal}
        onClose={() => setShowGitHubExportModal(false)}
        project={project}
        files={files}
      />
      </div>
    </AuthGuard>
  )
}
