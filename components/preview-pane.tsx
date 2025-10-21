"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, RefreshCw, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProjectFile } from "@/types/project"
import { useTheme } from "@/hooks/use-theme"

interface PreviewPaneProps {
  files: ProjectFile[]
  entryPoint?: string
}

export function PreviewPane({ files, entryPoint }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isDark, isMounted } = useTheme()
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark")

  const runCode = () => {
    console.log("Run code button clicked")
    setIsLoading(true)
    setError(null)
    updatePreview()
  }

  const refreshPreview = () => {
    console.log("Refresh preview button clicked")
    setIsLoading(true)
    setError(null)
    updatePreview()
  }

  useEffect(() => {
    setPreviewTheme(isDark ? "dark" : "light")
  }, [isDark])

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent
      setPreviewTheme(customEvent.detail.theme)
    }

    window.addEventListener("themechange", handleThemeChange)
    return () => window.removeEventListener("themechange", handleThemeChange)
  }, [])

  const updatePreview = () => {
    if (!iframeRef.current) {
      console.log("No iframe reference available")
      return
    }

    try {
      console.log("Updating preview...")
      setError(null)

      // Find the entry point file
      const mainFile =
        files.find((f) => f.name === entryPoint) || files.find((f) => f.name.endsWith(".tsx")) || files[0]

      if (!mainFile) {
        console.log("No files to preview")
        setError("No files to preview")
        setIsLoading(false)
        return
      }

      console.log("Found main file:", mainFile.name)

      // Find CSS files
      const cssFiles = files.filter((f) => f.name.endsWith(".css"))
      const cssContent = cssFiles.map((f) => f.content).join("\n")

      const html = `
        <!DOCTYPE html>
        <html class="${previewTheme === "dark" ? "dark" : ""}">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: ${previewTheme === "dark" ? "#0f0f0f" : "#ffffff"};
                color: ${previewTheme === "dark" ? "#e4e4e7" : "#1a1a1e"};
              }
              #root { width: 100%; min-height: 100vh; }
              .error-container {
                padding: 20px;
                background: ${previewTheme === "dark" ? "#1a1a1e" : "#f5f5f5"};
                border: 1px solid #ef4444;
                border-radius: 8px;
                margin: 20px;
                font-family: 'Fira Code', monospace;
                font-size: 13px;
                color: #ef4444;
                white-space: pre-wrap;
                word-break: break-word;
                overflow-x: auto;
              }
              .error-title {
                font-weight: bold;
                margin-bottom: 10px;
                color: #fca5a5;
              }
              ${cssContent}
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              try {
                console.log('Starting code compilation and execution...');
                
                // Transform the user code to handle imports and exports properly
                let userCode = \`${mainFile.content}\`;
                console.log('Original user code:', userCode);
                
                // Remove import statements and replace with global references
                userCode = userCode.replace(/import\\s+React(?:,\\s*\\{[^}]*\\})?\\s+from\\s+['"]react['"];?/g, '');
                userCode = userCode.replace(/import\\s+\\{([^}]+)\\}\\s+from\\s+['"]react['"];?/g, '');
                userCode = userCode.replace(/import\\s+\\*\\s+as\\s+\\w+\\s+from\\s+['"][^'"]+['"];?/g, '');
                userCode = userCode.replace(/import\\s+\\w+\\s+from\\s+['"][^'"]+['"];?/g, '');
                
                // Replace export default with a simple assignment
                userCode = userCode.replace(/export\\s+default\\s+/g, 'window.App = ');
                
                // Add React hooks as global variables since React is already loaded
                userCode = userCode.replace(/useState/g, 'React.useState');
                userCode = userCode.replace(/useEffect/g, 'React.useEffect');
                userCode = userCode.replace(/useContext/g, 'React.useContext');
                userCode = userCode.replace(/useReducer/g, 'React.useReducer');
                userCode = userCode.replace(/useMemo/g, 'React.useMemo');
                userCode = userCode.replace(/useCallback/g, 'React.useCallback');
                userCode = userCode.replace(/useRef/g, 'React.useRef');
                
                console.log('Modified user code:', userCode);
                
                // Use Babel to transform the JSX with proper presets
                const transformedCode = Babel.transform(userCode, {
                  presets: ['react'],
                  plugins: [
                    ['transform-modules-umd', {
                      globals: {
                        'react': 'React',
                        'react-dom': 'ReactDOM'
                      }
                    }]
                  ]
                }).code;
                console.log('Transformed code:', transformedCode);
                
                // Execute the transformed code
                eval(transformedCode);
                
                // Check if App is defined
                if (typeof App === 'undefined' || !App) {
                  throw new Error('No React component found. Make sure to export a component as default.');
                }
                
                console.log('App component found:', App);
                
                // Render the component
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(App));
                
                console.log('Component compiled and rendered successfully');
              } catch (err) {
                console.error('Error compiling/executing code:', err);
                const errorMsg = err instanceof Error ? err.message : String(err);
                const stack = err instanceof Error ? err.stack : '';
                const errorHtml = '<div class="error-container"><div class="error-title">Compilation Error:</div>' + 
                  errorMsg + (stack ? '<br><br><strong>Stack Trace:</strong><br>' + stack : '') + '</div>';
                document.getElementById('root').innerHTML = errorHtml;
              }
            </script>
          </body>
        </html>
      `

      const blob = new Blob([html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      
      // Add load event listener to handle iframe loading
      const handleIframeLoad = () => {
        console.log("Preview loaded successfully")
        setIsLoading(false)
        iframeRef.current?.removeEventListener('load', handleIframeLoad)
      }
      
      iframeRef.current.addEventListener('load', handleIframeLoad)
      iframeRef.current.src = url

      // Set a timeout to ensure loading state is cleared
      setTimeout(() => {
        setIsLoading(false)
      }, 3000)

      return () => URL.revokeObjectURL(url)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  // Removed automatic preview updates - now only updates on manual run button click
  // useEffect(() => {
  //   updatePreview()
  // }, [files, entryPoint, previewTheme, isMounted])

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <p className="text-sm font-medium text-foreground">Preview</p>
        <div className="flex items-center gap-2">
          <Button
            onClick={runCode}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            disabled={isLoading}
            title="Run code"
          >
            <Play className={`w-4 h-4 ${isLoading ? "animate-pulse" : ""}`} />
          </Button>
          <Button
            onClick={refreshPreview}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            disabled={isLoading}
            title="Refresh preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="flex gap-3 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  )
}
