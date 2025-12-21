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
  javascriptGenerator.forBlock["motion_turn_right"] = (block: Blockly.Block) => {
    const degrees = block.getFieldValue("DEGREES")
    return `sprite.turn(${degrees});\n`
  }

  // 3. Motion: Turn Left
  javascriptGenerator.forBlock["motion_turn_left"] = (block: Blockly.Block) => {
    const degrees = block.getFieldValue("DEGREES")
    return `sprite.turn(-${degrees});\n`
  }

  // 4. Motion: Go To X/Y
  javascriptGenerator.forBlock["motion_gotoxy"] = (block: Blockly.Block) => {
    const x = block.getFieldValue("X")
    const y = block.getFieldValue("Y")
    return `sprite.setXY(${x}, ${y});\nyield 0.01;\n`
  }

  // 5. Motion: Go To Random Position
  javascriptGenerator.forBlock["motion_gotorandom"] = () => {
    return `sprite.goToRandom();\nyield 0.01;\n`
  }

  // 6. Looks: Show
  javascriptGenerator.forBlock["looks_show"] = () => {
    return `sprite.setVisible(true);\nyield 0.01;\n`
  }

  // 7. Looks: Hide
  javascriptGenerator.forBlock["looks_hide"] = () => {
    return `sprite.setVisible(false);\nyield 0.01;\n`
  }

  // 8. Looks: Set Size
  javascriptGenerator.forBlock["looks_setsize"] = (block: Blockly.Block) => {
    const size = block.getFieldValue("SIZE")
    return `sprite.setSize(${size});\nyield 0.01;\n`
  }

  // 9. Looks: Switch Backdrop
  javascriptGenerator.forBlock["looks_switchbackdrop"] = (block: Blockly.Block) => {
    const backdrop = block.getFieldValue("BACKDROP")
    return `runtime.setBackdrop("${backdrop}");\nyield 0.01;\n`
  }

  // 10. Looks: Say
  javascriptGenerator.forBlock["looks_say"] = (block: Blockly.Block) => {
    const message = block.getFieldValue("MESSAGE")
    return `sprite.say("${message}");\nyield 0.5;\n`
  }

  // 11. Events: Flag Clicked
  javascriptGenerator.forBlock["event_when_flag_clicked"] = () => {
    return `// EVENT: FLAG CLICKED\n`
  }
}

// --- COMPILE FUNCTION ---
// --- COMPILE FUNCTION ---
export const compileWorkspace = (workspace: Blockly.Workspace) => {
  initCompiler()

  // 1. Find the "Hat" block (Entry Point)
  // Current limitation: Only supports ONE "When Flag Clicked" script per sprite
  const topBlocks = workspace.getTopBlocks(false)

  let flagBlock = null
  for (const block of topBlocks) {
    if (block.type === "event_when_flag_clicked") {
      flagBlock = block
      break
    }
  }

  // 2. Generate code ONLY for that stack
  let code = ""
  if (flagBlock) {
    // We need to generate code for the blocks AFTER the flag
    // The flag block itself returns a comment, but we want the *next* block's code.
    // javascriptGenerator.blockToCode returns the code for the block and its successors.
    code = javascriptGenerator.blockToCode(flagBlock) as string
    console.log("[Compiler] Generated Code for Stack:", code)
  }

  // 3. WRAPPER:
  const finalScript = `
(function* (sprite) {
    ${code}
    yield; // Safety yield at end
})
`
  return finalScript
}
