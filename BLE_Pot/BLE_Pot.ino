// Import libraries (BLEPeripheral depends on SPI)
#include <SPI.h>
#include <BLEPeripheral.h>
#include <TimerOne.h>
// define pins (varies per shield/board)
#define BLE_REQ   6
#define BLE_RDY   7
#define BLE_RST   4

BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);

BLEService potService = BLEService("fff0");
BLECharCharacteristic potCharacteristic = BLECharCharacteristic("fff1", BLERead | BLENotify);
BLEDescriptor potDescriptor = BLEDescriptor("2901", "pot");

BLEService buttonService = BLEService("fff3");
BLECharCharacteristic buttonCharacteristic = BLECharCharacteristic("fff4",  BLERead | BLENotify | BLEWrite );
BLEDescriptor buttonDescriptor = BLEDescriptor("2901", "btn");

BLEService buttonService = BLEService("fff6");
BLECharCharacteristic buttonCharacteristic = BLECharCharacteristic("fff7",  BLERead | BLENotify | BLEWrite );
BLEDescriptor buttonDescriptor = BLEDescriptor("2901", "btn");


volatile bool readFromSensor = false;
float lastReading;
const int buttonPin = 1;
int buttonState;             // the current reading from the input pin
int lastButtonState = LOW;   // the previous reading from the input pin
long lastDebounceTime = 0;  // the last time the output pin was toggled
long debounceDelay = 50;    // the debounce time; increase if the output flickers
int onOff = false;
int prevOnOff = true;
int timerOn = false;
int firstTime;
long latestDuration= 0;
long duration = 0;
void setup() {
  Serial.begin(115200);
#if defined (__AVR_ATmega32U4__)
  delay(5000);  //5 seconds delay for enabling to see the start up comments on the serial board
#endif

  blePeripheral.setLocalName("Dan's BLE"); // optional
  blePeripheral.addAttribute(potService);
  blePeripheral.addAttribute(potCharacteristic);
  blePeripheral.addAttribute(potDescriptor);
  
  blePeripheral.addAttribute(buttonService);
  blePeripheral.addAttribute(buttonCharacteristic);
  blePeripheral.addAttribute(buttonDescriptor);

  blePeripheral.addAttribute(timerService);
  blePeripheral.addAttribute(timerCharacteristic);
  blePeripheral.addAttribute(timerDescriptor);

  //eventHander for connect/disconnect events
  blePeripheral.setEventHandler(BLEConnected, blePeripheralConnectHandler); 
  blePeripheral.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);


  buttonCharacteristic.setEventHandler(BLEWritten, buttonCharacteristicWritten);

  // begin initialization
  blePeripheral.begin();
  Timer1.initialize(1000000); // in microseconds
  Timer1.attachInterrupt(timerHandler,1000000);
  pinMode(buttonPin, INPUT);
 // Serial.println(blePeripheral);
}

void loop() {
    
  blePeripheral.poll();
  setButtonCharacteristicValue();
  if (readFromSensor) {
    setPotCharacteristicValue();
    readFromSensor = false;
  }  
  timer();    
    
}


void timerHandler() {
  readFromSensor = true;
  if(timerOn){
    duration ++;
  }
}
void setPotCharacteristicValue() {
  int reading = analogRead(A0);
  if (!isnan(reading) && significantChange(lastReading, reading, 50.0)) {
    potCharacteristic.setValue(reading/4);
    //Serial.println(potCharacteristic.value());
    Serial.print(F("Pot: ")); Serial.println(reading/4);
    lastReading = reading;
  }
}

void setButtonCharacteristicValue() {
  int reading = digitalRead(buttonPin);
  //Serial.println(buttonReading);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
   if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == HIGH) {
        onOff =! onOff;
        timerOn =! timerOn;
      }
    }
  }
  if (readFromSensor){
    if (significantChange(prevOnOff, onOff, 1)){
      buttonCharacteristic.setValue(onOff);
      Serial.print(F("Button: "));
      Serial.println(onOff);
      prevOnOff = onOff;
    }
  }

  lastButtonState = reading;
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

void buttonCharacteristicWritten(BLECentral& central, BLECharacteristic& characteristic) {
  Serial.print(F("Characteristic event, writen: "));
  Serial.println( buttonCharacteristic.value(), DEC);
}

void timer(){
  if (timerOn){
    firstTime = true;
    Serial.print("Timer ON: ");
    Serial.println(duration);
  }else if(firstTime){
    latestDuration = duration;
    duration =0;
    firstTime = false;
  }
  if (latestDuration>0){
      timerCharacteristic.setValue(latestDuration);
      Serial.print("Duration: ");
      Serial.println(latestDuration);
      latestDuration = 0;
  }
  
}
