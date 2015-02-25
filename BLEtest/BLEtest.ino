
// Import libraries (BLEPeripheral depends on SPI)
#include <SPI.h>
#include <BLEPeripheral.h>
#include <TimerOne.h>
// define pins (varies per shield/board)
#define BLE_REQ   10
#define BLE_RDY   2
#define BLE_RST   9

BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);

BLEService potService = BLEService("fff0");

BLECharCharacteristic potCharacteristic = BLECharCharacteristic("fff1", BLERead | BLENotify);
BLEDescriptor potDescriptor = BLEDescriptor("2901", "pot");
volatile bool readFromSensor = false;
float lastReading;
void setup() {
  Serial.begin(115200);
#if defined (__AVR_ATmega32U4__)
  delay(5000);  //5 seconds delay for enabling to see the start up comments on the serial board
#endif

  blePeripheral.setLocalName("Dan's BLE"); // optional
  //blePeripheral.setAdvertisedServiceUuid(potService.uuid()); // optional
  blePeripheral.addAttribute(potService);
  blePeripheral.addAttribute(potCharacteristic);
  blePeripheral.addAttribute(potDescriptor);
  //eventHander for 
  blePeripheral.setEventHandler(BLEConnected, blePeripheralConnectHandler); 
  blePeripheral.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);

  // begin initialization
  blePeripheral.begin();
  Timer1.initialize(10000); // in milliseconds
  Timer1.attachInterrupt(timerHandler);
}

void loop() {
    blePeripheral.poll();
    if (readFromSensor) {
      setPotCharacteristicValue();
      readFromSensor = false;
    }
}

void timerHandler() {
  readFromSensor = true;
}

void setPotCharacteristicValue() {
  float reading = analogRead(A0);
  if (!isnan(reading) && significantChange(lastReading, reading, 50.0)) {
    potCharacteristic.setValue(reading/4);
    Serial.print(F("Pot: ")); Serial.println(reading/4);
    lastReading = reading;
  }
}

boolean significantChange(float val1, float val2, float threshold) {
  return (abs(val1 - val2) >= threshold);
}

void blePeripheralConnectHandler(BLECentral& central) {
  Serial.print(F("Connected event, central: "));
  Serial.println(central.address());
}

void blePeripheralDisconnectHandler(BLECentral& central) {
  Serial.print(F("Disconnected event, central: "));
  Serial.println(central.address());
}

