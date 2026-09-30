/**
 * NovaLang v2.0 Studio Frontend Controller
 * Binds Natural Language Story AI Compiler, Virtual Motor Motion Studio, Keyframe Macro Recorder, and Runtime Engine.
 */

import { Lexer } from './src/parser/lexer.js';
import { Parser } from './src/parser/parser.js';
import { Interpreter } from './src/runtime/interpreter.js';
import { StoryCompiler } from './src/ai/story_compiler.js';
import { KeyframeMacroRecorder } from './src/motion/macro_recorder.js';

const TEMPLATES = {
  motor: `# NovaLang v2.0 Motor & Hardware Automation Script (.nova)
# Author: Founder & Creator

log "Starting Robotic Arm & Motor Sequence Calibration..."

move_motor "motor_base" 90 60
wait 300ms

move_motor "motor_shoulder" 45 50
move_motor "motor_wrist" 120 70
wait 500ms

gripper_state "close"
wait 400ms

move_motor "motor_base" 180 80
wait 500ms
gripper_state "open"

log "Hardware Motor Cycle Completed Successfully!"`,

  scraper: `# NovaLang v2.0 Web Scraping & Lead Enrichment Script (.nova)
# Author: Founder & Creator

set $url = "https://portal.novasmart.io/leads"
log "Starting NovaLang Lead Scraper on" $url

open $url
click "#btn-login"
type "#input-search" "Enterprise Clients"
click "#btn-search"
wait 500ms

set $data = extract "table.leads-grid"
log "Extracted leads dataset via NovaLang!"

http_get "https://api.novasmart.io/enrich" -> ai "Analyze these leads and categorize by revenue potential" -> export "leads_summary.json"

log "NovaLang Automation Completed Successfully!"`,

  pipeline: `# NovaLang v2.0 API & AI Data Pipeline (.nova)
# Demonstrates HTTP API chaining, AI reasoning, and Exporting

set $endpoint = "https://api.github.com/orgs/novasmart/repos"

http_get $endpoint -> ai "Extract top 3 trending repositories and write release notes summary" -> export "release_notes.json"

set $count = 3
repeat $count times
  log "NovaLang system health check iteration..."
  wait 200ms
end

log "NovaLang Pipeline executed cleanly!"`
};

let interpreterInstance = null;
const macroRecorder = new KeyframeMacroRecorder();
let currentGripperState = 'open';

document.addEventListener('DOMContentLoaded', () => {
  const codeEditor = document.getElementById('code-editor');
  const storyInput = document.getElementById('story-input');
  const btnCompileStory = document.getElementById('btn-compile-story');
  const btnRun = document.getElementById('btn-run');
  const btnStop = document.getElementById('btn-stop');
  const btnClear = document.getElementById('btn-clear');
  const templateSelect = document.getElementById('template-select');
  const logsList = document.getElementById('logs-list');
  const flowContainer = document.getElementById('flow-container');
  const variablesGrid = document.getElementById('variables-grid');
  const editorStatus = document.getElementById('editor-status');

  // Sliders & Controls
  const sliderM1 = document.getElementById('slider-m1');
  const sliderM2 = document.getElementById('slider-m2');
  const sliderM3 = document.getElementById('slider-m3');
  const valM1 = document.getElementById('val-m1');
  const valM2 = document.getElementById('val-m2');
  const valM3 = document.getElementById('val-m3');
  const btnToggleGripper = document.getElementById('btn-toggle-gripper');
  const btnRecordKf = document.getElementById('btn-record-kf');
  const btnExportMacro = document.getElementById('btn-export-macro');

  codeEditor.value = TEMPLATES.motor;

  // Slider event listeners
  sliderM1.addEventListener('input', () => { valM1.textContent = `${sliderM1.value}°`; });
  sliderM2.addEventListener('input', () => { valM2.textContent = `${sliderM2.value}°`; });
  sliderM3.addEventListener('input', () => { valM3.textContent = `${sliderM3.value}°`; });

  btnToggleGripper.addEventListener('click', () => {
    currentGripperState = currentGripperState === 'open' ? 'close' : 'open';
    btnToggleGripper.textContent = currentGripperState === 'open' ? 'Open' : 'Closed';
    btnToggleGripper.className = currentGripperState === 'open' ? 'btn btn-secondary' : 'btn btn-accent';
  });

  // Keyframe Motion Recorder
  btnRecordKf.addEventListener('click', () => {
    const pose = {
      motor1: parseInt(sliderM1.value),
      motor2: parseInt(sliderM2.value),
      motor3: parseInt(sliderM3.value),
      gripper: currentGripperState,
      speed: 60
    };
    const kf = macroRecorder.addKeyframe(pose);
    appendLog(`🔴 Recorded Motor Keyframe #${macroRecorder.keyframes.length} (M1:${pose.motor1}°, M2:${pose.motor2}°, M3:${pose.motor3}°, Gripper:${pose.gripper})`, 'hardware');
  });

  btnExportMacro.addEventListener('click', () => {
    const code = macroRecorder.toNovaLangCode(2);
    codeEditor.value = code;
    appendLog(`📜 Exported ${macroRecorder.keyframes.length} keyframes to NovaLang code editor!`, 'success');
  });

  // Story Compiler
  btnCompileStory.addEventListener('click', () => {
    const storyText = storyInput.value.trim();
    if (!storyText) {
      appendLog('Please enter a natural language story description.', 'warning');
      return;
    }
    const compiled = StoryCompiler.compile(storyText);
    codeEditor.value = compiled.code;
    appendLog(`📖 Compiled Story into ${compiled.sentencesCount} NovaLang statements!`, 'ai');
  });

  templateSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (TEMPLATES[val]) {
      codeEditor.value = TEMPLATES[val];
      appendLog('Loaded template script: ' + val, 'system');
    }
  });

  btnClear.addEventListener('click', () => {
    logsList.innerHTML = '';
    document.getElementById('log-count').textContent = '0 Logs';
  });

  btnRun.addEventListener('click', async () => {
    const code = codeEditor.value;
    if (!code.trim()) return;

    btnRun.disabled = true;
    btnStop.disabled = false;
    editorStatus.textContent = 'Executing...';
    editorStatus.style.color = 'var(--accent-amber)';

    try {
      appendLog('Tokenizing NovaLang source code...', 'system');
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      appendLog('Parsing AST Statement Tree...', 'system');
      const parser = new Parser(tokens);
      const ast = parser.parse();

      renderASTNodes(ast);

      interpreterInstance = new Interpreter({
        stepDelay: 120,
        onLog: (logObj) => {
          appendLog(logObj.message, logObj.type, logObj.timestamp);
        },
        onEvent: (evt) => {
          if (evt.event === 'variable_changed') {
            updateVariablesUI(interpreterInstance.variables);
          } else if (evt.event === 'motor_motion') {
            // Update virtual sliders dynamically during execution
            if (evt.data.motorId.includes('base') || evt.data.motorId === 'motor1') {
              sliderM1.value = evt.data.angle;
              valM1.textContent = `${evt.data.angle}°`;
            } else if (evt.data.motorId.includes('shoulder') || evt.data.motorId === 'motor2') {
              sliderM2.value = evt.data.angle;
              valM2.textContent = `${evt.data.angle}°`;
            } else if (evt.data.motorId.includes('wrist') || evt.data.motorId === 'motor3') {
              sliderM3.value = evt.data.angle;
              valM3.textContent = `${evt.data.angle}°`;
            }
          }
        },
        onStep: async (node) => {}
      });

      await interpreterInstance.execute(ast);

      editorStatus.textContent = 'Completed';
      editorStatus.style.color = 'var(--accent-green)';
    } catch (err) {
      appendLog(`[NovaLang Runtime Error] ${err.message}`, 'error');
      editorStatus.textContent = 'Error';
      editorStatus.style.color = 'var(--accent-rose)';
    } finally {
      btnRun.disabled = false;
      btnStop.disabled = true;
      interpreterInstance = null;
    }
  });

  btnStop.addEventListener('click', () => {
    if (interpreterInstance) {
      interpreterInstance.stop();
      appendLog('Execution stopped by user.', 'warning');
    }
  });

  function appendLog(message, type = 'info', timeStr = null) {
    const time = timeStr || new Date().toLocaleTimeString();
    const item = document.createElement('div');
    item.className = `log-item ${type}`;
    item.innerHTML = `
      <span class="log-time">${time}</span>
      <span>${escapeHTML(message)}</span>
    `;
    logsList.appendChild(item);
    logsList.scrollTop = logsList.scrollHeight;

    const count = logsList.children.length;
    document.getElementById('log-count').textContent = `${count} Logs`;
  }

  function renderASTNodes(ast) {
    flowContainer.innerHTML = '';
    if (!ast || !ast.body) return;

    document.getElementById('ast-count').textContent = `${ast.body.length} Statements`;

    ast.body.forEach((stmt, idx) => {
      const card = document.createElement('div');
      card.className = 'node-card';

      let tagClass = 'tag-command';
      let label = stmt.type;

      if (stmt.type === 'CommandStatement') {
        label = `Command: ${stmt.name}`;
        if (['move_motor', 'rotate_servo', 'gripper_state', 'set_speed'].includes(stmt.name)) {
          tagClass = 'tag-hardware';
        }
      } else if (stmt.type === 'AssignmentStatement') {
        tagClass = 'tag-assign';
        label = `Set $${stmt.variable}`;
      } else if (stmt.type === 'PipelineStatement') {
        tagClass = 'tag-pipeline';
        label = 'Pipeline: ->';
      }

      card.innerHTML = `
        <div>
          <div style="font-weight: 600;">${escapeHTML(label)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Step #${idx + 1}</div>
        </div>
        <span class="node-tag ${tagClass}">${stmt.type.replace('Statement', '')}</span>
      `;
      flowContainer.appendChild(card);
    });
  }

  function updateVariablesUI(variablesMap) {
    variablesGrid.innerHTML = '';
    if (variablesMap.size === 0) {
      variablesGrid.innerHTML = `
        <div style="color: var(--text-muted); text-align: center; font-size: 0.8rem; padding: 12px;">
          No variables assigned yet.
        </div>`;
      return;
    }

    variablesMap.forEach((val, key) => {
      const row = document.createElement('div');
      row.className = 'var-row';
      const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      row.innerHTML = `
        <span class="var-name">$${escapeHTML(key)}</span>
        <span class="var-val" title="${escapeHTML(displayVal)}">${escapeHTML(displayVal)}</span>
      `;
      variablesGrid.appendChild(row);
    });
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
