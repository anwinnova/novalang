/**
 * NovaLang Targeted Device Motion Tracker
 * Tracks individual hardware component movements, rotation changes, and state toggles, and generates NovaLang scripts.
 */

export class DeviceTracker {
  constructor() {
    this.activeDeviceId = null;
    this.isTracking = false;
    this.recordedEvents = [];
    this.startTime = null;
  }

  startTracking(deviceId) {
    this.activeDeviceId = deviceId;
    this.isTracking = true;
    this.recordedEvents = [];
    this.startTime = Date.now();
  }

  recordDeviceState(deviceId, statePayload) {
    if (!this.isTracking || this.activeDeviceId !== deviceId) return;

    const now = Date.now();
    const delayMs = this.recordedEvents.length > 0 ? now - this.recordedEvents[this.recordedEvents.length - 1].timestamp : 300;

    this.recordedEvents.push({
      timestamp: now,
      delayMs: Math.max(100, delayMs),
      deviceId,
      state: { ...statePayload }
    });
  }

  stopTracking() {
    this.isTracking = false;
    return this.recordedEvents;
  }

  generateNovaLangReplayCode(repeatCount = 3) {
    if (!this.activeDeviceId || this.recordedEvents.length === 0) {
      return `# No motion events recorded for targeted device '${this.activeDeviceId || 'none'}'.\nlog "Please track a component motion first"`;
    }

    const lines = [];
    lines.push(`# NovaLang Targeted Device Replay Script`);
    lines.push(`# Target Component ID: ${this.activeDeviceId}`);
    lines.push(`# Recorded Events: ${this.recordedEvents.length}`);
    lines.push(`# Repeat Loops: ${repeatCount}\n`);

    lines.push(`repeat ${repeatCount} times`);
    lines.push(`  log "Replaying targeted automation sequence for ${this.activeDeviceId}..."`);

    this.recordedEvents.forEach((evt, idx) => {
      lines.push(`  # Motion Event #${idx + 1}`);

      if (evt.state.angle !== undefined) {
        lines.push(`  device_move "${this.activeDeviceId}" ${evt.state.angle} ${evt.state.speed || 50}`);
      } else if (evt.state.gripper !== undefined) {
        lines.push(`  gripper_state "${evt.state.gripper}"`);
      } else if (evt.state.rpm !== undefined) {
        lines.push(`  set_speed "${this.activeDeviceId}" ${evt.state.rpm}`);
      } else {
        lines.push(`  log "Device event: ${JSON.stringify(evt.state)}"`);
      }

      lines.push(`  wait ${evt.delayMs}ms\n`);
    });

    lines.push('end');
    lines.push(`log "Targeted device automation loop for ${this.activeDeviceId} finished!"`);

    return lines.join('\n');
  }
}
