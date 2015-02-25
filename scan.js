var noble = require('noble');
var fs = require('fs');

noble.startScanning([], false); // any service UUID, don't allow duplicates
// var timerServiceUuid = 'fff0';
// var timerCharacteristicUuid = 'fff1';


noble.on('discover', function(peripheral){
	if (peripheral.advertisement.localName == "Dan's BLE") {
		peripheral.connect(function(error) {

			console.log(JSON.stringify(peripheral.advertisement));
			//console.log();
	      	console.log('Found device with local name: ' + peripheral.advertisement.localName);
		    console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
		    peripheral.discoverServices(null, function(error, services) {
		      	console.log('discovered the following services:');
		      	for (var i in services) {
		       	 	console.log('  ' + i + ' uuid: ' + services[i].uuid);
		       	 	services[i].discoverCharacteristics(null, function(error, characteristics) {
		        		console.log('discovered the following characteristics:');
		        		for (var i in characteristics) {
		         	 		console.log('  ' + i + ' uuid: ' + characteristics[i].uuid);
		        		}
		      		});
		      	}
	    	});
  		});
	 }
});