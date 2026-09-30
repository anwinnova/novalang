import { Lexer } from '../src/parser/lexer.js';
import { Parser } from '../src/parser/parser.js';
import { Interpreter } from '../src/runtime/interpreter.js';
import { StoryCompiler } from '../src/ai/story_compiler.js';
import { KeyframeMacroRecorder } from '../src/motion/macro_recorder.js';

async function test() {
  console.log("=========================================");
  console.log("   NovaLang v2.0 Platform Test Suite    ");
  console.log("=========================================");

  // 1. Test Story Compiler
  console.log("\n[1] Testing Natural Language Story Compiler...");
  const story = "Move motor base to 90 degrees at speed 70, wait 2 seconds, grab payload with gripper, then move motor shoulder to 180 degrees";
  const compiled = StoryCompiler.compile(story);
  console.log(`Story Compiled successfully (${compiled.sentencesCount} sentences):`);
  console.log("-----------------------------------------");
  console.log(compiled.code);
  console.log("-----------------------------------------");

  // 2. Test Macro Recorder
  console.log("\n[2] Testing Motion Macro Recorder...");
  const recorder = new KeyframeMacroRecorder();
  recorder.startRecording();
  recorder.addKeyframe({ motor1: 0, motor2: 0, motor3: 0, gripper: 'open', speed: 50 });
  recorder.addKeyframe({ motor1: 90, motor2: 45, motor3: 90, gripper: 'close', speed: 60 });
  const recordedCode = recorder.toNovaLangCode(2);
  console.log("Macro Recorded Code (2 loop iterations):");
  console.log("-----------------------------------------");
  console.log(recordedCode);
  console.log("-----------------------------------------");

  // 3. Test Lexer & Parser on compiled story code
  console.log("\n[3] Testing Lexer & Parser on Compiled Code...");
  const lexer = new Lexer(compiled.code);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  console.log(`Generated AST with ${ast.body.length} statement nodes.`);

  // 4. Test Interpreter Execution
  console.log("\n[4] Testing Interpreter Execution Engine...");
  const interpreter = new Interpreter({
    stepDelay: 0,
    onLog: (l) => console.log(`[${l.type.toUpperCase()}] ${l.message}`)
  });

  await interpreter.execute(ast);
  console.log("\n=========================================");
  console.log("   ✨ ALL NOVALANG V2.0 TESTS PASSED!   ");
  console.log("=========================================");
}

test().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
