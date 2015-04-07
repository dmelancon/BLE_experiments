var noble = require('noble');
var fs = require('fs');
var express = require('express');
var moment = require('moment');
var app = express();

noble.startScanning([], false); // any service UUID, don't allow duplicates

var toothBrush = {
   timer: null,
   brushEvent: []
};
var rollTrkr = {
    roll: null,
    rollEvent:[],
    counter: 0
};

noble.on('discover', function(peripheral) {
  //only find peripheral with an advertisiment named Dan's BLE   //not secure
  if (peripheral.advertisement.localName == "ToothBrush") {        
      toothBrushLogger(peripheral);
  }else if (peripheral.advertisement.localName == "RollTrkr"){
      rollLogger(peripheral);
  }
});

var data = {
    score: 0
}


var brushEvent = function(brushTime){
  var newEvent = {
    duration: brushTime,
    time: moment().format()
  }
  toothBrush.brushEvent.push(newEvent);
  data.score = 0;
  for (var i = 0; i<toothBrush.brushEvent.length; i++){
    console.log(toothBrush.brushEvent[i].duration);
    data.score+=toothBrush.brushEvent[i].duration/10;
  }
}

var rollEvent = function(){
  rollTrkr.rollEvent.push(moment().format());
  rollTrkr.counter++;
  console.log(rollTrkr.counter);
}


app.get('/toothbrush', function(req, res){
  res.send(JSON.stringify(toothBrush.brushEvent));
  res.end();
});
app.get('/data', function(req, res){
  res.send(JSON.stringify(data));
  res.end();
});

app.get('/roll', function(req, res){
  res.send(JSON.stringify(rollTrkr.rollEvent));
  res.end();
});


var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://%s:%s', host, port)
})

var toothBrushLogger = function(peripheral){
  peripheral.connect(function(error) {
          console.log('connected to peripheral: ' + peripheral.uuid);
        //find specific "fff0" service which is my Pot Serivce
          peripheral.discoverServices(['1'], function(error, services) {
              var timerService = services[0];
              console.log("timerService :" + timerService);
              console.log('discovered Timer service');
              timerService.discoverCharacteristics(['2'], function(error, characteristics) {
                    var timerCharacteristic = characteristics[0];
                    console.log('discovered Timer characteristic');
                    //read the data
                    toothBrush.timer = timerCharacteristic;
                    //console.log("POT: " + myPeripheral.pot);
                    timerCharacteristic.on('read', function(data, isNotification) {
                      console.log(data);
                      console.log('Timer is now: ', data.readUInt8(0));
                      brushTime= data.readUInt8(0);
                      brushEvent(brushTime);
                    });
                    timerCharacteristic.notify(true, function(error) {
                      console.log('Timer notification on');
                    });
              }); 
          });
      });
}

var rollLogger = function(peripheral){
  peripheral.connect(function(error) {
          console.log('connected to peripheral: ' + peripheral.uuid);
        //find specific "fff0" service which is my Pot Serivce
          peripheral.discoverServices(['eee1'], function(error, services) {
              var rollService = services[0];
              console.log("rollService :" + rollService);
              console.log('discovered Roll service');
              rollService.discoverCharacteristics(['eee2'], function(error, characteristics) {
                    var rollCharacteristic = characteristics[0];
                    console.log('discovered Roll characteristic');
                    rollTrkr.roll = rollCharacteristic;
                    rollCharacteristic.on('read', function(data, isNotification) {
                      console.log('Roll is happening: ', data.readUInt8(0));
                      rollTime= data.readUInt8(0);
                      rollEvent();
                    });
                    rollCharacteristic.notify(true, function(error) {
                      console.log('roll notification on');
                    });
              }); 
          });
      });
}
