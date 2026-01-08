/**
 * Python Environment Tour
 * Interactive onboarding for Python/Pyodide projects
 * 
 * Tour Steps:
 * 1. Code Editor - where you write Python code
 * 2. File Explorer - manage your project files
 * 3. Stop & Run - control code execution
 * 4. Quick Run - re-run without stopping
 * 5. Auto-run - automatic re-run on changes
 * 6. Terminal - see print() output and errors
 * 7. Output Pane - visualizations (plots, images, dataframes)
 * 8. Packages Tab - install Python packages
 * 9. Secrets Vault - store API keys securely
 * 
 * NOTE: No emojis - use Lucide icon names instead
 */
import type { TourConfig } from "./types"

export const pythonTour: TourConfig = {
    id: "python-intro",
    name: "Python Environment",
    environment: "python",
    showOnFirstVisit: true,
    steps: [
        {
            id: "code-editor",
            type: "observe",
            target: "[data-tour='code-editor']",
            title: "Code Editor",
            description: "This is where you write your Python code. It features syntax highlighting, auto-completion, and error detection.",
            position: "right",
            icon: "Code",
        },
        {
            id: "file-explorer",
            type: "observe",
            target: "[data-tour='sidebar-explorer']",
            title: "File Explorer",
            description: "Manage your project files here. Create, rename, and organize Python files and assets.",
            position: "right",
            icon: "Files",
        },
        {
            id: "stop-run",
            type: "observe",
            target: "[data-tour='run-button']",
            title: "Stop & Run",
            description: "Click the red Stop button to halt execution. Click the green Play button to run your code, or press Cmd+R (Ctrl+R).",
            position: "bottom",
            icon: "Play",
        },
        {
            id: "quick-run",
            type: "observe",
            target: "[data-tour='quick-run-button']",
            title: "Quick Re-run",
            description: "No need to stop and restart! Click this refresh button to quickly re-run your code while it's already running.",
            position: "bottom",
            icon: "RotateCw",
        },
        {
            id: "auto-toggle",
            type: "observe",
            target: "[data-tour='auto-toggle']",
            title: "Auto-run Mode",
            description: "Enable Auto mode to automatically re-run your code whenever you make changes. Great for rapid iteration!",
            position: "bottom",
            icon: "Zap",
        },
        {
            id: "terminal",
            type: "observe",
            target: "[data-tour='terminal-pane']",
            title: "Terminal",
            description: "View print() statements, error messages, and interact with your running program here.",
            position: "top",
            icon: "Terminal",
        },
        {
            id: "output-pane",
            type: "observe",
            target: "[data-tour='preview-pane']",
            title: "Output & Visualizations",
            description: "Matplotlib plots, Pandas DataFrames, Turtle graphics, and PIL images will appear in this panel.",
            position: "left",
            icon: "BarChart3",
        },
        {
            id: "packages",
            type: "observe",
            target: "[data-tour='sidebar-packages']",
            title: "Python Packages",
            description: "Install packages like numpy, pandas, and matplotlib. Type 'pip install <package>' in the terminal or use this panel.",
            position: "right",
            icon: "Box",
        },
        {
            id: "secrets",
            type: "observe",
            target: "[data-tour='sidebar-secrets']",
            title: "Secrets Vault",
            description: "Store API keys and sensitive data securely. Access them in your code using os.environ['KEY_NAME'].",
            position: "right",
            icon: "Lock",
        },
    ],
}
