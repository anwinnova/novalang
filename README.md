# NovaLang v2.0 Platform (`.nova`) — Complete Technical & Founder Blueprint

Welcome to **NovaLang v2.0 Platform**, built inside `/config/Desktop/Session2/novalang`.

NovaLang v2.0 is a super-advanced process automation language, natural language story compiler, motion macro recorder, and hardware motor control platform.

---

## 🚀 Key Features in NovaLang v2.0

1. **Natural Language "Story-to-Code" Compiler (`src/ai/story_compiler.js`)**:
   Converts plain English stories/descriptions into valid NovaLang script code:
   ```text
   Story Input: "Move motor base to 90 degrees at speed 60, wait 2 seconds, grab payload with gripper, move motor shoulder to 180 degrees"
   
   Generated NovaLang Code:
   move_motor "motor_base" 90 60
   wait 2s
   gripper_state "close"
   move_motor "motor_shoulder" 180 50
   ```

2. **Interactive Keyframe Motion Macro Recorder (`src/motion/macro_recorder.js`)**:
   Manually adjust virtual motors, servos, and grippers in real time, record keyframe poses, and export executable `.nova` loop scripts!

3. **Hardware Motor & Component Standard Library (`src/runtime/stdlib.js`)**:
   Primitives for `move_motor`, `rotate_servo`, `set_speed`, `gripper_state`, `read_sensor`, `record_pose`, and `replay_motion`.

4. **Executable CLI Engine with Story Mode (`bin/novalang.js`)**:
   Run `.nova` files or pass stories directly via CLI:
   ```bash
   node bin/novalang.js --story "Move motor base to 90 degrees and wait 2 seconds"
   ```

---

## 🗂️ Project Directory Layout

```
/config/Desktop/Session2/novalang/
├── bin/
│   └── novalang.js             # Executable CLI engine with Story mode
├── src/
│   ├── ai/
│   │   └── story_compiler.js   # Natural Language Story-to-Code Compiler
│   ├── motion/
│   │   └── macro_recorder.js   # Keyframe Motion Macro Recorder & Replayer
│   ├── parser/
│   │   ├── lexer.js            # Lexical tokenizer
│   │   └── parser.js           # Abstract Syntax Tree parser
│   └── runtime/
│       ├── interpreter.js      # Async execution runtime engine
│       └── stdlib.js           # Standard library (Hardware, Web, HTTP, AI, IO)
├── examples/
│   ├── motor_control.nova      # Hardware motor control script
│   └── web_scraper.nova        # Web scraping & lead enrichment script
├── index.html                  # NovaLang Studio v2.0 UI
├── style.css                   # Dark glassmorphism styling
├── app.js                      # Web Studio controller
├── nova.json                   # Package manifest
├── README.md                   # Master Platform Documentation
└── scratch/
    └── test_runner.js          # Verification test suite
```

---

## 💻 How to Run NovaLang v2.0

### 1. Terminal CLI Execution
```bash
cd /config/Desktop/Session2/novalang

# Execute NovaLang motor script
node bin/novalang.js examples/motor_control.nova

# Compile and execute a Natural Language Story directly
node bin/novalang.js --story "Move motor base to 90 degrees at speed 80 and wait 1s"
```

### 2. Interactive Web Studio v2.0 IDE
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your web browser to access:
- **Story AI Compiler**: Input plain English stories and convert to code with 1 click.
- **Virtual Motor Studio**: Adjust sliders for Motor Base, Shoulder, Wrist, and Gripper, record poses, and export loop scripts.
- **Live Statement Flow & Variable Inspector**.

### 3. Automated Code Verification Tests
```bash
node scratch/test_runner.js
```
