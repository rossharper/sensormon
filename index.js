var chokidar = require('chokidar');
var fs = require('fs');

var sensorDataPath = "sensordata";

function onSensorValueUpdate(device, value) {
    console.log("Device value update: " + value);
}

function onSensorBatteryUpdate(device, value) {
    console.log("Device battery update: " + value);
}

function onSensorBatteryLowUpdate(device, value) {
    console.log("Device battery low warning update: " + value);
}

function readValue(path) {
    var file = fs.readFileSync(path, "utf8");
    return parseInt(file);
}

function onSensorUpdate(device, updateType, value) {
    switch(updateType) {
        case 'value':
            onSensorValueUpdate(device, value);
            break;
        case 'batt':
            onSensorBatteryUpdate(device, value);
            break;
        case 'battlow':
            onSensorBatteryLowUpdate(device, value);
            break;
    }
}

function onFileChange(path) {
    if(fs.lstatSync(path).isFile()) {
        console.log("onFileChange: " + path);
        var matches = path.match(new RegExp(sensorDataPath + "/([a-zA-Z]+)/([a-zA-Z]+)"));
        if(matches) {
            var value = readValue(path);
            onSensorUpdate(matches[0], matches[1], value);
        }
    }
}

function watchSensorDataPath() {
    var watcher = chokidar.watch(sensorDataPath);

    var log = console.log.bind(console);

    watcher
        .on('error', function(error) { log('Error happened', error); })
        .on('ready', function() { log('Initial scan complete. Ready for changes.'); });

    watcher.on('ready', function() {
        watcher
            .on('add', onFileChange)
            .on('change', onFileChange);
    });
}

watchSensorDataPath();
