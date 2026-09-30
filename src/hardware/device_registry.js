/**
 * NovaLang Universal Hardware Device Registry
 * Manages connected electronic & mechanical hardware devices (Servos, Steppers, DC Motors, Conveyors, Grippers, Actuators, Sensors)
 */

export class DeviceRegistry {
  constructor() {
    this.devices = new Map();
    this.initDefaultDevices();
  }

  initDefaultDevices() {
    const defaultList = [
      {
        id: 'dev_servo_base',
        name: 'Base Rotational Servo',
        type: 'Servo Motor',
        model: 'MG996R High-Torque Servo',
        manufacturer: 'NovaMotion Robotics',
        status: 'Connected',
        healthScore: 98,
        voltage: '6.0V',
        currentAngle: 90,
        speedRpm: 120,
        bio: 'Precision high-torque metal-geared servo motor responsible for primary rotational base positioning across 0° to 360° range.',
        capabilities: ['rotate_angle', 'set_speed', 'set_holding_torque', 'read_telemetry'],
        specs: { maxAngle: 360, torque: '11.0 kg-cm', precision: '0.2°' }
      },
      {
        id: 'dev_stepper_arm',
        name: 'Shoulder Stepper Actuator',
        type: 'Stepper Motor',
        model: 'NEMA 17 Bipolar Stepper',
        manufacturer: 'StepperTech Pro',
        status: 'Connected',
        healthScore: 99,
        voltage: '12.0V',
        currentAngle: 45,
        speedRpm: 300,
        bio: 'High-precision micro-stepping motor controlling shoulder lift angle with zero-backlash holding torque.',
        capabilities: ['step_microsteps', 'set_holding_current', 'set_acceleration', 'read_telemetry'],
        specs: { stepAngle: '1.8°', holdingTorque: '45 Ncm', maxCurrent: '1.5A' }
      },
      {
        id: 'dev_dc_conveyor',
        name: 'Main Assembly Conveyor Drive',
        type: 'DC Geared Motor',
        model: 'JGA25-370 Geared Motor',
        manufacturer: 'NovaDrive Systems',
        status: 'Active',
        healthScore: 95,
        voltage: '12.0V',
        currentAngle: 0,
        speedRpm: 150,
        bio: 'Heavy-duty DC gear motor providing continuous linear belt velocity for component payload transport.',
        capabilities: ['set_pwm_speed', 'reverse_direction', 'emergency_brake', 'read_encoder'],
        specs: { maxRpm: 300, gearRatio: '1:34', maxLoad: '15.0 kg' }
      },
      {
        id: 'dev_pneumatic_gripper',
        name: 'Precision End-Effector Gripper',
        type: 'Pneumatic / Servo Gripper',
        model: 'PG-20 Parallel Gripper',
        manufacturer: 'RoboGrip Dynamics',
        status: 'Connected',
        healthScore: 100,
        voltage: '5.0V',
        currentAngle: 0,
        speedRpm: 0,
        bio: 'Dual-jaw parallel motion gripper equipped with force-feedback sensors to clamp fragile objects securely without damage.',
        capabilities: ['clamp_close', 'clamp_open', 'read_force_feedback', 'adjust_grip_pressure'],
        specs: { maxGripForce: '40N', strokeDistance: '50mm', sensorType: 'Piezoresistive' }
      },
      {
        id: 'dev_thermal_sensor',
        name: 'Infrared Thermal Telemetry Array',
        type: 'Optical Sensor',
        model: 'AMG8833 Grid-EYE Thermal Camera',
        manufacturer: 'NovaSense AI',
        status: 'Connected',
        healthScore: 97,
        voltage: '3.3V',
        currentAngle: 0,
        speedRpm: 0,
        bio: '8x8 thermal array sensor measuring ambient motor temperatures, overheating risks, and component thermal dissipation in real time.',
        capabilities: ['read_temperature', 'trigger_thermal_alert', 'export_heatmap'],
        specs: { tempRange: '-20°C to 80°C', accuracy: '±2.5°C', frameRate: '10Hz' }
      }
    ];

    defaultList.forEach(dev => this.devices.set(dev.id, dev));
  }

  getAllDevices() {
    return Array.from(this.devices.values());
  }

  getDevice(id) {
    return this.devices.get(id) || null;
  }

  updateTelemetry(id, updates) {
    const dev = this.devices.get(id);
    if (dev) {
      Object.assign(dev, updates);
      return dev;
    }
    return null;
  }
}
