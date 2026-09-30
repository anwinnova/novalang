/**
 * NovaLang v2.0 Standard Library (stdlib)
 * Complete Automation Primitives: Hardware Motors/Robotics, Web DOM, HTTP, AI, and IO.
 */

export class StandardLibrary {
  constructor(runtime) {
    this.runtime = runtime;
  }

  // --- Hardware, Motor & Component Motion Primitives ---
  async move_motor(motorId, angleDegrees, speed = 50) {
    const angle = typeof angleDegrees === 'number' ? angleDegrees : parseFloat(angleDegrees) || 0;
    const spd = typeof speed === 'number' ? speed : parseFloat(speed) || 50;

    this.runtime.log(`[Hardware Motor] Moving ${motorId} -> Angle: ${angle}°, Speed: ${spd}%`, 'hardware');
    await this.runtime.delay(300);

    // Emit live motor motion event for virtual motor visualizer
    this.runtime.emitEvent('motor_motion', {
      motorId,
      angle,
      speed: spd,
      timestamp: Date.now()
    });

    this.runtime.setVariable(`pos_${motorId}`, angle);
    return { motorId, angle, speed: spd, status: 'positioned' };
  }

  async rotate_servo(servoId, angleDegrees) {
    const angle = parseFloat(angleDegrees) || 0;
    this.runtime.log(`[Servo] Rotating ${servoId} -> Angle: ${angle}°`, 'hardware');
    await this.runtime.delay(200);

    this.runtime.emitEvent('motor_motion', {
      motorId: servoId,
      angle,
      speed: 100,
      timestamp: Date.now()
    });

    return { servoId, angle };
  }

  async set_speed(componentId, rpm) {
    this.runtime.log(`[Hardware] Component '${componentId}' speed set to ${rpm} RPM`, 'hardware');
    await this.runtime.delay(100);
    return { componentId, rpm };
  }

  async gripper_state(actionState) {
    const state = String(actionState).toLowerCase();
    this.runtime.log(`[Gripper] Gripper state changed -> '${state}'`, 'hardware');
    await this.runtime.delay(250);

    this.runtime.emitEvent('gripper_change', { state });
    this.runtime.setVariable('gripper_status', state);
    return { component: 'gripper', state };
  }

  async read_sensor(sensorName) {
    this.runtime.log(`[Sensor] Reading feedback from '${sensorName}'...`, 'hardware');
    await this.runtime.delay(150);
    const reading = {
      sensor: sensorName,
      value: Math.floor(Math.random() * 100) + 10,
      unit: sensorName.includes('temp') ? '°C' : 'mm',
      status: 'OK'
    };
    this.runtime.log(`[Sensor] Value: ${reading.value}${reading.unit}`, 'info');
    return reading;
  }

  // --- Web & DOM Simulation ---
  async open(url) {
    this.runtime.log(`[Web] Opening URL: ${url}`, 'info');
    this.runtime.setVariable('current_url', url);
    await this.runtime.delay(350);
    this.runtime.emitEvent('dom_update', { action: 'navigate', url });
    return { status: 200, url, title: `NovaLang - ${url}` };
  }

  async click(selector) {
    this.runtime.log(`[Web] Clicked selector: '${selector}'`, 'info');
    await this.runtime.delay(200);
    this.runtime.emitEvent('dom_update', { action: 'click', selector });
    return true;
  }

  async type(selector, text) {
    this.runtime.log(`[Web] Typed into '${selector}': "${text}"`, 'info');
    await this.runtime.delay(250);
    this.runtime.emitEvent('dom_update', { action: 'type', selector, text });
    return true;
  }

  async wait(duration) {
    let ms = 1000;
    if (typeof duration === 'number') ms = duration;
    else if (typeof duration === 'string') {
      if (duration.endsWith('s')) ms = parseFloat(duration) * 1000;
      else if (duration.endsWith('ms')) ms = parseFloat(duration);
      else ms = parseFloat(duration) || 1000;
    }
    this.runtime.log(`[System] Waiting for ${ms}ms...`, 'system');
    await this.runtime.delay(ms);
    return true;
  }

  async extract(selectorOrTarget) {
    const inputState = this.runtime.getPipelineInput();
    this.runtime.log(`[Extract] Extracting pattern '${selectorOrTarget}'`, 'info');

    const result = {
      selector: selectorOrTarget,
      extracted_at: new Date().toISOString(),
      items: [
        { id: 101, title: 'NovaLang Motor Calibration Report', status: 'Completed', score: 99 },
        { id: 102, title: 'Hardware Sensor Telemetry Batch', status: 'Verified', score: 97 }
      ],
      input_source: inputState
    };
    this.runtime.setVariable('last_extracted', result);
    return result;
  }

  // --- Network & HTTP API ---
  async http_get(url) {
    this.runtime.log(`[HTTP GET] Requesting: ${url}`, 'network');
    await this.runtime.delay(300);

    const mockResponse = {
      status: 200,
      url,
      timestamp: Date.now(),
      data: {
        device: 'NovaSmart Arm v2',
        telemetry: { motor1_angle: 90, motor2_angle: 45, status: 'Ready' }
      }
    };
    this.runtime.log(`[HTTP GET] 200 OK`, 'success');
    return mockResponse;
  }

  async http_post(url, payload) {
    this.runtime.log(`[HTTP POST] Posting to ${url}`, 'network');
    await this.runtime.delay(300);
    return { status: 201, id: 'req_' + Math.random().toString(36).substring(2, 9), payload };
  }

  // --- AI Intelligence ---
  async ai(promptText, extraContext) {
    this.runtime.log(`[AI Engine] Processing prompt: "${promptText}"`, 'ai');
    await this.runtime.delay(500);

    const pipelineData = this.runtime.getPipelineInput() || extraContext;
    const aiOutput = {
      model: 'NovaLang-AI-v2',
      summary: `AI Intelligence analysis for: '${promptText}'`,
      processed_input: pipelineData
    };

    this.runtime.log(`[AI Engine] Generated AI response`, 'ai');
    return aiOutput;
  }

  // --- System & Utilities ---
  async log(...args) {
    const formatted = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
    this.runtime.log(`[User Log] ${formatted}`, 'user');
    return formatted;
  }

  async export(filename, data) {
    const content = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    this.runtime.log(`[Export] Saved export '${filename}' (${content.length} bytes)`, 'success');
    this.runtime.emitEvent('file_exported', { filename, content });
    return { filename, size: content.length };
  }
}
