# CodeScape

CodeScape is a modern, creative coding environment designed for building and prototyping interactive coding Scapes

## Features

- **Multi-Environment Support**: Create projects using standard HTML/JS, p5.js for creative coding, or Three.js for 3D graphics.
- **Instant Preview**: Live preview pane with hot-reloading logic to see changes instantly as you type.
- **Local Persistence**: All projects and files are saved locally in your browser using IndexedDB (via Dexie.js), ensuring your work is persistent without needing a backend.
- **Integrated Editor**: Features a Monaco-based code editor (VS Code style) with file management, syntax highlighting, and multiple file support.
- **Clean UI**: A distraction-free interface with a separate Dashboard for project management and a focused Editor for coding.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Storage**: Dexie.js (IndexedDB wrapper)
- **Editor**: Monaco Editor

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173` to access the CodeScape Dashboard.
