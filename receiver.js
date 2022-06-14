const { F1TelemetryClient, constants } = require('f1-2020-client');
const { PACKETS } = constants;
const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server);
const client = new F1TelemetryClient({ port: 6060 });
const sqlite3 = require("sqlite3").verbose();

var debug = false;
var DEBUG = false;
if (DEBUG === true) {
    global.db = new sqlite3.Database('./debug.db', (error) => {
        if (error) {
        }
        db.run('CREATE TABLE IF NOT EXISTS debugTable (packet info)')
    })
}
var drivers = {}
var drv = []
var fastest = -99;
var sess = {}
client.start();
server.listen(3003);
io.on('connection', function(socket) {
    socket.on('disconnect', function() {
        console.log('Client disconnected')
    });
    socket.on('connect', function() {
        console.log('Client connected')
    });
});
const interval = setInterval(function() {
    var i = 0;
    for (driver in drivers) {
        d = drivers[driver]
        drv[d.pos] = d
    }
    drv.shift();
    io.emit('d', drv, sess)
}, 1000);
client.on(PACKETS.event, (e) => {
    if (e.m_eventStringCode == "FTLP") {
        if (fastest = -99) {
            fastest = e.m_eventDetails.vehicleIdx;
            drivers[e.m_eventDetails.vehicleIdx].fastest = true;
        } else {
            delete drivers[fastest].fastest;
            fastest = e.m_eventDetails.vehicleIdx;
            drivers[e.m_eventDetails.vehicleIdx].fastest = true;
        }

    }
    if (e.m_eventStringCode == "PENA") {
        let db = new sqlite3.Database("./Pens.db", (err) => {
            if (err) {
                console.log(err)
            }
        });
        try {
            db.run('CREATE TABLE IF NOT EXISTS penalties (penType integer,infType integer,vehicle integer, lap integer,timer integer)');
            db.run(`INSERT INTO penalties(penType,infType,vehicle,lap,timer) VALUES(?,?,?,?,?)`, [e.m_eventDetails.penaltyType, e.m_eventDetails.infringementType, drivers[e.m_eventDetails.vehicleIdx].raceNumber, e.m_eventDetails.lapNum, e.m_eventDetails.time], function(err) { if (err) { console.log(err); } });
            db.close();
        } catch (err) {
            console.log(err);
        }
    }
});
client.on(PACKETS.finalClassification, (final) => {
    try {
        let db = new sqlite3.Database("./Pens.db", (err) => {
            if (err) {
                console.log(err)
            }
        });
        db.run('CREATE TABLE IF NOT EXISTS penalties (penType integer,infType integer,vehicle integer, lap integer,timer integer)');
        db.run(`INSERT INTO penalties (penType,infType,vehicle,lap,timer) VALUES (?,?,?,?,?)`, [9999, 9999, 9999, 9999, 9999])
        db.run('CREATE TABLE IF NOT EXISTS results (finishPos integer,gridPos integer,driverNum integer, bestLap number,penSecs integer)');
        var i = 0;
        for (i; i < final.m_classificationData.length; i++) {
            let cd = final.m_classificationData[i]
            db.run(`INSERT INTO results (finishPos,gridPos,driverNum,bestLap,penSecs) VALUES (?,?,?,?,?)`, [cd.m_position, cd.m_gridPosition, drivers[i].raceNumber, cd.m_bestLapTime, cd.m_penaltiesTime], function(err) { if (err) { console.log(err); } });
        }
        db.run(`INSERT INTO results (finishPos,gridPos,driverNum,bestLap,penSecs) VALUES (?,?,?,?,?)`, [9999, 9999, 9999, 9999, 9999])
        db.close();
    } catch (err) {
        console.log(err);
    }
});
client.on(PACKETS.session, (s) => {
    if (debug === true) {
        db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Session', JSON.stringify(s)], (er) => {
            if (er) {
				console.log(er);
            }
        })
    }
    sessions = {
        1: 'Practice',
        2: 'Practice',
        3: 'Practice',
        5: 'Qualifying',
        6: 'Qualifying',
        7: 'Qualifying',
        8: 'Qualifying',
        9: 'Qualifying',
        10: 'Race',
        11: 'Race',
        12: 'Try Hard'

    }
    weather = {
        0: 'Clear',
        1: 'Light Cloud',
        2: 'Overcast',
        3: 'Light Rain',
        4: 'Heavy Rain',
        5: 'Storm',

    }
    sc = {
        0: 'Green Flag',
        1: 'Safety Car',
        2: 'Virtual Safety Car'
    }
    sess.marhsalZones = s.m_marshalZones.splice(0, s.m_numMarshalZones).sort(function(a, b) {
        var x = a.m_zoneStart;
        var y = b.m_zoneStart;
        return x - y;
    });
    sess.totalLaps = s.m_totalLaps
    sess.name = sessions[s.m_sessionType]
    sess.left = s.m_sessionTimeLeft
    sess.time = `${Math.floor(s.m_sessionTimeLeft/60)} ${s.m_sessionTimeLeft%60}s`;
    sess.sc = sc[s.m_safetyCarStatus]
    sess.weatherNum = s.m_numWeatherForecastSamples
    sess.qualiWeater = []
    sess.raceWeather = []
    for (ws of s.m_weatherForecastSamples) {
        if (sessions[ws.m_sessionType] === 'Qualifying') {
            sess.qualiWeater.push([weather[ws.m_weather], ws.m_timeOffset])
        } else if (sessions[ws.m_sessionType] === 'Race') {
            sess.raceWeather.push([weather[ws.m_weather], ws.m_timeOffset])
        }
    }
});
client.on(PACKETS.participants, (par) => {
    if (debug === true) {
        db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Participants', JSON.stringify(par)], (er) => {
            if (er) {
                console.log(er)
            }
        })
    }
    teams = {
        0: "Mercedes",
        1: "Ferrari",
        2: "RedBull",
        3: "Williams",
        4: "Aston Martin",
        5: "Alpine",
        6: "Alpha Tauri",
        7: "Haas",
        8: "McLaren",
        9: "Alfa Romeo"
    }
    telem = {
        0: "Private Telemetry",
        1: "Public"
    }
    var i = 0;
    for (i; i < par.m_participants.length; i++) {
        if (drivers[i] === undefined) {
            drivers[i] = {};
        }
        drivers[i].raceNumber = parseInt(par.m_participants[i].m_raceNumber);
        drivers[i].name = teams[parseInt(par.m_participants[i].m_teamId)];
        drivers[i].privacy = telem[parseInt(par.m_participants[i].m_yourTelemetry)];
    }
});
client.on(PACKETS.lapData, (ld) => {
    if (debug === true) {
        db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Lap Data', JSON.stringify(ld)], (er) => {
            if (er) {
                console.log(er)
            }
        })
    }
    var i = 0;
    for (i; i < ld.m_lapData.length; i++) {
        if (drivers[i] === undefined) {
            drivers[i] = {};
        }
        drivers[i].lastLap = ld.m_lapData[i].m_lastLapTime;
        drivers[i].pos = ld.m_lapData[i].m_carPosition;
        drivers[i].status = ld.m_lapData[i].m_resultStatus;
        drivers[i].pit = ld.m_lapData[i].m_pitStatus;
        drivers[i].pens = ld.m_lapData[i].m_penalties;
        drivers[i].dist = ld.m_lapData[i].m_lapDistance;
        drivers[i].currentLap = ld.m_lapData[i].m_currentLapNum;
        if (ld.m_lapData[i].m_sector1TimeInMS != 0) {
            drivers[i].sone = ld.m_lapData[i].m_sector1TimeInMS / 1000;
        }
        if (ld.m_lapData[i].m_sector2TimeInMS != 0) {
            drivers[i].stwo = ld.m_lapData[i].m_sector2TimeInMS / 1000;
        }
        drivers[i].sthree = Math.round(((((ld.m_lapData[i].m_lastLapTime - drivers[i].stwo) - drivers[i].sone) + Number.EPSILON) * 1000)) / 1000;
        drivers[i].bestLapTime = ld.m_lapData[i].m_bestLapTime;
    }
});
client.on(PACKETS.carTelemetry, (cT) => {
    if (debug === true) {
        db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Car Telemetry', JSON.stringify(cT)], (er) => {
            if (er) {
                console.log(er)
            }
        })
    }
    var i = 0;
    for (i; i < cT.m_carTelemetryData.length; i++) {
        if (drivers[i] === undefined) {
            drivers[i] = {};
        }
        drivers[i].tyreTemp = Math.max(parseInt(cT.m_carTelemetryData[i].m_tyresSurfaceTemperature));
        drivers[i].speed = cT.m_carTelemetryData[i].m_speed
        if (drivers[i].tyreTemp <= 75) { drivers[i].tyreTempColour = '#abf1ff' } else if (drivers[i].tyreTemp <= 100) { drivers[i].tyreTempColour = '#9cffbe' } else { drivers[i].tyreTempColour = '#de7662' }
    }
});
client.on(PACKETS.carStatus, (cS) => {
    if (debug === true) {
        db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Car Status', JSON.stringify(cS)], (er) => {
            if (er) {
                console.log(er)
            }
        })
    }
    var i = 0;
    for (i; i < cS.m_carStatusData.length; i++) {
        if (drivers[i] === undefined) {
            drivers[i] = {};
        }
        var compounds = {
            16: "soft",
            17: "medium",
            18: "hard",
            7: "inter",
            8: "wet",
        }
        var compoundCs = {
            16: "#ffb3b3",
            17: "#f6ffb3",
            18: "#f0f0f0",
            7: "#a2fcb4",
            8: "#a2d5fc",
            0: "#dddddd"
        }
        var fuelMixes = {
            0: "Lean",
            1: "Standard",
            2: "Rich",
            3: "Hotlap"
        }
        var ersModes = {
            0: "Off",
            1: "Standard",
            2: "Overtake",
            3: "Hotlap"
        }
        drivers[i].lWing = cS.m_carStatusData[i].m_frontLeftWingDamage;
        drivers[i].rWing = cS.m_carStatusData[i].m_frontRightWingDamage;
        drivers[i].ers = Math.round((cS.m_carStatusData[i].m_ersStoreEnergy / 4000000) * 100);
        drivers[i].tyreWear = Math.max(cS.m_carStatusData[i].m_tyresWear[0], cS.m_carStatusData[i].m_tyresWear[1], cS.m_carStatusData[i].m_tyresWear[2], cS.m_carStatusData[i].m_tyresWear[3])
        drivers[i].tyreAge = cS.m_carStatusData[i].m_tyresAgeLaps;
        drivers[i].tyreCompoundColour = compoundCs[parseInt(cS.m_carStatusData[i].m_tyreVisualCompound)];
        drivers[i].tyreCompound = compounds[parseInt(cS.m_carStatusData[i].m_tyreVisualCompound)];
        drivers[i].fuelLaps = Math.round((cS.m_carStatusData[i].m_fuelRemainingLaps + Number.EPSILON) * 100) / 100
        drivers[i].fuelMix = fuelMixes[parseInt(cS.m_carStatusData[i].m_fuelMix)]
        drivers[i].ersMode = ersModes[parseInt(cS.m_carStatusData[i].m_ersDeployMode)];
    }
});