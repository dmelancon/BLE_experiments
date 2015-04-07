var SensorTag = require('sensortag');
var prevLux = 0;

var UUID = '68c90b04c182';
 SensorTag.discoverByUuid(UUID,function(sensorTag) {

  console.log('discover');
  sensorTag.connect(function() {
    console.log('connect');
    sensorTag.discoverServicesAndCharacteristics(function() {
      console.log('discoverServices');

        sensorTag.enableHumidity(function() {
          sensorTag.on('humidityChange', function(temperature, humidity) {
            console.log('\ttemperature = %d °C', temperature.toFixed(1));
            // console.log('\thumidity = %d %', humidity.toFixed(1));
          });
 
          sensorTag.notifyHumidity(function() {
            console.log('notifyHumidity');
          });
        });
          sensorTag.enableLuxometer(function(){
            sensorTag.on('luxometerChange', function(lux){
              console.log("\tLightlevel: " + lux);
              lightEvent(lux);
            });
          sensorTag.notifyLuxometer(function() {
            console.log('notifyLuxometer');
          });
      });
           });
  });
});

var door= false;
var prevDoor = false;
var counter = 0;

var lightEvent = function(lux){
    if (lux > 30){
      door = true;
      console.log("this is happening");
      if (door == prevDoor){
          counter ++;
      }
    }else{
      if (prevDoor == true){
        //set this counter + time to data
         console.log(counter);
      }
      door = false;
      counter =0;
    }
    prevDoor = door;
}

