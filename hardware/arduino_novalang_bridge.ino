/*
  NovaLang Physical Microcontroller Firmware (Arduino / ESP32)
  Upload this sketch to your Arduino UNO / ESP32 to connect 4 Servo Motors & Gripper to NovaLang!

  Pin Connections:
  - Servo Motor 1 (Base): Pin 3
  - Servo Motor 2 (Shoulder): Pin 5
  - Servo Motor 3 (Elbow): Pin 6
  - Servo Motor 4 (Wrist): Pin 9
  - Servo Motor 5 (Gripper): Pin 10
  - Feedback Encoders / Potentiometers (for Record Mode): Analog Pins A0, A1, A2, A3
*/

#include <Servo.h>

Servo servo1;
Servo servo2;
Servo servo3;
Servo servo4;
Servo gripper;

void setup() {
  Serial.begin(115200);

  servo1.attach(3);
  servo2.attach(5);
  servo3.attach(6);
  servo4.attach(9);
  gripper.attach(10);

  // Initial Home Positions
  servo1.write(90);
  servo2.write(0);
  servo3.write(0);
  servo4.write(90);
  gripper.write(0);
}

void loop() {
  // 1. Read commands sent from NovaLang over Serial
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    // Parse "MOVE <motorNum> <angle> <speed>"
    if (command.startsWith("MOVE")) {
      int firstSpace = command.indexOf(' ');
      int secondSpace = command.indexOf(' ', firstSpace + 1);
      int thirdSpace = command.indexOf(' ', secondSpace + 1);

      int motorNum = command.substring(firstSpace + 1, secondSpace).toInt();
      int angle = command.substring(secondSpace + 1, thirdSpace).toInt();

      if (motorNum == 1) servo1.write(angle);
      else if (motorNum == 2) servo2.write(angle);
      else if (motorNum == 3) servo3.write(angle);
      else if (motorNum == 4) servo4.write(angle);
    }
    // Parse "GRIPPER <state>"
    else if (command.startsWith("GRIPPER")) {
      int state = command.substring(8).toInt();
      gripper.write(state == 1 ? 90 : 0);
    }
  }

  // 2. Read physical motor position feedback (from potentiometers or encoders)
  // and send telemetry back to NovaLang for RECORD MODE
  int pos1 = map(analogRead(A0), 0, 1023, 0, 180);
  int pos2 = map(analogRead(A1), 0, 1023, 0, 180);
  int pos3 = map(analogRead(A2), 0, 1023, 0, 180);
  int pos4 = map(analogRead(A3), 0, 1023, 0, 180);
  int gripState = digitalRead(2); // Toggle switch for physical gripper

  // Broadcast feedback line to NovaLang
  Serial.print("POS M1:"); Serial.print(pos1);
  Serial.print(" M2:"); Serial.print(pos2);
  Serial.print(" M3:"); Serial.print(pos3);
  Serial.print(" M4:"); Serial.print(pos4);
  Serial.print(" G:"); Serial.println(gripState);

  delay(50); // 20 Hz feedback sample rate
}
