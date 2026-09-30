/**
 * NovaLang v2.5 Studio Controller
 * Universal Hardware Device Hub, Device Bio Inspector, Targeted Motion Tracker & AI Hardware Copilot.
 */

import { Lexer } from './src/parser/lexer.js';
import { Parser } from './src/parser/parser.js';
import { Interpreter } from './src/runtime/interpreter.js';
import { StoryCompiler } from './src/ai/story_compiler.js';
import { KeyframeMacroRecorder } from './src/motion/macro_recorder.js';
import { DeviceRegistry } from './src/hardware/device_registry.js';
import { DeviceTracker } from './src/hardware/device_tracker.js';
import { HardwareCopilot } from './src/ai/hardware_copilot.js';

const TEMPLATES = {
  devices: `# NovaLang v2.5 Multi-Device Hardware Fleet Script (.nova)
# Author: Founder & Creator

log "Starting Universal Hardware Device Synchronization..."

# Step 1: Initialize Conveyor & Position Base Servo
set_speed "dev_dc_conveyor" 150
device_move "dev_servo_base" 90 70
wait 500ms

# Step 2: Extend Shoulder Stepper Actuator
device_move "dev_stepper_arm" 45 60
wait 400ms

# Step 3: Clamp Payload with Pneumatic Gripper
gripper_state "close"
wait 500ms

# Step 4: Verify Thermal Sensor Array Feedback
set $temp = read_sensor "thermal_array"
log "Thermal Feedback Verified:" $temp

log "Multi-Device Hardware Sequence Completed Successfully!"`,

  motor: `# NovaLang v2.0 Motor & Hardware Automation Script (.nova)
move_motor "motor_base" 90 60
wait 300ms
move_motor "motor_shoulder" 45 50
gripper_state "close"
wait 400ms
move_motor "motor_base" 180 80
gripper_state "open"`,

  scraper: `# NovaLang Web Scraper & Lead Enrichment (.nova)
set $url = "https://portal.novasmart.io/leads"
open $url
click "#btn-login"
type "#input-search" "Enterprise Clients"
click "#btn-search"
wait 500ms
set $data = extract "table.leads-grid"
http_get "https://api.novasmart.io/enrich" -> ai "Analyze these leads" -> export "leads.json"`,

  pipeline: `# NovaLang API & AI Pipeline (.nova)
http_get "https://api.github.com/orgs/novasmart/repos" -> ai "Summarize repositories" -> export "summary.json"`
};

let interpreterInstance = null;
const macroRecorder = new KeyframeMacroRecorder();
const deviceRegistry = new DeviceRegistry();
const deviceTracker = new DeviceTracker();

let selectedDeviceId = 'dev_servo_base';
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

  const deviceCardsGrid = document.getElementById('device-cards-grid');
  const targetDeviceLabel = document.getElementById('target-device-label');
  const btnTrackDevice = document.getElementById('btn-track-device');
  const btnStopTrack = document.getElementById('btn-stop-track');

  // Bio Modal Elements
  const bioModal = document.getElementById('device-bio-modal');
  const bioDeviceName = document.getElementById('bio-device-name');
  const bioDeviceModel = document.getElementById('bio-device-model');
  const bioDescription = document.getElementById('bio-description');
  const bioSpecsGrid = document.getElementById('bio-specs-grid');
  const bioCapabilitiesList = document.getElementById('bio-capabilities-list');
  const btnCloseBio = document.getElementById('btn-close-bio');

  // Sliders
  const sliderM1 = document.getElementById('slider-m1');
  const sliderM2 = document.getElementById('slider-m2');
  const sliderM3 = document.getElementById('slider-m3');
  const valM1 = document.getElementById('val-m1');
  const valM2 = document.getElementById('val-m2');
  const valM3 = document.getElementById('val-m3');
  const btnToggleGripper = document.getElementById('btn-toggle-gripper');
  const btnRecordKf = document.getElementById('btn-record-kf');
  const btnExportMacro = document.getElementById('btn-export-macro');

  codeEditor.value = TEMPLATES.devices;

  renderDeviceHubCards();

  // Slider event listeners & Device Motion Tracker events
  sliderM1.addEventListener('input', () => {
    valM1.textContent = `${sliderM1.value}°`;
    if (deviceTracker.isTracking) {
      deviceTracker.recordDeviceState(selectedDeviceId, { angle: parseInt(sliderM1.value), speed: 60 });
      appendLog(`[Tracker] Motion event recorded for ${selectedDeviceId} -> Angle: ${sliderM1.value}°`, 'hardware');
    }
  });

  sliderM2.addEventListener('input', () => { valM2.textContent = `${sliderM2.value}°`; });
  sliderM3.addEventListener('input', () => { valM3.textContent = `${sliderM3.value}°`; });

  btnToggleGripper.addEventListener('click', () => {
    currentGripperState = currentGripperState === 'open' ? 'close' : 'open';
    btnToggleGripper.textContent = currentGripperState === 'open' ? 'Open' : 'Closed';
    btnToggleGripper.className = currentGripperState === 'open' ? 'btn btn-secondary' : 'btn btn-accent';

    if (deviceTracker.isTracking) {
      deviceTracker.recordDeviceState(selectedDeviceId, { gripper: currentGripperState });
      appendLog(`[Tracker] Gripper event recorded for ${selectedDeviceId} -> ${currentGripperState}`, 'hardware');
    }
  });

  // Device Motion Tracker controls
  btnTrackDevice.addEventListener('click', () => {
    deviceTracker.startTracking(selectedDeviceId);
    btnTrackDevice.disabled = true;
    btnStopTrack.disabled = false;
    appendLog(`🔴 Started Motion Tracker for component '${selectedDeviceId}'. Move hardware/sliders now...`, 'warning');
  });

  btnStopTrack.addEventListener('click', () => {
    deviceTracker.stopTracking();
    btnTrackDevice.disabled = false;
    btnStopTrack.disabled = true;
    const generatedCode = deviceTracker.generateNovaLangReplayCode(3);
    codeEditor.value = generatedCode;
    appendLog(`📜 Exported Targeted Device Replay Script for '${selectedDeviceId}' to editor!`, 'success');
  });

  // Modal Bio Close
  btnCloseBio.addEventListener('click', () => { bioModal.classList.remove('open'); });

  // Keyframe Motion Recorder
  btnRecordKf.addEventListener('click', () => {
    const pose = {
      motor1: parseInt(sliderM1.value),
      motor2: parseInt(sliderM2.value),
      motor3: parseInt(sliderM3.value),
      gripper: currentGripperState,
      speed: 60
    };
    macroRecorder.addKeyframe(pose);
    appendLog(`🔴 Recorded Motor Keyframe #${macroRecorder.keyframes.length}`, 'hardware');
  });

  btnExportMacro.addEventListener('click', () => {
    codeEditor.value = macroRecorder.toNovaLangCode(2);
    appendLog(`📜 Exported ${macroRecorder.keyframes.length} keyframes to NovaLang code editor!`, 'success');
  });

  // Story Compiler
  btnCompileStory.addEventListener('click', () => {
    const storyText = storyInput.value.trim();
    if (!storyText) return;
    const compiled = StoryCompiler.compile(storyText);
    codeEditor.value = compiled.code;
    appendLog(`📖 Compiled Story into NovaLang statements!`, 'ai');
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
          } else if (evt.event === 'motor_motion' || evt.event === 'device_telemetry_updated') {
            if (evt.data.angle !== undefined) {
              sliderM1.value = evt.data.angle;
              valM1.textContent = `${evt.data.angle}°`;
            }
          }
        }
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

  function renderDeviceHubCards() {
    deviceCardsGrid.innerHTML = '';
    const devices = deviceRegistry.getAllDevices();

    devices.forEach((dev) => {
      const card = document.createElement('div');
      card.className = `device-card ${dev.id === selectedDeviceId ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="device-card-header">
          <span>${escapeHTML(dev.type)}</span>
          <span class="badge-health">${dev.healthScore}% OK</span>
        </div>
        <div class="device-card-name">${escapeHTML(dev.name)}</div>
        <div class="device-card-footer">
          <span>${escapeHTML(dev.model)}</span>
          <span style="color: var(--accent-amber); font-weight: 600;">Inspect Bio ➔</span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectedDeviceId = dev.id;
        targetDeviceLabel.textContent = `Target: ${dev.id}`;
        renderDeviceHubCards();
        openDeviceBioModal(dev);
      });

      deviceCardsGrid.appendChild(card);
    });
  }

  function openDeviceBioModal(dev) {
    bioDeviceName.textContent = `${dev.name} (${dev.id})`;
    bioDeviceModel.textContent = `${dev.type} • ${dev.model} • ${dev.manufacturer}`;
    bioDescription.textContent = dev.bio;

    bioSpecsGrid.innerHTML = `
      <div class="spec-box"><span>Operating Voltage</span><b>${dev.voltage}</b></div>
      <div class="spec-box"><span>Health Score</span><b style="color: var(--accent-green);">${dev.healthScore}%</b></div>
      <div class="spec-box"><span>Current Telemetry</span><b>Angle: ${dev.currentAngle}° | ${dev.speedRpm} RPM</b></div>
      ${Object.entries(dev.specs).map(([k, v]) => `
        <div class="spec-box"><span>${k.toUpperCase()}</span><b>${v}</b></div>
      `).join('')}
    `;

    bioCapabilitiesList.innerHTML = dev.capabilities.map(c => `
      <span class="capability-pill">⚡ ${c}</span>
    `).join('');

    bioModal.classList.add('open');
  }

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

    document.getElementById('log-count').textContent = `${logsList.children.length} Logs`;
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
        if (['device_move', 'move_motor', 'rotate_servo', 'gripper_state', 'set_speed'].includes(stmt.name)) {
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
