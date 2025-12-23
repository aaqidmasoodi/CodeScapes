# Python Runner Architecture

This document describes the internal architecture and behavior of the Python execution environment in CodeScapes, specifically focusing on the reload strategies and execution lifecycle.

## Overview

The Python Runner executes user code entirely in the browser using [Pyodide](https://pyodide.org/) inside a dedicated Web Worker. This architecture provides:

1.  **Isolation**: The main UI thread is never blocked by heavy Python computation.
2.  **Safety**: Code runs in a sandboxed worker environment restricted from direct DOM access.
3.  **State Persistence**: The worker stays alive between runs, maintaining global variables and imports (similar to a Jupyter cell execution) until a Hard Stop is requested.

## Execution Components

### 1. `PythonRunner.tsx` (Main Thread)
-   **Role**: Orchestrator.
-   **Responsibilities**:
    -   Manages the React lifecycle (Mount/Unmount).
    -   Spawns and terminates the Web Worker.
    -   Batches `files` and `envVars` (Secrets) into a payload.
    -   Handles UI state (`isBusy`, `terminal` output, `graphics` output).
    -   Listens to prop updates (`files`) to trigger execution.

### 2. `worker.ts` (Worker Thread)
-   **Role**: Executor.
-   **Responsibilities**:
    -   Initializes the Pyodide runtime (loads WASM).
    -   Installs packages (micropip).
    -   Executes Python code using `pyodide.runPythonAsync`.
    -   Captures `stdout`/`stderr` and streams them back to the main thread.
    -   Handles custom `CodeScapes` socket events.

---

## Reload Strategy

The core design philosophy for reloading is **"Reactive, Props-Driven Execution"**. 

We strictly avoid imperative Execution commands (e.g., "Run Now") in favor of data-driven flows. The runner always executes the `files` currently passed to it via props.

### 1. Auto-Run (Type & Run)

This is the default behavior when the user edits code.

1.  **User Types**: `ScapeEditor` updates its internal `files` state.
2.  **Debounce**: The editor applies a debounce delay (e.g., 500-1000ms) to prevent execution on every keystroke.
3.  **Prop Update**: The `debouncedFiles` are passed to `PythonRunner`.
4.  **Effect Trigger**: `PythonRunner` has a `useEffect` hook monitoring `[files]`.
5.  **Execution**: The effect fires, calling `runPython()`, which sends the new code to the worker.

### 2. Manual Refresh (Soft Reload)

When the user clicks the "Refresh" (Rotate) button, they expect an immediate run of the *current* code (bypassing debounce).

1.  **User Clicks Refresh**.
2.  **State Flush**: `ScapeEditor` forcibly updates `debouncedFiles` to match the current `files` *immediately*.
3.  **Prop Update**: `PythonRunner` receives the new `files` prop instantly.
4.  **Effect Trigger**: The **same `useEffect` as Auto-Run** fires because the props changed.
5.  **Execution**: `runPython()` executes with the fresh files.

**Why this matters**: 
The `restart()` method exposed by the runner handle is a **No-Op** (it just logs). We do *not* command the runner to restart. We simply update the data, and the reactive system handles the rest. This eliminates race conditions where an imperative "Run" command might use stale props.

### 3. Hard Stop (Stop Button)

When the user clicks the "Stop" (Square) button:

1.  **User Clicks Stop**.
2.  **Terminate**: The `stop()` method is called, which calls `worker.terminate()`.
3.  **Kill**: The browser forcibly kills the worker thread. All state (variables, imports) is lost.
4.  **Re-Spawn**: A new worker is immediately initialized to be ready for the next run.

---

## Technical Implementation Details

### The `runPython` Callback

The `runPython` function is wrapped in `useCallback`. Crucially, it depends on `[files]`.

```typescript
const runPython = useCallback(async () => {
  const currentFiles = files // Captured from closure (latest prop)
  // ... sends to worker ...
}, [files, ...])
```

Because `files` is a dependency, `runPython` is recreated whenever files change. This isn't strictly necessary for the Auto-Run effect (which depends on `files` anyway), but it ensures that `runPython` always represents the *capability to run the current code*.

### Race Condition Prevention

By relying solely on the `files` prop and the `useEffect`, we avoid the "Stale Props" class of bugs. 

*   **Old Bug**: Clicking "Refresh" called `runPython()` synchronously. But React hadn't re-rendered `PythonRunner` yet, so `runPython` used the old, stale files from the previous render.
*   **Fix**: "Refresh" simply updates the parent state. React re-renders `PythonRunner` with new files. The `useEffect` sees the change and runs the new code.
