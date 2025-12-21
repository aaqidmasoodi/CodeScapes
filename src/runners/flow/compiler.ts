import { javascriptGenerator } from "blockly/javascript"
import * as Blockly from "blockly"

// --- GENERATOR CONFIG ---
// We want to generate code that runs inside our "Invisible Engine" Scheduler.
// The engine expects generator functions that validly 'yield'.
// Example Output:
// function* script_1(sprite) {
//    while(true) {
//      sprite.move(10);
//      yield;
//    }
// }

export const initCompiler = () => {
  // 1. Motion: Move Steps
  // Block: "move [10] steps"
  // Output: sprite.move(10); yield;
  javascriptGenerator.forBlock["move_steps"] = (block) => {
    const steps = block.getFieldValue("STEPS")
    // yield 0.01 ensures we render the frame after moving
    const code = `sprite.move(${steps});\nyield 0.01;\n`
    return code
  }

  // 2. Motion: Turn Right
  // Block: "turn right [15] degrees"
  // Output: sprite.turn(15);
  javascriptGenerator.forBlock["turn_right"] = (block) => {
    const degrees = block.getFieldValue("DEGREES")
    return `sprite.turn(${degrees});\n`
  }

  // 3. Events: Flag Clicked
  // Block: "When Flag Clicked"
  // This is a "Hat" block. It marks the start of a stack.
  // We don't need to recursively call 'next' here because Blockly's generator (scrub_)
  // Automatically appends the code of the next block to our return value.
  javascriptGenerator.forBlock["event_when_flag_clicked"] = () => {
    return `// EVENT: FLAG CLICKED\n`
  }
}

// --- COMPILE FUNCTION ---
export const compileWorkspace = (workspace: Blockly.Workspace) => {
  initCompiler()

  // Generate raw code from top blocks
  const code = javascriptGenerator.workspaceToCode(workspace)

  // WRAPPER:
  // We need to wrap this loose code into a structure the engine understands.
  // The engine looks for "run(sprite)" or similar.
  // In our `engine.js` (see FlowRunner), we used `scheduler.start(testScript, cat)`.
  // So we need to generate that `testScript` function.

  const finalScript = `
// FlowScape Compiled Script
console.log("[FlowScape] Script Loaded");

window.userScript = function* (sprite) {
    ${code}
    yield; // Safety yield at end
};

console.log("[FlowScape] Script Ready");
`
  return finalScript
}
