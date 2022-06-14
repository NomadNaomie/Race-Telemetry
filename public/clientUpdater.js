/*jshint esversion:6 */

var socket = new WebSocket('ws://' + window.location.hostname);
var setup = false;
var sessionName = document.getElementById("sessionName");
var lapsDiv = document.getElementById("sessionLaps");
var marshalDiv = document.getElementById("marshalDiv");
var weatherDiv = document.getElementById("weatherDiv");
var scDiv = document.getElementById("scvsc");
var sessionInfo = document.getElementById("sesInf");
var idText = document.getElementById("versionText");
var consoleBtn = document.getElementById("logo");
var consoleM = document.getElementById("console-modal");
var consoleInput = document.getElementById("consoleInput");
var first = document.getElementById("last");
consoleBtn.addEventListener("click", function() {
    consoleM.style.display = "flex";
    consoleInput.focus();
});
consoleInput.addEventListener("keypress", function(e) {
    if (e.keyCode == 13) {
        if (consoleInput.value == "") {
            consoleM.style.display = "none";
        } else {
        let newMessage = document.createElement("p");
        newMessage.classList.toggle("consoleEcho");
        newMessage.innerHTML = " > " + consoleInput.value;
        if (first == null){
            first = newMessage;
            consoleM.appendChild(newMessage);
        }else{
            consoleM.insertBefore(newMessage, first);
            first = newMessage;
        }
        socket.send(JSON.stringify({"Type":"Command", "Command":consoleInput.value}));
        consoleInput.value = "";
        }
    }});

// Listen for messages
socket.addEventListener("message", function(event) {
    var driverTable = document.getElementById("tablebody");
    while (driverTable.lastElementChild) {
        driverTable.removeChild(driverTable.lastElementChild);
    }
    var data = event.data;
    data = JSON.parse(data);
    if (data.Type == "id") {
        idText.innerHTML = data.id;
    } else if (data.Type == "CommandReply") {
        let newMessage = document.createElement("p");
        newMessage.classList.toggle("consoleResponse");
        newMessage.innerHTML = " < " + data.Response;
        if (first == null){
            first = newMessage;
            consoleM.appendChild(newMessage);
        }else{
            consoleM.insertBefore(newMessage, first);
            first = newMessage;
        }
    } 
    
    else {
        sess = data.Session;
        for (var driver of data.Drivers) {
            if (driver.pos == 1) {
                driver.gap = "Leader";
            } else {
                distance = data.Drivers[driver.pos - 2].dist - driver.dist;
                speed = driver.speed / 3.6;
                driver.gap = distance / speed;
                if (driver.gap < 0) {
                    driver.gap = "Calculating";
                } else if (driver.gap == "Infinity") {
                    driver.gap = "Calculating";
                } else if (driver.gap == NaN) {
                    driver.gap = "Calculating";
                } else {
                    driver.gap = `+${driver.gap.toFixed(2)}`;
                }
            }
            driverDiv = document.createElement("tr");
            driverDiv.classList.add("driver");
            if (driver.privacy == "Public") {
                if (driver.fuelLaps > 0) {
                    driver.petrol = `+${driver.fuelLaps}`;
                } else if (driver.fuelLaps < 0) {
                    driver.petrol = `${driver.fuelLaps}`;
                }
                if (driver.status != 3 && driver.status != 2) {
                    driverDiv.innerHTML = `<td>${driver.pos}</td>
                <td>${driver.name} 🏁</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>`;
                } else {
                    if (driver.pit == 0) {
                        if (driver.status == 3) {
                            if (driver.pos == 1) {
                                driver.name += "🥇";
                            }
                            if (driver.pos == 2) {
                                driver.name += "🥈";
                            }
                            if (driver.pos == 3) {
                                driver.name += "🥉";
                            }
                            driver.name += "🏁";
                        }
                        driverDiv.innerHTML = `<td>${driver.pos}</td>
                    <td>${driver.name}</td><td>${driver.tyreWear}%</td>
                            <td bgcolor=${driver.tyreCompoundColour}>${driver.tyreAge
                        } laps - ${driver.tyreCompound}</td>
                            <td bgcolor=${driver.tyreTempColour}>${driver.tyreTemp
                        }°C</td>
                            <td>${driver.ers}%</td>
                            <td>${driver.ersMode}</td>
                            <td>${driver.fuelMix}</td>
                            <td>${driver.petrol} Laps</td>
                            <td>${driver.pens}</td>
                            <td>${driver.gap}</td>
                            <td>L${driver.lWing} - R${driver.rWing}</td>`;
                        if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}</td>`;
                        } else {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}</td>`;
                        }
                        if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}</td>`;
                        } else {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}</td>`;
                        }
                    } else if (driver.pit == 1 || driver.pit == 2) {
                        driverDiv.innerHTML = `<td>Pitting</td>
                    <td>${driver.name}</td>
                    <td>PITS</td>
                    <td>PITS</td>
                    <td>PITS</td>
                    <td>${driver.ers}</td>
                    <td>${driver.ersMode}</td>
                    <td>${driver.fuelMix}</td>
                    <td>${driver.petrol} Laps</td>
                    <td>${driver.pens}</td>
                    <td>${driver.gap}</td>
                    <td>L${driver.lWing} - R${driver.rWing}</td>`;
                        if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}</td>`;
                        } else {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}</td>`;
                        }
                        if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}</td>`;
                        } else {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}</td>`;
                        }
                    }
                }
            } else if (driver.privacy == "Private Telemetry") {
                if (driver.status != 3 && driver.status != 2) {
                    driverDiv.innerHTML = `<td>${driver.pos}</td>
                <td>${driver.name} 🏁</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>
                <td>DNF</td>`;
                } else {
                    if (driver.pit == 0) {
                        if (driver.status == 3) {
                            if (driver.pos == 1) {
                                driver.name += "🥇";
                            }
                            if (driver.pos == 2) {
                                driver.name += "🥈";
                            }
                            if (driver.pos == 3) {
                                driver.name += "🥉";
                            }
                            driver.name += "🏁";
                        }
                        driverDiv.innerHTML = `<td>${driver.pos}</td>
                    <td>${driver.name}</td><td>Private</td>
                    <td bgcolor=${driver.tyreCompoundColour}>${driver.tyreCompound
                        }</td>
                    <td >Private</td>
                    <td>Private</td>
                    <td>Private</td>
                    <td>Private</td>
                    <td>Private</td>
                    <td>${driver.pens}</td>
                    <td>${driver.gap}</td>
                    <td>Private</td>`;
                        if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}</td>`;
                        } else {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}</td>`;
                        }
                        if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}</td>`;
                        } else {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}</td>`;
                        }
                    } else if (driver.pit == 1 || driver.pit == 2) {
                        driverDiv.innerHTML = `<td>Pitting</td>
            <td>${driver.name}</td>
            <td>PITS</td>
            <td>PITS</td>
            <td>PITS</td>
            <td>Private</td>
            <td>Private</td>
            <td>Private</td>
            <td>Private</td>
            <td>${driver.pens}</td>
            <td>${driver.gap}</td>
            <td>Private</td>`;
                        if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}</td>`;
                        } else {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}</td>`;
                        }
                        if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}</td>`;
                        } else {
                            driverDiv.innerHTML += `<td>${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}</td>`;
                        }
                    }
                }
            }
            driverTable.appendChild(driverDiv);
        }
        try {
            for (var zone of sess.marhsalZones) {
                if (zone.m_zoneFlag == 0) {
                    zoneDiv = document.createElement("div");
                    zoneDiv.classList.add("gZone");
                    marshalDiv.appendChild(zoneDiv);
                } else if (zone.m_zoneFlag == 1) {
                    zoneDiv = document.createElement("div");
                    zoneDiv.classList.add("yZone");
                    marshalDiv.appendChild(zoneDiv);
                }
            }
            sess.lap = data.Drivers[0].currentLap;
            sessionName.innerHTML = `${sess.name}`;
            if (sess.name != "Race") {
                lapsDiv.innerHTML = `${sess.time}`;
            } else {
                if (
                    sess.sc === "Green Flag" ||
                    sess.sc === "Safety Car" ||
                    sess.sc === "Virtual Safety Car"
                ) {
                    lapsDiv.innerHTML = `${sess.lap}/${sess.totalLaps}`;
                } else {
                    lapsDiv.innerHTML = `Formation Lap`;
                }
            }
            while (weatherDiv.lastElementChild) {
                weatherDiv.removeChild(weatherDiv.lastElementChild);
            }
            if (sess.qualiWeater != undefined) {
                sess.qualiWeater.sort(function(a, b) {
                    var x = a[1];
                    var y = b[1];
                    return x - y;
                });
                if (sess.name == "Qualifying") {
                    weatherDiv.innerHTML = "Quali weather\n";
                    for (var weatherForecast of sess.qualiWeater) {
                        forecastDiv = document.createElement("div");
                        forecastDiv.classList.add("forecast");
                        forecastDiv.innerHTML = `${weatherForecast[0]} in ${weatherForecast[1]} minutes`;
                        weatherDiv.appendChild(forecastDiv);
                    }
                    weatherDiv.innerHTML += "\nRace Weather\n";
                    for (weatherForecast of sess.raceWeather) {
                        forecastDiv = document.createElement("div");
                        forecastDiv.classList.add("forecast");
                        forecastDiv.innerHTML = `${weatherForecast[0]} in ${weatherForecast[1]} minutes`;
                        weatherDiv.appendChild(forecastDiv);
                    }
                }
            }
            if (sess.raceWeather != undefined) {
                sess.raceWeather.sort(function(a, b) {
                    var x = a[1];
                    var y = b[1];
                    return x - y;
                });
                if (sess.name == "Race") {
                    if (sess.sc === "Safety Car" || sess.sc === "Virtual Safety Car") {
                        if (scDiv.classList.contains("greenFlag")) {
                            scDiv.classList.remove("greenFlag");
                        }
                        scDiv.innerHTML = sess.sc;
                        if (!scDiv.classList.contains("sc")) {
                            scDiv.classList.add("sc");
                        }
                    } else {
                        if (scDiv.classList.contains("sc")) {
                            scDiv.innerHTML = sess.sc;
                            scDiv.classList.remove("sc");
                            scDiv.classList.add("greenFlag");
                        }
                    }
                }
                for (var wFore of sess.raceWeather) {
                    forecastDiv = document.createElement("div");
                    forecastDiv.classList.add("forecast");
                    forecastDiv.innerHTML = `${wFore[0]} in ${wFore[1]} minutes`;
                    weatherDiv.appendChild(forecastDiv);
                }
            }
        } catch (e) {
            //console.log(e);
        }
    }
});

