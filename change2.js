var noble = require('noble');
var fs = require('fs');
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
              console.log('discovered Pot service');

                //discover characteristic 'fff1' which is the pot level characteric
              potService.discoverCharacteristics(['fff1'], function(error, characteristics) {
                  var potLevelCharacteristic = characteristics[0];
                  console.log('discovered Pot Level characteristic');

                  //read the data
                  potLevelCharacteristic.on('read', function(data, isNotification) {
                      console.log('Pot level is now: ', data.readUInt8(0));
                  });
              });
          });
      });
  }
});