const { F1TelemetryClient, constants } = require('f1-2021-udp');
const { PACKETS } = constants;
const fs = require('fs');
const client = new F1TelemetryClient({ port: 6061 });
const sqlite3 = require("sqlite3").verbose();
const commands = ["login", "help", "version","driver","cleardriver","newrace","racename","toggleout"];
const express = require("express");
const app = express();
const http = require("https");
const cert = fs.readFileSync('./apollocert.pem');
const key = fs.readFileSync('./apollokey.pem');
const options = { cert: cert, key: key };
const server = http.createServer(options,app);
const WebSocket = require('ws');
const wsServ = new WebSocket.Server({ noServer: true });

const dgram= require("dgram");
const sock = dgram.createSocket("udp4")
sock.on("message",(m)=>{sock.send(m,6061,"127.0.0.1");console.log(m)});
sock.bind(6060,()=>{sock.setBroadcast(true);})

const _VERSION = "Ferengi";
var _RACE  = "DEFAULT";
var drivers = {}
var drv = []
var lapHist = {}
var fastest = -99;
var names = {};
var sess = {}
var modalCalls = 0;
var trackedEvents = [];
var outputProf = true;
client.start();
const interval = setInterval(function() {
    var i = 0;
    for (driver in drivers) {
        d = drivers[driver]
        drv[d.pos] = d
    }
    //console.table(drv);
    drv.shift();
}, 1000);
const ival = setInterval(function() {
    if (!outputProf){
    console.log("Connected Clients:" + wsServ.clients.size);
    console.log("modal Calls:" + modalCalls);}
}, 60*1000);
client.on(PACKETS.event, (ev) => {
    let e = ev
    console.log(ev);
    delete e["m_header"]
    e["timestamp"]=Date.now()
    trackedEvents.push(e);
});
client.on(PACKETS.sessionHistory, (sh) => {
    var compounds = {
        16: "soft",
        17: "medium",
        18: "hard",
        7: "inter",
        8: "wet",
    }
    
    if (drivers[sh.m_carIdx] === undefined) {
        drivers[sh.m_carIdx] = {};
    }
    if (lapHist[sh.m_carIdx] === undefined) {
        lapHist[sh.m_carIdx] = [];
    }
    drivers[sh.m_carIdx].bestSOne = sh.m_bestSector1LapNum;
    drivers[sh.m_carIdx].bestSTwo = sh.m_bestSector2LapNum;
    drivers[sh.m_carIdx].bestSThree = sh.m_bestSector3LapNum;
    drivers[sh.m_carIdx].bestLapNum = sh.m_bestLapTimeLapNum;
    drivers[sh.m_carIdx].bestLapTime = sh.m_lapHistoryData[sh.m_bestLapTimeLapNum == 0 ? 0 : sh.m_bestLapTimeLapNum-1].m_lapTimeInMS / 1000;
    var i = 0;
    let stints = sh.m_tyreStintsHistoryData;
    stints = stints.sort(function(a, b) {
        //descending order
        return b.m_endLap - a.m_endLap;
    });
    drivers[sh.m_carIdx].num_laps = sh.m_numLaps;
    for (i;i<=sh.m_lapHistoryData.length;i++) {
        if (sh.m_lapHistoryData[i] !== undefined) {
            ll = sh.m_lapHistoryData[i].m_lapTimeInMS/1000;
            let lapT = "";
            if ((ll - Math.floor(ll / 60) * 60).toFixed(3) < 10) {
                lapT=`${Math.floor(ll / 60)}:0${(Math.round((ll - Math.floor(ll / 60) * 60) * 1000) / 1000).toFixed(3)}`;
            } else {
                lapT=`${Math.floor(ll / 60)}:${(Math.round((ll - Math.floor(ll / 60) * 60) * 1000) / 1000).toFixed(3)}`;
            }       
            lapHist[sh.m_carIdx][i] = {"time":lapT,
                                        "tyre":"",
                                        "lap_num":i+1,
                                        "sone":sh.m_lapHistoryData[i].m_sector1TimeInMS,
                                        "stwo":sh.m_lapHistoryData[i].m_sector2TimeInMS,
                                        "sthree":sh.m_lapHistoryData[i].m_sector3TimeInMS,};
        for (h=0;h<=stints.length;h++) {
            let stint = stints[h]; 
            if (stint !== undefined) {
                if (stint.m_endLap==0){}
                else if (i < stint.m_endLap){
                    lapHist[sh.m_carIdx][i].tyre = stint.m_tyreVisualCompound;
                }else if (i == stint.m_endLap){
                    lapHist[sh.m_carIdx][i].tyre = 255;
                }
            }
        }
    }
    }
});
client.on(PACKETS.finalClassification, (final) => {
    finalClassData = JSON.stringify(final.m_classificationData,null,4);
    lapHistoryData = JSON.stringify(lapHist,null,4);
    eventData = JSON.stringify(trackedEvents,null,4);
    nameData = JSON.stringify(names,null,4);
    fs.writeFile(`${_RACE}_class.json`,finalClassData, (err) => {
  if (err) throw err;
  console.log('The Race Classification has been saved!');
});
    fs.writeFile(`${_RACE}_lapHistory.json`,lapHistoryData, (err) => {
  if (err) throw err;
  console.log('The Lap History has been saved!');
});
    fs.writeFile(`${_RACE}_events.json`,eventData, (err) => {
  if (err) throw err;
  console.log('The race events has been saved!');
});
    fs.writeFile(`${_RACE}_names.json`,nameData, (err) => {
  if (err) throw err;
  console.log('The racer names has been saved!');
});

});
client.on(PACKETS.session, (s) => {
    // if (debug === true) {
    //     db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Session', JSON.stringify(s)], (er) => {
    //         if (er) {
    //             console.log("Trouble trouble trouble")
    //         }
    //     })
    // }
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
    sess.qualiRain = []
    sess.raceRain = []
    for (ws of s.m_weatherForecastSamples) {
        if (sessions[ws.m_sessionType] === 'Qualifying') {
            sess.qualiWeater.push([weather[ws.m_weather], ws.m_timeOffset])
            sess.qualiRain.push([ws.m_rainPercentage, ws.m_timeOffset])
        } else if (sessions[ws.m_sessionType] === 'Race') {
            sess.raceWeather.push([weather[ws.m_weather], ws.m_timeOffset])
            sess.raceRain.push([ws.m_rainPercentage, ws.m_timeOffset])
        }
    }
});
client.on(PACKETS.participants, (par) => {
    // if (debug === true) {
    //     db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Participants', JSON.stringify(par)], (er) => {
    //         if (er) {
    //             console.log("oh oh oh")
    //         }
    //     })
    // }
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
        if (i in names){
            drivers[i].name = names[i];
        }else{
        drivers[i].name = teams[parseInt(par.m_participants[i].m_teamId)];}
        drivers[i].privacy = telem[parseInt(par.m_participants[i].m_yourTelemetry)];

    }
});
client.on(PACKETS.lapData, (ld) => {
    // if (debug === true) {
    //     db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Lap Data', JSON.stringify(ld)], (er) => {
    //         if (er) {
    //             console.log("A few mistakes ago")
    //         }
    //     })
    // }
    var i = 0;
    for (i; i < ld.m_lapData.length; i++) {
        if (drivers[i] === undefined) {
            drivers[i] = {};
        }
        drivers[i].idx = i;
        drivers[i].lastLap = ld.m_lapData[i].m_lastLapTimeInMS / 1000;
        drivers[i].pos = ld.m_lapData[i].m_carPosition;
        drivers[i].status = ld.m_lapData[i].m_resultStatus;
        drivers[i].pit = ld.m_lapData[i].m_pitStatus;
        drivers[i].warnings = ld.m_lapData[i].m_warnings;
        drivers[i].unserved = `${ld.m_lapData[i].m_numUnservedDriveThroughPens} DTs - ${ld.m_lapData[i].m_numUnservedStopGoPens} Stop Gos`;
        drivers[i].pens = ld.m_lapData[i].m_penalties + "s" + " (" + ld.m_lapData[i].m_warnings %3+ ")";
        drivers[i].dist = ld.m_lapData[i].m_lapDistance;
        drivers[i].currentLap = ld.m_lapData[i].m_currentLapNum;
        if (ld.m_lapData[i].m_sector1TimeInMS != 0) {
            drivers[i].sone = ld.m_lapData[i].m_sector1TimeInMS;
        }
        if (ld.m_lapData[i].m_sector2TimeInMS != 0) {
            drivers[i].stwo = ld.m_lapData[i].m_sector2TimeInMS;
        }
        drivers[i].sthree = Math.round(((((ld.m_lapData[i].m_lastLapTimeInMS - drivers[i].stwo) - drivers[i].sone) + Number.EPSILON) * 1000)) / 1000;
        if (ld.m_lapData[i].m_sector == 0 && ld.m_lapData[i].m_sector1TimeInMS != 0){
            drivers[i].sone = ld.m_lapData[i].m_currentLapTimeInMS;
        }else if (ld.m_lapData[i].m_sector == 1 && ld.m_lapData[i].m_sector2TimeInMS != 0){
            drivers[i].stwo = (ld.m_lapData[i].m_currentLapTimeInMS) - drivers[i].sone;
        }else if (ld.m_lapData[i].m_sector == 2){
            drivers[i].sthree = (ld.m_lapData[i].m_currentLapTimeInMS - drivers[i].sone) - drivers[i].stwo;
        }
        drivers[i].current = ld.m_lapData[i].m_currentTimeInMS;
    }
});
client.on(PACKETS.carTelemetry, (cT) => {
    // if (debug === true) {
    //     db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Car Telemetry', JSON.stringify(cT)], (er) => {
    //         if (er) {
    //             console.log("You found me")
    //         }
    //     })
    // }
    var i = 0;
    for (i; i < cT.m_carTelemetryData.length; i++) {
        if (drivers[i] === undefined) {
            drivers[i] = {};
        }
        drivers[i].tyreTemp = Math.max(parseInt(cT.m_carTelemetryData[i].m_tyresSurfaceTemperature));
        drivers[i].speed = cT.m_carTelemetryData[i].m_speed;
        if (drivers[i].tyreTemp <= 75) { drivers[i].tyreTempColour = '#abf1ff' } else if (drivers[i].tyreTemp <= 100) { drivers[i].tyreTempColour = '#9cffbe' } else { drivers[i].tyreTempColour = '#de7662' }
    }
});
client.on(PACKETS.carDamage, (cd) => {
    // if (debug === true) {
    //     db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Car Damage', JSON.stringify(cd)], (er) => {
    //         if (er) {
    //             console.log("You found me")
    //         }
    //     })
    // }
    var i = 0;
    for (i; i < cd.m_carDamageData.length; i++) {
        if (drivers[i] === undefined) {
            drivers[i] = {};
        }
        drivers[i].lWing = cd.m_carDamageData[i].m_frontLeftWingDamage;
        drivers[i].rWing = cd.m_carDamageData[i].m_frontRightWingDamage;
        drivers[i].rearWing = cd.m_carDamageData[i].m_rearWingDamage;
        drivers[i].sidepod = cd.m_carDamageData[i].m_sidepodDamage;
        drivers[i].floor = cd.m_carDamageData[i].m_floorDamage;
        drivers[i].diffuser = cd.m_carDamageData[i].m_diffuserDamage;
        drivers[i].tyreWear = Math.round(Math.max(cd.m_carDamageData[i].m_tyresWear[0], cd.m_carDamageData[i].m_tyresWear[1], cd.m_carDamageData[i].m_tyresWear[2], cd.m_carDamageData[i].m_tyresWear[3]));

    }
});
client.on(PACKETS.carStatus, (cS) => {
    // if (debug === true) {
    //     db.run('INSERT INTO debugTable(packet, info) VALUES(?,?)', ['Car Status', JSON.stringify(cS)], (er) => {
    //         if (er) {
    //             console.log("I knew you were trouble")
    //         }
    //     })
    // }
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
            3: "Overtake"
        }
        drivers[i].tc = cS.m_carStatusData[i].m_tractionControl;
        drivers[i].abs = cS.m_carStatusData[i].m_antiLockBrakes;
        drivers[i].ers = Math.round((cS.m_carStatusData[i].m_ersStoreEnergy / 4000000) * 100);
        drivers[i].tyreAge = cS.m_carStatusData[i].m_tyresAgeLaps;
        drivers[i].tyreCompoundColour = compoundCs[parseInt(cS.m_carStatusData[i].m_visualTyreCompound)];
        drivers[i].tyreCompound = compounds[parseInt(cS.m_carStatusData[i].m_visualTyreCompound)];
        drivers[i].fuelLaps = Math.round((cS.m_carStatusData[i].m_fuelRemainingLaps + Number.EPSILON) * 100) / 100
        drivers[i].fuelMix = fuelMixes[parseInt(cS.m_carStatusData[i].m_fuelMix)]
        drivers[i].ersMode = ersModes[parseInt(cS.m_carStatusData[i].m_ersDeployMode)];
    }
});
wsServ.on("connection", function connection(ws) {
    ws.send(JSON.stringify({ "Type": "id", "id": _VERSION }));
    ws.on('message', function incoming(message) {
        try {
            var data = JSON.parse(message);
            if (data.Type === "Command") {
                let cmd = data.Command.split(" ");
                if (commands.includes(cmd[0])) {
                    if (cmd[0] === "login") {
                        if (cmd.length == 2) {
                            if (cmd[1] === "Ezri") {
                                ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Authenticated!" }));
                            } else {
                                ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Incorrect login" }));
                            }
                        } else {
                            ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Incorrect Login Syntax: login pw" }));
                        }
                    } else if (cmd[0] === "help") {
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Available commands: login, help, version" }));
                    } else if (cmd[0] === "version") {
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": _VERSION }));
                    } else if (cmd[0] === "driver"){
                        let target = parseInt(cmd[1]);
                        let name = cmd[2];
                        names[drv[target-1].idx] = name;
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": `Added ${name} in P${target} with IDX ${drv[target-1].idx}` }));
                    }else if (cmd[0] === "cleardriver"){
                        names = {}
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "names cleared" }));
                    } else if (cmd[0] === "newrace"){
                        drivers = {}
                        drv = []
                        lapHist = {}
                        fastest = -99;
                        names = {};
                        sess = {}
                        modalCalls = 0;
                        trackedEvents = [];
                        console.log("Data cleared by command");
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Data Reset" }));
                    } else if (cmd[0] === "racename"){
                        _RACE = cmd[1];
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": `Race Named ${_RACE}` }));
                    } else if (cmd[0] === "toggleout"){
                        outputProf = !outputProf;
                        ws.send(JSON.stringify({ "Type": "CommandReply", "Response": `Outputting: ${outputProf}` }));
                    }
                } else {
                    ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Unknown Command" }));
                }
            }else if(data.Type==="Modal"){
                modalCalls +=1;
                var idx = data.Driver;
                ws.send(JSON.stringify({ "Type": "ModalInfo", "LapHistory": lapHist[idx], "Driver":drivers[idx] }));
            }
             else {
                ws.send(JSON.stringify({ "Type": "CommandReply", "Response": "Command Not Found" }));
            }
        } catch (e) {
            console.log(e);
        }
    });
    const interval = setInterval(function() {
        ws.send(JSON.stringify({ "Type": "data", "Drivers": drv, "Session": sess }));
    }, 1000);
})

app.use(express.static(__dirname + "/public"));
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});
app.get("/favicon.ico", (req, res) => {
    res.sendFile(__dirname + "/favicon.ico");
})
app.get("/driver-test", (req, res) => {
    res.sendFile(__dirname + "/public/driver.html");
});
server.on('upgrade', (request, socket, head) => {
    wsServ.handleUpgrade(request, socket, head, socket => {
        wsServ.emit('connection', socket, request);
    });
});
server.listen(443, () => {
    console.log("Web page service Starting");
});
