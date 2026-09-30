# NovaLang v2.5 Universal Hardware & AI Platform (`.nova`) — Complete Blueprint

Welcome to **NovaLang v2.5 Platform**, built inside `/config/Desktop/Session2/novalang`.

NovaLang v2.5 is a super-advanced process automation language, natural language story compiler, keyframe macro motion recorder, universal hardware device hub, and AI hardware platform.

---

## 🚀 Key Features in NovaLang v2.5

1. **Universal Hardware Device Hub & Registry (`src/hardware/device_registry.js`)**:
   Connects and manages ANY mechanical or electronic component:
   - Base Rotational Servo (`dev_servo_base`)
   - Shoulder Stepper Actuator (`dev_stepper_arm`)
   - Main Assembly Conveyor Drive (`dev_dc_conveyor`)
   - Precision End-Effector Gripper (`dev_pneumatic_gripper`)
   - Infrared Thermal Telemetry Array (`dev_thermal_sensor`)

2. **Device Bio & Technical Capability Sheet Inspector (`index.html`, `app.js`)**:
   Clicking any device in the grid opens an interactive Inspector Modal displaying component bios, manufacturer details, technical specs (Voltage, Torque, Max RPM, Precision), and supported command capabilities (`rotate_angle`, `set_speed`, `read_telemetry`).

3. **Targeted Component Motion Tracker (`src/hardware/device_tracker.js`)**:
   Select any connected device, start tracking, move or rotate the device, stop, and automatically generate executable `.nova` repeating code loops!

4. **Natural Language "Story-to-Code" Compiler (`src/ai/story_compiler.js`)**:
   Converts plain English stories/descriptions into valid NovaLang script code:
   ```text
   Story Input: "Move motor base to 90 degrees at speed 60, start conveyor belt at 150 RPM, wait 2 seconds, grab payload with gripper"
   ```

5. **AI Hardware Copilot (`src/ai/hardware_copilot.js`)**:
   Analyzes fleet health (98% Optimal) and translates natural language prompts into multi-device hardware automation scripts.

6. **Microcontroller Serial Bridge & Arduino Firmware (`hardware/arduino_novalang_bridge.ino`)**:
   Upload C++ firmware sketch to Arduino UNO / ESP32 to connect 4 physical servo motors, read real-time position feedback, and execute NovaLang motion sequences over USB/Serial at 115200 Baud.

---

## 🗂️ Project Directory Layout

```
/config/Desktop/Session2/novalang/
├── bin/
│   └── novalang.js             # Executable CLI engine with Story mode
├── src/
│   ├── ai/
│   │   ├── story_compiler.js   # Natural Language Story-to-Code Compiler
│   │   └── hardware_copilot.js # AI Hardware Copilot Engine
│   ├── hardware/
│   │   ├── device_registry.js  # Universal Device Registry & Bios
│   │   ├── device_tracker.js   # Targeted Component Motion Tracker
│   │   └── serial_bridge.js   # USB/WebSerial Hardware Driver
│   ├── motion/
│   │   └── macro_recorder.js   # Keyframe Motion Macro Recorder & Replayer
│   ├── parser/
│   │   ├── lexer.js            # Lexical tokenizer
│   │   └── parser.js           # Abstract Syntax Tree parser
│   └── runtime/
│       ├── interpreter.js      # Async execution runtime engine
│       └── stdlib.js           # Standard library (Hardware, Devices, Web, HTTP, AI, IO)
├── hardware/
│   └── arduino_novalang_bridge.ino # Arduino/ESP32 C++ firmware sketch
├── examples/
│   ├── motor_control.nova      # Hardware motor control script
│   └── web_scraper.nova        # Web scraping & lead enrichment script
├── index.html                  # NovaLang Studio v2.5 UI
├── style.css                   # Dark glassmorphism styling
├── app.js                      # Web Studio controller
├── nova.json                   # Package manifest
├── README.md                   # Master Platform Documentation
└── scratch/
    ├── test_runner.js          # Core v2.0 verification test suite
    └── test_runner_v25.js      # Universal v2.5 hardware test suite
```

---

## 💻 How to Run NovaLang v2.5

### 1. Run via Terminal CLI
```bash
cd /config/Desktop/Session2/novalang

# Execute NovaLang motor script
node bin/novalang.js examples/motor_control.nova

# Compile and execute a Natural Language Story directly
node bin/novalang.js --story "Move motor base to 90 degrees at speed 80 and wait 1s"
```

### 2. Run Interactive Web Studio v2.5 IDE
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your web browser:
- Inspect Connected Devices Grid (5 devices)
- Click any device card to view its **Device Bio & Specs Modal**
- Select a target device and click **"🔴 Start Device Motion Tracker"**
- Click **"Compile Story"** to convert plain English to NovaLang code
- Run scripts and watch the AST Statement Graph & Console Logs in real time!

---

## 🧪 How to Test & Verify

### 1. Run Universal Hardware & Copilot Test Suite
```bash
node scratch/test_runner_v25.js
```

### 2. Run Engine & Parser Verification Test Suite
```bash
node scratch/test_runner.js
```

---

## 🔗 GitHub Repository

- **Repository:** [https://github.com/anwinnova/novalang](https://github.com/anwinnova/novalang)
- **Branch:** `main`
