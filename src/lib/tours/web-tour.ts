/**
 * Web Environment Tour
 * Interactive onboarding for HTML/CSS/JS projects
 *
 * Tour Steps:
 * 1. Code Editor - where you write HTML/CSS/JS
 * 2. File Explorer - manage your project files
 * 3. Stop & Run - control code execution
 * 4. Quick Run - re-run without stopping
 * 5. Auto-run - automatic refresh on changes
 * 6. Console - see errors and logs
 * 7. Live Preview - see your webpage
 *
 * NOTE: No emojis - use Lucide icon names instead
 * NOTE: No packages step - web environment doesn't have npm packages in sidebar
 */
import type { TourConfig } from "./types"

export const webTour: TourConfig = {
  id: "web-intro",
  name: "Web Environment",
  environment: "web",
  showOnFirstVisit: true,
  steps: [
    {
      id: "code-editor",
      type: "observe",
      target: "[data-tour='code-editor']",
      title: "Code Editor",
      description:
        "Write your HTML, CSS, and JavaScript here. The editor supports syntax highlighting and auto-completion.",
      position: "right",
      icon: "Code",
    },
    {
      id: "file-explorer",
      type: "observe",
      target: "[data-tour='sidebar-explorer']",
      title: "File Explorer",
      description: "Your project files are here. Browse index.html, styles.css, and script.js.",
      position: "right",
      icon: "Files",
    },
    {
      id: "stop-run",
      type: "observe",
      target: "[data-tour='run-button']",
      title: "Stop & Run",
      description:
        "Click the red Stop button to halt the preview. Click the green Play button to run your project, or press Cmd+R (Ctrl+R).",
      position: "bottom",
      icon: "Play",
    },
    {
      id: "quick-run",
      type: "observe",
      target: "[data-tour='quick-run-button']",
      title: "Quick Refresh",
      description:
        "Click this refresh button to quickly reload your webpage without stopping. Great for testing changes!",
      position: "bottom",
      icon: "RotateCw",
    },
    {
      id: "auto-toggle",
      type: "observe",
      target: "[data-tour='auto-toggle']",
      title: "Auto Refresh",
      description:
        "Enable Auto mode to see your changes instantly as you type. The preview updates automatically!",
      position: "bottom",
      icon: "Zap",
    },
    {
      id: "terminal",
      type: "observe",
      target: "[data-tour='terminal-pane']",
      title: "Console",
      description: "View console.log() output, JavaScript errors, and debugging information here.",
      position: "top",
      icon: "Terminal",
    },
    {
      id: "output-pane",
      type: "observe",
      target: "[data-tour='preview-pane']",
      title: "Live Preview",
      description:
        "Your webpage renders here in real-time. See HTML, CSS, and JavaScript come to life!",
      position: "left",
      icon: "BarChart3",
    },
  ],
}
