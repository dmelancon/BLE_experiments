var noble = require('noble');
var fs = require('fs');
var express = require('express')
var app = express()
var potLevel= 0;
// respond with "hello world" when a GET request is made to the homepage

noble.startScanning([], false); // any service UUID, don't allow duplicates

noble.on('discover', function(peripheral) {

  //only find peripheral with an advertisiment named Dan's BLE
  if (peripheral.advertisement.localName == "Dan's BLE") {
      peripheral.connect(function(error) {
          console.log('connected to peripheral: ' + peripheral.uuid);

        //find specific "fff0" service
          peripheral.discoverServices(['fff0'], function(error, services) {

            //first and only serivce is my pot service
              var potService = services[0];
              //console.log(potService);
              console.log('discovered Pot service');

                //discover characteristic 'fff1' which is the pot level characteric
              potService.discoverCharacteristics(['fff1'], function(error, characteristics) {
                  var potLevelCharacteristic = characteristics[0];
                  //console.log(potLevelCharacteristic);
                  console.log('discovered Pot Level characteristic');

                  //read the data
                  potLevelCharacteristic.on('read', function(data, isNotification) {
                    console.log('Pot level is now: ', data.readUInt8(0));
                    potLevel= data.readUInt8(0);

                      app.get('/', function(req, res) {
                        res.sendStatus(potLevel);
                        res.end();
                        //res.sendStatus(potLevel)
                      })
                  });

                  //true to enable notify
                  potLevelCharacteristic.notify(true, function(error) {
                      console.log('Pot level notification on');
                  });
              });
          });
            //when disconnect, start scanning again

          peripheral.on('disconnect', function(error) {
            console.log('disconnected to peripheral: ' + peripheral.uuid)
            noble.startScanning([], false); 
          });
      });
  }
});

app.get('/', function(req, res) {
  res.sendStatus(potLevel);
  res.end();
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})



