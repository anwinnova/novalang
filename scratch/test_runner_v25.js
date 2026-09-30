import { Lexer } from '../src/parser/lexer.js';
import { Parser } from '../src/parser/parser.js';
import { Interpreter } from '../src/runtime/interpreter.js';
import { DeviceRegistry } from '../src/hardware/device_registry.js';
import { DeviceTracker } from '../src/hardware/device_tracker.js';
import { HardwareCopilot } from '../src/ai/hardware_copilot.js';

async function testV25() {
  console.log("=========================================");
  console.log("   NovaLang v2.5 Universal Hub Test     ");
  console.log("=========================================");

  // 1. Test Device Registry & Bios
  console.log("\n[1] Testing Universal Hardware Device Registry...");
  const registry = new DeviceRegistry();
  const devices = registry.getAllDevices();
  console.log(`Discovered ${devices.length} hardware devices:`);
  devices.forEach(d => {
    console.log(` - [${d.id}] ${d.name} (${d.type} - ${d.model}) | Health: ${d.healthScore}%`);
  });

  // 2. Test Targeted Device Motion Tracker
  console.log("\n[2] Testing Targeted Device Motion Tracker...");
  const tracker = new DeviceTracker();
  tracker.startTracking('dev_stepper_arm');
  tracker.recordDeviceState('dev_stepper_arm', { angle: 0, speed: 50 });
  tracker.recordDeviceState('dev_stepper_arm', { angle: 45, speed: 60 });
  tracker.recordDeviceState('dev_stepper_arm', { angle: 90, speed: 80 });
  tracker.stopTracking();

  const generatedReplayCode = tracker.generateNovaLangReplayCode(2);
  console.log("Generated Targeted Replay Script:");
  console.log("-----------------------------------------");
  console.log(generatedReplayCode);
  console.log("-----------------------------------------");

  // 3. Test AI Hardware Copilot
  console.log("\n[3] Testing AI Hardware Copilot...");
  const fleetReport = HardwareCopilot.analyzeDeviceFleet(devices);
  console.log("Fleet Analysis Report:", fleetReport);

  // 4. Test Execution Engine on Multi-Device Script
  console.log("\n[4] Testing Interpreter Execution Engine on Multi-Device Script...");
  const multiDeviceScript = `
device_move "dev_servo_base" 90 70
device_move "dev_stepper_arm" 45 60
gripper_state "close"
set_speed "dev_dc_conveyor" 150
log "Universal multi-device test complete!"
  `;

  const lexer = new Lexer(multiDeviceScript);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();

  const interpreter = new Interpreter({
    stepDelay: 0,
    onLog: (l) => console.log(`[${l.type.toUpperCase()}] ${l.message}`)
  });

  await interpreter.execute(ast);

  console.log("\n=========================================");
  console.log("   ✨ ALL NOVALANG V2.5 TESTS PASSED!   ");
  console.log("=========================================");
}

testV25().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
