/**
 * NovaLang Keyframe Motion Macro Recorder & Code Generator
 * Captures manual motor poses and generates replayable NovaLang (.nova) automation loops.
 */

export class KeyframeMacroRecorder {
  constructor() {
    this.keyframes = [];
    this.isRecording = false;
    this.lastRecordedTime = null;
  }

  startRecording() {
    this.isRecording = true;
    this.keyframes = [];
    this.lastRecordedTime = Date.now();
  }

  stopRecording() {
    this.isRecording = false;
    return this.keyframes;
  }

  /**
   * Adds a recorded motor keyframe pose
   * @param {Object} poseState - { motor1, motor2, motor3, gripper, speed }
   */
  addKeyframe(poseState) {
    const now = Date.now();
    const delayMs = this.lastRecordedTime ? Math.max(200, now - this.lastRecordedTime) : 500;
    this.lastRecordedTime = now;

    const keyframe = {
      id: 'kf_' + (this.keyframes.length + 1),
      timestamp: now,
      delayMs,
      motor1: poseState.motor1 ?? 0,
      motor2: poseState.motor2 ?? 0,
      motor3: poseState.motor3 ?? 0,
      gripper: poseState.gripper || 'open',
      speed: poseState.speed || 50
    };

    this.keyframes.push(keyframe);
    return keyframe;
  }

  clear() {
    this.keyframes = [];
    this.lastRecordedTime = null;
  }

  /**
   * Converts keyframe timeline into executable NovaLang code
   * @param {number} repeatCount - Number of iterations for playback
   * @returns {string} Executable NovaLang source code
   */
  toNovaLangCode(repeatCount = 1) {
    if (this.keyframes.length === 0) {
      return '# No motion keyframes recorded yet.\nlog "Please record motor poses in Motion Studio"';
    }

    const lines = [];
    lines.push('# NovaLang Motion Macro Recording Script');
    lines.push(`# Total Keyframes: ${this.keyframes.length}`);
    lines.push(`# Loop Iterations: ${repeatCount}\n`);

    if (repeatCount > 1) {
      lines.push(`repeat ${repeatCount} times`);
      lines.push('  log "Executing Recorded Motion Loop..."');
    }

    const indent = repeatCount > 1 ? '  ' : '';

    this.keyframes.forEach((kf, idx) => {
      lines.push(`${indent}# Keyframe #${idx + 1}`);
      lines.push(`${indent}move_motor "motor_base" ${kf.motor1} ${kf.speed}`);
      lines.push(`${indent}move_motor "motor_shoulder" ${kf.motor2} ${kf.speed}`);
      lines.push(`${indent}move_motor "motor_wrist" ${kf.motor3} ${kf.speed}`);
      lines.push(`${indent}gripper_state "${kf.gripper}"`);
      lines.push(`${indent}wait ${kf.delayMs}ms\n`);
    });

    if (repeatCount > 1) {
      lines.push('end');
    }

    lines.push('log "Recorded motion sequence playback complete!"');
    return lines.join('\n');
  }
}
