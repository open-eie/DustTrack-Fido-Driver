var fs = require('fs')
var l = require('../../lib/log.js')
l.context = __filename 

var sp = require("serialport");
sp.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyACM0", {
  baudrate: 9600
});

serialPort.on("open", function () {
  console.log('open');
  var string = ''
  var delimetersSeen = 0
  serialPort.on('data', function(data) {
    data = String(data)
    if (data.indexOf('x') == -1) {
      string += data 
    }
    else {
      delimetersSeen++
      string += data.substr(0, data.indexOf('x'))
      string = string.trim()
      console.log("strin: " + string)
      dataPoint = parseFloat(string)
      var scale = 1000.00
      var airMax = .1
      var resolution = 1024.00
      dataPoint = (dataPoint / resolution) * airMax * scale
      console.log("dataPoint: " + dataPoint)
      if (delimetersSeen >= 2) {
        //if (dataPoint !== NaN && (dataPoint > 0 & dataPoint < resolution)) {
          fs.writeFile("/srv/tmp/grove_dht", dataPoint, function(err) {
            console.log(dataPoint)
            process.exit()
          })
        //}
      }
      string = data.substr(data.indexOf('x')+1, data.length)
    }
  });
});

