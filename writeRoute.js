var noble = require('noble');
var fs = require('fs');
var express = require('express')
var app = express()

var buttonLevel = 1;
var lastButtonLevel = 0;
noble.startScanning([], false); // any service UUID, don't allow duplicates

var myPeripheral = {
   button: null,
   pot: null,
   timer: null
}

noble.on('discover', function(peripheral) {

  //only find peripheral with an advertisiment named Dan's BLE   //not secure
  if (peripheral.advertisement.localName == "Dan's BLE") {        
      peripheral.connect(function(error) {
          console.log('connected to peripheral: ' + peripheral.uuid);
        

        //find specific "fff0" service which is my Pot Serivce
          peripheral.discoverServices(['fff0','fff3','fff6'], function(error, services) {
              var potService = services[0];
              var buttonService = services[1];
              var timerService = services[2];
              console.log("potService :" + potService);
              console.log('discovered Button service');
              console.log("buttonService :" + buttonService);
              console.log('discovered Pot service');
              console.log("timerService :" + timerService);
              console.log('discovered Timer service');
              potService.discoverCharacteristics(['fff1'], function(error, characteristics) {
                    var potLevelCharacteristic = characteristics[0];
                    console.log('discovered Pot Level characteristic');
                    //read the data
                    myPeripheral.pot = potLevelCharacteristic;
                    //console.log("POT: " + myPeripheral.pot);
                    potLevelCharacteristic.on('read', function(data, isNotification) {
                      console.log('Pot level is now: ', data.readUInt8(0));
                      potLevel= data.readUInt8(0);
                    });
                    potLevelCharacteristic.notify(true, function(error) {
                      console.log('Pot level notification on');
                    });
                    //console.log("Peripheral After Pot Added: " +  myPeripheral);
              }); 

              buttonService.discoverCharacteristics(['fff4'], function(error, characteristics) {
                  var buttonCharacteristic = characteristics[0];
                  myPeripheral.button = buttonCharacteristic;
                 buttonCharacteristic.on('read', function(data, isNotification) {
                    console.log('Button level is now: ', data.readUInt8(0));
                    buttonLevel= data.readUInt8(0);
                  });
                  buttonCharacteristic.notify(true, function(error) {
                      console.log('Button level notification on');
                    });
              });
              timerService.discoverCharacteristics(['fff7'], function(error, characteristics) {
                  var timerCharacteristic = characteristics[0];
                  myPeripheral.timer = timerCharacteristic;
                 timerCharacteristic.on('read', function(data, isNotification) {
                    console.log('New Timer sent: ', data.readUInt8(0));
                    timerLevel= data.readUInt8(0);
                  });
                  timerCharacteristic.notify(true, function(error) {
                      console.log('Timer level notification on');
                    });
              });


          });
      });
  }
});

app.get('/write/:level', function(req, res) {
    buttonLevel=req.params.level;
    if (buttonLevel != lastButtonLevel){
        var tempBuffer = new Buffer([buttonLevel]);
        //console.log(buttonLevel);
        myPeripheral.button.write(tempBuffer, false, function(error) {
            console.log('set button level to: ' + buttonLevel);
        });
        lastButtonLevel = buttonLevel;
        res.sendStatus("Button Level set to: " + buttonLevel);
        res.end();
    }else{
        res.sendStatus("The level has not changed");
        res.end();
    }
})

app.get('/', function(req, res) {
    res.sendStatus("HELLO");
    res.end();
  })

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://%s:%s', host, port)
})


