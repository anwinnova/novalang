#!/usr/bin/env node

/**
 * NovaLang v2.0 CLI Executable Engine
 * Supports file execution, Natural Language Story compilation, and debug modes.
 */

import fs from 'fs';
import path from 'path';
import { Lexer } from '../src/parser/lexer.js';
import { Parser } from '../src/parser/parser.js';
import { Interpreter } from '../src/runtime/interpreter.js';
import { StoryCompiler } from '../src/ai/story_compiler.js';

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
🚀 NovaLang CLI Engine v2.0.0
Author: Founder & Creator

Usage:
  node bin/novalang.js <script.nova> [options]
  node bin/novalang.js --story "<natural language story description>"

Options:
  --story "<text>"  Compile and run a natural language story description directly
  --debug          Enable step-by-step debug execution
  --version, -v    Display NovaLang version
  --help, -h       Display command reference
`);
  process.exit(0);
}

if (args[0] === '--version' || args[0] === '-v') {
  console.log('NovaLang v2.0.0 (Hardware, Story AI & Cloud Engine)');
  process.exit(0);
}

// Story Mode
const storyIdx = args.indexOf('--story');
let sourceCode = '';
let scriptName = 'cli_input';

if (storyIdx !== -1 && args[storyIdx + 1]) {
  const storyText = args[storyIdx + 1];
  console.log(`\x1b[35m📖 Compiling Natural Language Story: "${storyText}"\x1b[0m\n`);
  const compiled = StoryCompiler.compile(storyText);
  sourceCode = compiled.code;
  scriptName = 'story_input.nova';
} else {
  const filePath = path.resolve(process.cwd(), args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found '${filePath}'`);
    process.exit(1);
  }
  sourceCode = fs.readFileSync(filePath, 'utf-8');
  scriptName = path.basename(filePath);
}

const isDebug = args.includes('--debug');

async function run() {
  console.log(`\x1b[36m🚀 Executing NovaLang script: ${scriptName}\x1b[0m\n`);

  const lexer = new Lexer(sourceCode);
  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.parse();

  const interpreter = new Interpreter({
    stepDelay: isDebug ? 200 : 0,
    onLog: (logObj) => {
      let prefix = '\x1b[37m';
      if (logObj.type === 'system') prefix = '\x1b[34m[SYSTEM]';
      else if (logObj.type === 'user') prefix = '\x1b[33m[LOG]';
      else if (logObj.type === 'info') prefix = '\x1b[36m[INFO]';
      else if (logObj.type === 'hardware') prefix = '\x1b[32m[HARDWARE]';
      else if (logObj.type === 'success') prefix = '\x1b[32m[SUCCESS]';
      else if (logObj.type === 'warning') prefix = '\x1b[33m[WARN]';
      else if (logObj.type === 'error') prefix = '\x1b[31m[ERROR]';
      else if (logObj.type === 'ai') prefix = '\x1b[35m[AI]';
      else if (logObj.type === 'network') prefix = '\x1b[36m[HTTP]';

      console.log(`${prefix} ${logObj.message}\x1b[0m`);
    }
  });

  await interpreter.execute(ast);
  console.log(`\n\x1b[32m✨ NovaLang execution completed successfully.\x1b[0m`);
}

run().catch((err) => {
  console.error(`\x1b[31m💥 NovaLang Runtime Error: ${err.message}\x1b[0m`);
  process.exit(1);
});
