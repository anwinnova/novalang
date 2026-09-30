/**
 * NovaLang Physical Hardware Serial Bridge (USB / WebSerial / Microcontroller)
 * Communicates bi-directionally with Arduino / ESP32 / Raspberry Pi / PCA9685 Servo Drivers.
 */

export class PhysicalHardwareBridge {
  constructor(options = {}) {
    this.baudRate = options.baudRate || 115200;
    this.isConnected = false;
    this.port = null;
    this.onTelemetry = options.onTelemetry || (() => {});
    this.motorFeedback = {
      motor1: 0,
      motor2: 0,
      motor3: 0,
      motor4: 0,
      gripper: 'open'
    };
  }

  /**
   * Connects to physical microcontroller via WebSerial API (Browser) or Node SerialPort
   */
  async connect() {
    if (typeof navigator !== 'undefined' && navigator.serial) {
      try {
        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: this.baudRate });
        this.isConnected = true;
        this.startReadingStream();
        return true;
      } catch (err) {
        console.warn('[Hardware Bridge] WebSerial connection canceled or unavailable:', err.message);
        return false;
      }
    } else {
      console.log('[Hardware Bridge] Initializing Node.js Simulated Hardware Serial Stream (115200 Baud)');
      this.isConnected = true;
      return true;
    }
  }

  /**
   * Continuous background reader for reading physical motor potentiometer/encoder angles
   */
  async startReadingStream() {
    if (!this.port) return;

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          this.parseSerialFeedback(value);
        }
      }
    } catch (err) {
      console.error('[Hardware Bridge] Serial stream read error:', err);
    }
  }

  /**
   * Parses telemetry line from physical Arduino/ESP32
   * Expected serial format: "POS M1:90 M2:45 M3:120 M4:30 G:1"
   */
  parseSerialFeedback(line) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('POS')) return;

    const matches = trimmed.match(/M1:(\d+)\s+M2:(\d+)\s+M3:(\d+)\s+M4:(\d+)\s+G:(\d+)/);
    if (matches) {
      this.motorFeedback = {
        motor1: parseInt(matches[1]),
        motor2: parseInt(matches[2]),
        motor3: parseInt(matches[3]),
        motor4: parseInt(matches[4]),
        gripper: matches[5] === '1' ? 'close' : 'open'
      };
      this.onTelemetry(this.motorFeedback);
    }
  }

  /**
   * Sends physical PWM signal command to microcontroller
   * Command format: "MOVE <motorNum> <angle> <speed>\n"
   */
  async sendMotorCommand(motorNum, angle, speed = 50) {
    const command = `MOVE ${motorNum} ${angle} ${speed}\n`;
    await this.writeRaw(command);
  }

  /**
   * Sends gripper pulse command to microcontroller
   */
  async sendGripperCommand(state) {
    const val = state === 'close' ? 1 : 0;
    const command = `GRIPPER ${val}\n`;
    await this.writeRaw(command);
  }

  async writeRaw(dataStr) {
    if (this.port && this.port.writable) {
      const writer = this.port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(dataStr));
      writer.releaseLock();
    }
  }
}
