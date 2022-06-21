var socket = new WebSocket('wss://' + window.location.hostname);
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
var driverM = document.getElementById("driver-modal");
var first = document.getElementById("last");
var dm_team_name = document.getElementById("team-name");
var dm_best_lap = document.getElementById("best-lap");
var dm_last_lap = document.getElementById("last-lap");
var dm_hist_lap = document.getElementById("history-lap");
var dm_hist_table = document.getElementById("lap-history");
var dm_hist_table_body = dm_hist_table.getElementsByTagName("tbody")[0];
var dm_damage = document.getElementById("damage");
var dm_rwing = document.getElementById("rwing");
var dm_lwing = document.getElementById("lwing");
var dm_rfloor = document.getElementById("rfloor");
var dm_lfloor = document.getElementById("lfloor");
var dm_lsidepod = document.getElementById("lsidepods");
var dm_rsidepod = document.getElementById("rsidepods");
var dm_diffuser = document.getElementById("diffuser");
var dm_rear_wing = document.getElementById("rear-wing");
var dm_warnings = document.getElementById("m-warnings");
var dm_unserve = document.getElementById("unserved-penalties");
var dm_tc = document.getElementById("tc");
var dm_abs = document.getElementById("abs");
var dm_laps_completed = document.getElementById("laps-completed");
var Select_Position = document.getElementById("Select-Position");
var Select_Driver = document.getElementById("Select-Driver");
var Select_Tyre = document.getElementById("Select-Tyre");
var Select_Tyre_Wear = document.getElementById("Select-Tyre-Wear");
var Select_Tyre_Temp = document.getElementById("Select-Tyre-Temp");
var Select_Tyre_Age = document.getElementById("Select-Tyre-Age");
var Select_ERS = document.getElementById("Select-ERS");
var Select_Overtake = document.getElementById("Select-Overtake");
var Select_Fuel_Mode = document.getElementById("Select-Fuel-Mode");
var Select_Fuel_Margin = document.getElementById("Select-Fuel-Margin");
var Select_Penalties = document.getElementById("Select-Penalties");
var Select_Gap = document.getElementById("Select-Gap");
var Select_Wing_Damage = document.getElementById("Select-Wing-Damage");
var Select_Sector_1 = document.getElementById("Select-Sector-1");
var Select_Sector_2 = document.getElementById("Select-Sector-2");
var Select_Sector_3 = document.getElementById("Select-Sector-3");
var Select_Last_Lap = document.getElementById("Select-Last-Lap");
var Select_Best_Lap = document.getElementById("Select-Best-Lap");
var _RESET_FLAG = false;

var weather_svg = {
    "Overcast": "./overcast.svg",
    "Light Cloud": "./cloud.svg",
    "Light Rain": "./rain.svg",
    "Storm": "./storm.svg",
    "Clear": "./clear.svg",
};


function horcrux() {
    _RESET_FLAG = true;
}
Select_Position.addEventListener("change",horcrux);
Select_Driver.addEventListener("change",horcrux);
Select_Tyre.addEventListener("change",horcrux);
Select_Tyre_Wear.addEventListener("change",horcrux);
Select_Tyre_Temp.addEventListener("change",horcrux);
Select_Tyre_Age.addEventListener("change",horcrux);
Select_ERS.addEventListener("change",horcrux);
Select_Overtake.addEventListener("change",horcrux);
Select_Fuel_Mode.addEventListener("change",horcrux);
Select_Fuel_Margin.addEventListener("change",horcrux);
Select_Penalties.addEventListener("change",horcrux);
Select_Gap.addEventListener("change",horcrux);
Select_Wing_Damage.addEventListener("change",horcrux);
Select_Sector_1.addEventListener("change",horcrux);
Select_Sector_2.addEventListener("change",horcrux);
Select_Sector_3.addEventListener("change",horcrux);
Select_Last_Lap.addEventListener("change",horcrux);
Select_Best_Lap.addEventListener("change",horcrux);
//https://gist.github.com/gskema/2f56dc2e087894ffc756c11e6de1b5ed
function colorGradient(fadeFraction, rgbColor1, rgbColor2, rgbColor3) {
    var color1 = rgbColor1;
    var color2 = rgbColor2;
    var fade = fadeFraction;

    // Do we have 3 colors for the gradient? Need to adjust the params.
    if (rgbColor3) {
        fade = fade * 2;

        // Find which interval to use and adjust the fade percentage
        if (fade >= 1) {
            fade -= 1;
            color1 = rgbColor2;
            color2 = rgbColor3;
        }
    }

    var diffRed = color2.red - color1.red;
    var diffGreen = color2.green - color1.green;
    var diffBlue = color2.blue - color1.blue;

    var gradient = {
        red: parseInt(Math.floor(color1.red + (diffRed * fade)), 10),
        green: parseInt(Math.floor(color1.green + (diffGreen * fade)), 10),
        blue: parseInt(Math.floor(color1.blue + (diffBlue * fade)), 10),
    };

    return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
}
var driverArray = [];
consoleBtn.addEventListener("click", function () {
    consoleM.style.display = "flex";
    consoleInput.focus();
});
consoleInput.addEventListener("keydown", function (e) {
    if (e.key == "Enter") {
        if (consoleInput.value == "") {
            consoleM.style.display = "none";
        } else {
            let newMessage = document.createElement("p");
            newMessage.classList.toggle("consoleEcho");
            newMessage.innerHTML = " > " + consoleInput.value;
            if (first == null) {
                first = newMessage;
                consoleM.appendChild(newMessage);
            } else {
                consoleM.insertBefore(newMessage, first);
                first = newMessage;
            }
            socket.send(JSON.stringify({ "Type": "Command", "Command": consoleInput.value }));
            consoleInput.value = "";
        }
    }
});
document.addEventListener("keydown", function (e) {
    if (e.key == "Escape") {
        consoleM.style.display = "none";
        driverM.style.display = "none";
    }
});


// Listen for messages
socket.addEventListener("message", function (event) {
    var driverTable = document.getElementById("tablebody");
    // while (driverTable.lastElementChild) {
    //     driverTable.removeChild(driverTable.lastElementChild);
    // }
    var data = event.data;
    data = JSON.parse(data);
    if (data.Type == "id") {
        idText.innerHTML = data.id;
    } else if (data.Type == "CommandReply") {
        let newMessage = document.createElement("p");
        newMessage.classList.toggle("consoleResponse");
        newMessage.innerHTML = " < " + data.Response;
        if (first == null) {
            first = newMessage;
            consoleM.appendChild(newMessage);
        } else {
            consoleM.insertBefore(newMessage, first);
            first = newMessage;
        }
    } else if (data.Type == "ModalInfo") {

    } else {
        if (driverArray.length != data.Drivers.length || _RESET_FLAG) {
            headerRow = document.getElementById("header-row");
            headerRow.innerHTML = "";
            _RESET_FLAG = false;
            while (driverTable.lastElementChild) {
                driverTable.removeChild(driverTable.lastElementChild);
            }
            if (Select_Position.checked) {
                headerRow.innerHTML += "<th>Position</th>";
            } if (Select_Driver.checked) {
                headerRow.innerHTML += "<th>Driver</th>";
            } if (Select_Tyre.checked) {
                headerRow.innerHTML += "<th>Tyre</th>";
            } if (Select_Tyre_Wear.checked) {
                headerRow.innerHTML += "<th>Tyre Wear</th>";
            } if (Select_Tyre_Age.checked) {
                headerRow.innerHTML += "<th>Tyre Age</th>";
            } if (Select_Tyre_Temp.checked) {
                headerRow.innerHTML += "<th>Tyre Temp</th>";
            } if (Select_ERS.checked) {
                headerRow.innerHTML += "<th>ERS</th>";
            } if (Select_Overtake.checked) {
                headerRow.innerHTML += "<th>Overtake</th>";
            } if (Select_Fuel_Mode.checked) {
                headerRow.innerHTML += "<th>Fuel mode</th>";
            } if (Select_Fuel_Margin.checked) {
                headerRow.innerHTML += "<th>Fuel Margin</th>";
            } if (Select_Penalties.checked) {
                headerRow.innerHTML += "<th>Penalties (Warns)</th>";
            } if (Select_Gap.checked) {
                headerRow.innerHTML += "<th>Gap</th>";
            } if (Select_Wing_Damage.checked) {
                headerRow.innerHTML += "<th>Wing Damage</th>";
            } if (Select_Sector_1.checked) {
                headerRow.innerHTML += "<th>Sector 1</th>";
            } if (Select_Sector_2.checked) {
                headerRow.innerHTML += "<th>Sector 2</th>";
            } if (Select_Sector_3.checked) {
                headerRow.innerHTML += "<th>Sector 3</th>";
            } if (Select_Last_Lap.checked) {
                headerRow.innerHTML += "<th>Last Lap</th>";
            } if (Select_Best_Lap.checked) {
                headerRow.innerHTML += "<th>Best Lap</th>";
            }
            driverArray = [];
            for (var driver of data.Drivers) {
                let driverDiv = document.createElement("tr");
                driverDiv.classList.add("driver");
                driverDiv.setAttribute("id", `${driver.pos}-row`);
                driverArray.push(driverDiv);
                driverTable.appendChild(driverDiv);
                if (Select_Position.checked) {
                    Pos = document.createElement("td");
                    Pos.setAttribute("id", `${driver.pos}-Pos`);
                    Pos.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(Pos);
                } if (Select_Driver.checked) {
                    Name = document.createElement("td");
                    Name.setAttribute("id", `${driver.pos}-Name`);
                    Name.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(Name);
                } if (Select_Tyre.checked) {
                    Tyre = document.createElement("td");
                    Tyre.setAttribute("id", `${driver.pos}-Tyre`);
                    Tyre.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(Tyre);
                } if (Select_Tyre_Wear.checked) {
                    TyreWear = document.createElement("td");
                    TyreWear.setAttribute("id", `${driver.pos}-TyreWear`);
                    TyreWear.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(TyreWear);
                } if (Select_Tyre_Age.checked) {
                    TyreAge = document.createElement("td");
                    TyreAge.setAttribute("id", `${driver.pos}-TyreAge`);
                    TyreAge.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(TyreAge);
                } if (Select_Tyre_Temp.checked) {
                    TyreTemp = document.createElement("td");
                    TyreTemp.setAttribute("id", `${driver.pos}-TyreTemp`);
                    TyreTemp.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(TyreTemp);
                } if (Select_ERS.checked) {
                    ERS = document.createElement("td");
                    ERS.setAttribute("id", `${driver.pos}-ERS`);
                    ERS.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(ERS);
                } if (Select_Overtake.checked) {
                    ERSMode = document.createElement("td");
                    ERSMode.setAttribute("id", `${driver.pos}-ERSMode`);
                    ERSMode.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(ERSMode);
                } if (Select_Fuel_Mode.checked) {
                    FuelMode = document.createElement("td");
                    FuelMode.setAttribute("id", `${driver.pos}-FuelMode`);
                    FuelMode.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(FuelMode);
                } if (Select_Fuel_Margin.checked) {
                    FuelMargin = document.createElement("td");
                    FuelMargin.setAttribute("id", `${driver.pos}-FuelMargin`);
                    FuelMargin.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(FuelMargin);
                } if (Select_Penalties.checked) {
                    Penalties = document.createElement("td");
                    Penalties.setAttribute("id", `${driver.pos}-Penalties`);
                    Penalties.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(Penalties);
                } if (Select_Gap.checked) {
                    Gap = document.createElement("td");
                    Gap.setAttribute("id", `${driver.pos}-Gap`);
                    Gap.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(Gap);
                } if (Select_Wing_Damage.checked) {
                    WingDmg = document.createElement("td");
                    WingDmg.setAttribute("id", `${driver.pos}-WingDmg`);
                    WingDmg.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(WingDmg);
                } if (Select_Sector_1.checked) {
                    Sector1 = document.createElement("td");
                    Sector1.setAttribute("id", `${driver.pos}-Sector1`);
                    Sector1.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(Sector1);
                } if (Select_Sector_2.checked) {
                    Sector2 = document.createElement("td");
                    Sector2.setAttribute("id", `${driver.pos}-Sector2`);
                    Sector2.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(Sector2);
                } if (Select_Sector_3.checked) {
                    Sector3 = document.createElement("td");
                    Sector3.setAttribute("id", `${driver.pos}-Sector3`);
                    Sector3.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(Sector3);
                } if (Select_Last_Lap.checked) {
                    LastLap = document.createElement("td");
                    LastLap.setAttribute("id", `${driver.pos}-LastLap`);
                    LastLap.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(LastLap);
                } if (Select_Best_Lap.checked) {
                    BestLap = document.createElement("td");
                    BestLap.setAttribute("id", `${driver.pos}-BestLap`);
                    BestLap.setAttribute("targ", `${driver.idx}`);
                    driverDiv.appendChild(BestLap);
                }


                driverDiv.addEventListener("click", function (e) {
                    socket.send(JSON.stringify({ "Type": "Modal", "Driver": e.target.getAttribute("targ") }));
                    socket.addEventListener("message", function (event) {
                        var data = event.data;
                        data = JSON.parse(data);
                        if (data.Type == "ModalInfo") {
                            driverM.style.display = "flex";
                            driver = data.Driver;
                            dm_team_name.innerHTML = `${driver.name} - P${driver.pos}`;
                            if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                                dm_best_lap.innerHTML = `<b>Best Lap </b><br> ${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                            } else {
                                dm_best_lap.innerHTML = `<b>Best Lap </b><br> ${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                            }
                            if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                                dm_last_lap.innerHTML = `<b>Last Lap </b><br> ${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                            } else {
                                dm_last_lap.innerHTML = `<b>Last Lap </b><br> ${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                            }
                            dm_warnings.innerHTML = `<b>Warnings </b><br> ${driver.warnings % 3}`;
                            dm_unserve.innerHTML = `<b>Unserved </b><br> ${driver.unserved}`;
                            driver.tc == 1 ? dm_tc.innerHTML = "<b>TC </b> <br> Medium" : driver.tc == 2 ? dm_tc.innerHTML = "<b>TC </b> <br> Full" : dm_tc.innerHTML = "<b>TC </b> <br> None";
                            driver.abs == 0 ? dm_abs.innerHTML = "<b>ABS </b> <br> Off" : driver.abs == 1 ? dm_abs.innerHTML = "<b>ABS </b> <br> On" : dm_abs.innerHTML = "<b>ABS </b> <br> On";
                            dm_laps_completed.innerHTML = `<b>Laps Completed </b><br> ${driver.num_laps - 1}`;
                            while (dm_hist_table_body.lastElementChild) {
                                dm_hist_table_body.removeChild(dm_hist_table_body.lastElementChild);
                            }
                            if (data.LapHistory === undefined) {
                                console.log("Missing Data");
                            }
                            for (var lap of data.LapHistory) {

                                if (lap.time != "0:00.000") {
                                    var lapDiv = document.createElement("tr");
                                    lapDiv.classList.add("lap");
                                    svg_path = {
                                        16: "./soft.svg",
                                        17: "./medium.svg",
                                        18: "./hard.svg",
                                        7: "./inter.svg",
                                        8: "./wet.svg",
                                        255: "./pit.webp"
                                    }
                                    dm_hist_table_body.appendChild(lapDiv);
                                    lapDiv.innerHTML = `<td targ=${driver.idx}>${lap.lap_num}</td><td targ=${driver.idx}><img src=${svg_path[lap.tyre]} class="tyre"></td><td targ=${driver.idx} class=${lap.lap_num == driver.bestLapNum ? "best-lap" : ""}>${lap.time}</td><td targ=${driver.idx} class=${lap.lap_num == driver.bestSOne ? "best-sector" : ""}>${(Math.round((lap.sone / 1000) * 1000) / 1000).toFixed(3)}</td><td targ=${driver.idx} class=${lap.lap_num == driver.bestSTwo ? "best-sector" : ""}>${(Math.round((lap.stwo / 1000) * 1000) / 1000).toFixed(3)}</td><td targ=${driver.idx} class=${lap.lap_num == driver.bestSThree ? "best-sector" : ""}>${(Math.round((lap.sthree / 1000) * 1000) / 1000).toFixed(3)}</td>`;
                                }
                            }
                            dm_rwing.innerHTML = `${driver.rWing}%<br>Right Wing`;
                            dm_rwing.style.backgroundColor = colorGradient(driver.rWing / 100, { red: 0, green: 255, blue: 0 }, { red: 255, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 });
                            dm_lwing.innerHTML = `${driver.lWing}%<br>Left Wing`;
                            dm_lwing.style.backgroundColor = colorGradient(driver.lWing / 100, { red: 0, green: 255, blue: 0 }, { red: 255, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 });
                            dm_rsidepod.innerHTML = `${driver.sidepod}% <br>Side <br> pod`;
                            dm_rsidepod.style.backgroundColor = colorGradient(driver.sidepod / 100, { red: 0, green: 255, blue: 0 }, { red: 255, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 });
                            dm_lsidepod.innerHTML = `${driver.sidepod}% <br>Side <br> pod`;
                            dm_lsidepod.style.backgroundColor = colorGradient(driver.sidepod / 100, { red: 0, green: 255, blue: 0 }, { red: 255, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 });
                            dm_rfloor.innerHTML = `${driver.floor}% <br>Floor`;
                            dm_rfloor.style.backgroundColor = colorGradient(driver.floor / 100, { red: 0, green: 255, blue: 0 }, { red: 255, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 });
                            dm_lfloor.innerHTML = `${driver.floor}% <br>Floor`;
                            dm_lfloor.style.backgroundColor = colorGradient(driver.floor / 100, { red: 0, green: 255, blue: 0 }, { red: 255, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 });
                            dm_diffuser.innerHTML = `${driver.diffuser}%<br>Diffuser`;
                            dm_diffuser.style.backgroundColor = colorGradient(driver.diffuser / 100, { red: 0, green: 255, blue: 0 }, { red: 255, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 });
                            dm_rear_wing.innerHTML = `${driver.rearWing}%<br>Rear Wing`;
                            dm_rear_wing.style.backgroundColor = colorGradient(driver.rearWing / 100, { red: 0, green: 255, blue: 0 }, { red: 255, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 });
                        }
                    });

                });
            }
        }
        sess = data.Session;
        var driverIdx = 0;
        for (driverIdx; driverIdx < data.Drivers.length; driverIdx++) {
            var driver = data.Drivers[driverIdx];
            var driverDiv = driverArray[driverIdx];
            let Pos = document.getElementById(`${driver.pos}-Pos`);
            let PosNow;
            let Name = document.getElementById(`${driver.pos}-Name`);
            let NameNow;
            let Tyre = document.getElementById(`${driver.pos}-Tyre`);
            let TyreNow;
            let TyreWear = document.getElementById(`${driver.pos}-TyreWear`);
            let TyreWearNow;
            let TyreAge = document.getElementById(`${driver.pos}-TyreAge`);
            let TyreAgeNow;
            let TyreTemp = document.getElementById(`${driver.pos}-TyreTemp`);
            let TyreTempNow;
            let ERS = document.getElementById(`${driver.pos}-ERS`);
            if (ERS!=null){ERS.classList.add("ers-cell");}
            let ERSNow;
            let ERSMode = document.getElementById(`${driver.pos}-ERSMode`);
            let ERSModeNow;
            let FuelMode = document.getElementById(`${driver.pos}-FuelMode`);
            let FuelModeNow;
            let FuelMargin = document.getElementById(`${driver.pos}-FuelMargin`);
            let FuelMarginNow;
            let Penalties = document.getElementById(`${driver.pos}-Penalties`);
            let PenaltiesNow;
            let Gap = document.getElementById(`${driver.pos}-Gap`);
            let GapNow;
            let WingDmg = document.getElementById(`${driver.pos}-WingDmg`);
            let WingDmgNow;
            let Sector1 = document.getElementById(`${driver.pos}-Sector1`);
            let Sector1Now;
            let Sector2 = document.getElementById(`${driver.pos}-Sector2`);
            let Sector2Now;
            let Sector3 = document.getElementById(`${driver.pos}-Sector3`);
            let Sector3Now;
            let LastLap = document.getElementById(`${driver.pos}-LastLap`);
            let LastLapNow;
            let BestLap = document.getElementById(`${driver.pos}-BestLap`);
            let BestLapNow;
            if (Pos!=null){
            Pos.setAttribute("targ", `${driver.idx}`);}
            if (Name!=null){
            Name.setAttribute("targ", `${driver.idx}`);}
            if (Tyre!=null){
            Tyre.setAttribute("targ", `${driver.idx}`);}
            if (ERS!=null){
            ERS.setAttribute("targ", `${driver.idx}`);}
            if (ERSMode!=null){
            ERSMode.setAttribute("targ", `${driver.idx}`);}
            if (FuelMargin!=null){
            FuelMargin.setAttribute("targ", `${driver.idx}`);}
            if (Penalties!=null){
            Penalties.setAttribute("targ", `${driver.idx}`);}
            if (Gap!=null){
            Gap.setAttribute("targ", `${driver.idx}`);}
            if (WingDmg!=null){
            WingDmg.setAttribute("targ", `${driver.idx}`);}
            if (Sector1!=null){
            Sector1.setAttribute("targ", `${driver.idx}`);}
            if (Sector2!=null){
            Sector2.setAttribute("targ", `${driver.idx}`);}
            if (Sector3!=null){
            Sector3.setAttribute("targ", `${driver.idx}`);}
            if (LastLap!=null){
            LastLap.setAttribute("targ", `${driver.idx}`);}
            if (BestLap!=null){
            BestLap.setAttribute("targ", `${driver.idx}`);}
            if (driver.pos == 1) {
                driver.gap = "Leader";
            } else {
                distance = data.Drivers[driver.pos - 2].dist - driver.dist;
                speed = driver.speed / 3.6;
                driver.gap = distance / speed;
                if (driver.gap < 0 || driver.gap == "Infinity" || driver.gap == NaN) {
                    driver.gap = "Calculating";
                }else {
                    driver.gap = `+${(Math.round(driver.gap * 100) / 100).toFixed(2)}`;
                }
            }
            if (driver.privacy == "Public") {
                driver.ersMode == "Overtake" ? driver.ersMode = "On" : driver.ersMode = "Off";
                driver.ers > 75 ? driver.ers = `<p class=ers-text>${driver.ers}</p> <img src=./ERS100.svg class=ers-info>`
                    : driver.ers > 50 ? driver.ers = `<p class=ers-text>${driver.ers}</p> <img src=./ERS75.svg class=ers-info>`
                        : driver.ers > 35 ? driver.ers = `<p class=ers-text>${driver.ers}</p> <img src=./ERS50.svg class=ers-info>`
                            : driver.ers > 10 ? driver.ers = `<p class=ers-text>${driver.ers}</p> <img src=./ERS25.svg class=ers-info>`
                                : driver.ers = `<p class=ers-text>${driver.ers}</p> <img src=./ERS0.svg class=ers-info>`;
                if (Tyre!=null){Tyre.classList.add(`${driver.tyreCompound}`);
                if (driver.tyreWear > 60) {
                    if (!Tyre.classList.contains("well-worn")) {
                        Tyre.classList.remove(...Tyre.classList);
                        Tyre.classList.add("well-worn");
                    }
                } else if (driver.tyreWear > 45) {
                    if (!Tyre.classList.contains("field-tested")) {
                        Tyre.classList.remove(...Tyre.classList);
                        Tyre.classList.add("field-tested");
                    }
                } else if (driver.tyreWear > 30) {
                    if (!Tyre.classList.contains("min-wear")) {
                        Tyre.classList.remove(...Tyre.classList);
                        Tyre.classList.add("min-wear");
                    }
                } else {
                    if (!Tyre.classList.contains("fac-new")) {
                        Tyre.classList.remove(...Tyre.classList);
                        Tyre.classList.add("fac-new");
                    }
                }}
                driver.tyre = `${driver.tyreAge}L (${driver.tyreWear}%) <img src=./${driver.tyreCompound}.svg class=tyre-info>`;
                if (driver.fuelLaps > 0) {
                    driver.petrol = `+${driver.fuelLaps}`;
                } else if (driver.fuelLaps < 0) {
                    driver.petrol = `${driver.fuelLaps}`;
                }
                if (driver.status != 3 && driver.status != 2) {
                    PosNow = `${driver.pos}`;
                    NameNow = `${driver.name} 🏁`;
                    TyreNow = `DNF`;
                    TyreWearNow = `DNF`;
                    TyreAgeNow = `DNF`;
                    TyreTempNow = `DNF`;
                    ERSNow = `DNF`;
                    ERSModeNow = `DNF`;
                    FuelModeNow = `DNF`;
                    FuelMarginNow = `DNF`;
                    PenaltiesNow = `DNF`;
                    GapNow = `DNF`
                    WingDmgNow = `DNF`;
                    Sector1Now = `DNF`;
                    Sector2Now = `DNF`;
                    Sector3Now = `DNF`;
                    LastLapNow = `DNF`;
                    BestLapNow = `DNF`;
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
                        PosNow = `${driver.pos}`;
                        NameNow = `${driver.name}`;
                        TyreNow = `${driver.tyre}`;
                        TyreWearNow = `${driver.tyreWear}%`;
                        TyreAgeNow = `${driver.tyreAge} laps - ${driver.tyreCompound}`;
                        TyreTempNow = `${driver.tyreTemp}°C`;
                        ERSNow = `${driver.ers}`;
                        ERSModeNow = `${driver.ersMode}`;
                        FuelModeNow = `${driver.fuelMix}`;
                        FuelMarginNow = `${driver.petrol}`;
                        PenaltiesNow = `${driver.pens}`;
                        GapNow = `${driver.gap}`;
                        WingDmgNow = `L${driver.lWing} - R${driver.rWing}`;
                        Sector1Now = `${(Math.round((driver.sone / 1000) * 1000) / 1000).toFixed(3)}`;
                        Sector2Now = `${(Math.round((driver.stwo / 1000) * 1000) / 1000).toFixed(3)}`;
                        Sector3Now = `${(Math.round((driver.sthree / 1000) * 1000) / 1000).toFixed(3)}`;
                        if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                            LastLapNow = `${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                        } else {
                            LastLapNow = `${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                        }
                        if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                            BestLapNow = `${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                        } else {
                            BestLapNow = `${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                        }
                    } else if (driver.pit == 1 || driver.pit == 2) {
                        PosNow = `PITS`;
                        NameNow = `${driver.name}`;
                        TyreNow = `PITS`;
                        TyreWearNow = `PITS`;
                        TyreAgeNow = `PITS`;
                        TyreTempNow = `PITS`;
                        ERSNow = `${driver.ers}`;
                        ERSModeNow = `${driver.ersMode}`;
                        FuelModeNow = `${driver.fuelMix}`;
                        FuelMarginNow = `${driver.petrol}`;
                        PenaltiesNow = `${driver.pens}`;
                        GapNow = `${driver.gap}`;
                        WingDmgNow = `L${driver.lWing} - R${driver.rWing}`;
                        Sector1Now = `${(Math.round((driver.sone / 1000) * 1000) / 1000).toFixed(3)}`;
                        Sector2Now = `${(Math.round((driver.stwo / 1000) * 1000) / 1000).toFixed(3)}`;
                        Sector3Now = `${(Math.round((driver.sthree / 1000) * 1000) / 1000).toFixed(3)}`;
                        if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                            LastLapNow = `${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                        } else {
                            LastLapNow = `${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                        }
                        if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                            BestLapNow = `${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                        } else {
                            BestLapNow = `${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                        }
                    }
                }
            } else if (driver.privacy == "Private Telemetry") {
                if (driver.status != 3 && driver.status != 2) {
                    PosNow = `${driver.pos}`;
                    NameNow = `${driver.name} 🏁`;
                    TyreNow = `DNF`;
                    TyreWearNow = `<DNF`;
                    TyreAgeNow = `DNF`;
                    TyreTempNow = `DNF`;
                    ERSNow = `DNF`;
                    ERSModeNow = `DNF`;
                    FuelModeNow = `DNF`;
                    FuelMarginNow = `DNF`;
                    PenaltiesNow = `DNF`;
                    GapNow = `DNF`;
                    WingDmgNow = `DNF`;
                    Sector1Now = `DNF`;
                    Sector2Now = `DNF`;
                    Sector3Now = `DNF`;
                    LastLapNow = `DNF`;
                    BestLapNow = `DNF`;
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
                        PosNow = `${driver.pos}`;
                        NameNow = `${driver.name}`;
                        TyreNow = `${driver.tyre}`;
                        TyreWearNow = `Private`;
                        TyreAgeNow = `${driver.tyreCompound}`;
                        TyreTempNow = `Private`;
                        ERSNow = `Private`;
                        ERSModeNow = `Private`;
                        FuelModeNow = `Private`;
                        FuelMarginNow = `Private`;
                        PenaltiesNow = `${driver.pens}`;
                        GapNow = `${driver.gap}`;
                        WingDmgNow = `Private`;
                        Sector1Now = `${(Math.round((driver.sone / 1000) * 1000) / 1000).toFixed(3)}`;
                        Sector2Now = `${(Math.round((driver.stwo / 1000) * 1000) / 1000).toFixed(3)}`;
                        Sector3Now = `${(Math.round((driver.sthree / 1000) * 1000) / 1000).toFixed(3)}`;
                        if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                            LastLapNow = `${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                        } else {
                            LastLapNow = `${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                        }
                        if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                            BestLapNow = `${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                        } else {
                            BestLapNow = `${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                        }
                    } else if (driver.pit == 1 || driver.pit == 2) {
                        PosNow = `PITS`
                        NameNow = `${driver.name}`
                        TyreNow = `PITS`;
                        TyreWearNow = `PITS`;
                        TyreAgeNow = `PITS`;
                        TyreTempNow = `PITS`;
                        ERSNow = `Private`;
                        ERSModeNow = `Private`;
                        FuelModeNow = `Private`;
                        FuelMarginNow = `Private`;
                        PenaltiesNow = `${driver.pens}`;
                        GapNow = `${driver.gap}`;
                        WingDmgNow = `Private`;
                        Sector1Now = `${(Math.round((driver.sone / 1000) * 1000) / 1000).toFixed(3)}`;
                        Sector2Now = `${(Math.round((driver.stwo / 1000) * 1000) / 1000).toFixed(3)}`;
                        Sector3Now = `${(Math.round((driver.sthree / 1000) * 1000) / 1000).toFixed(3)}`;
                        if ((driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3) < 10) {
                            LastLapNow = `${Math.floor(driver.lastLap / 60)}:0${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                        } else {
                            LastLapNow = `${Math.floor(driver.lastLap / 60)}:${(driver.lastLap - Math.floor(driver.lastLap / 60) * 60).toFixed(3)}`;
                        }
                        if ((driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3) < 10) {
                            BestLapNow = `${Math.floor(driver.bestLapTime / 60)}:0${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                        } else {
                            BestLapNow = `${Math.floor(driver.bestLapTime / 60)}:${(driver.bestLapTime - Math.floor(driver.bestLapTime / 60) * 60).toFixed(3)}`;
                        }
                    }
                }
            }
            if (Pos != null) {
                if (Pos.innerHTML != PosNow) {
                    Pos.innerHTML = PosNow;
                }
            } else {
            }
            if (Name != null) {
                if (Name.innerHTML != NameNow) {
                    Name.innerHTML = NameNow;
                }
            }
            if (Tyre != null) {
                if (Tyre.innerHTML.replaceAll("\"", "") != TyreNow) {
                    Tyre.innerHTML = TyreNow;
                }
            }
            if (TyreWear != null) {
                if (TyreWear.innerHTML != TyreWearNow) {
                    TyreWear.innerHTML = TyreWearNow;
                }
            }
            if (TyreAge != null) {
                if (TyreAge.innerHTML != TyreAgeNow) {
                    TyreAge.innerHTML = TyreAgeNow;
                }
            }
            if (TyreTemp != null) {
                if (TyreTemp.innerHTML != TyreTempNow) {
                    TyreTemp.innerHTML = TyreTempNow;
                }
            }
            if (ERS != null) {
                if (ERS.innerHTML.replaceAll("\"", "") != ERSNow) {
                    ERS.innerHTML = ERSNow;
                }
            }
            if (ERSMode != null) {
                if (ERSMode.innerHTML != ERSModeNow) {
                    ERSMode.innerHTML = ERSModeNow;
                }
            }
            if (FuelMode != null) {
                if (FuelMode.innerHTML != FuelModeNow) {
                    FuelMode.innerHTML = FuelModeNow;
                }
            }
            if (FuelMargin != null) {
                if (FuelMargin.innerHTML != FuelMarginNow) {
                    FuelMargin.innerHTML = FuelMarginNow;
                }
            }
            if (Penalties != null) {
                if (Penalties.innerHTML != PenaltiesNow) {
                    Penalties.innerHTML = PenaltiesNow;
                }
            }
            if (Gap != null) {
                if (Gap.innerHTML != GapNow) {
                    Gap.innerHTML = GapNow;
                }
            }
            if (WingDmg != null) {
                if (WingDmg.innerHTML != WingDmgNow) {
                    WingDmg.innerHTML = WingDmgNow;
                }
            }
            if (LastLap != null) {
                if (LastLap.innerHTML != LastLapNow) {
                    LastLap.innerHTML = LastLapNow;
                }
            }
            if (BestLap != null) {
                if (BestLap.innerHTML != BestLapNow) {
                    BestLap.innerHTML = BestLapNow;
                }
            }
            if (Sector1 != null) {
                if (Sector1.innerHTML != Sector1Now) {
                    Sector1.innerHTML = Sector1Now;
                }
            }
            if (Sector2 != null) {
                if (Sector2.innerHTML != Sector2Now) {
                    Sector2.innerHTML = Sector2Now;
                }
            }
            if (Sector3 != null) {
                if (Sector3.innerHTML != Sector3Now) {
                    Sector3.innerHTML = Sector3Now;
                }
            }

        }
        try {
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
                    lapsDiv.innerHTML = `${sess.lap-1}/${sess.totalLaps} laps completed`;
                } else {
                    lapsDiv.innerHTML = `Formation Lap`;
                }
            }
            // while (weatherDiv.lastElementChild) {
            //     weatherDiv.removeChild(weatherDiv.lastElementChild);
            // }
            newWeatherDiv = document.createElement("div");
            if (sess.qualiWeater != undefined) {
                sess.qualiWeater.sort(function (a, b) {
                    var x = a[1];
                    var y = b[1];
                    return x - y;
                });
                if (sess.name == "Quaying") {
                    newWeatherDiv.innerHTML = "Quali weather<br>";
                    var j = 0;
                    for (j; j < sess.qualiWeater.length; j++) {
                        weatherForecast = sess.qualiWeater[j];
                        forecastDiv = document.createElement("div");
                        forecastDiv.classList.add("forecast");
                        forecastDiv.innerHTML = `${weatherForecast[0]} in ${weatherForecast[1]} minutes ${sess.qualiRain[j]}% rain`;
                        newWeatherDiv.appendChild(forecastDiv);
                    }
                    var k = 0;
                    for (k; k < sess.raceWeather.length; k++) {
                        weatherForecast = sess.raceWeather[k];
                        forecastDiv = document.createElement("div");
                        forecastDiv.classList.add("forecast");
                        forecastDiv.innerHTML = `${weatherForecast[0]} in ${weatherForecast[1]} minutes`;
                        newWeatherDiv.appendChild(forecastDiv);
                    }
                }
            }
            if (sess.raceWeather != undefined) {
                sess.raceWeather.sort(function (a, b) {
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
                j = 0;
                for (j; j < sess.raceWeather.length; j++) {
                    weatherForecast = sess.raceWeather[j];
                    forecastDiv = document.createElement("div");
                    forecastDiv.classList.add("forecast");
                    weatherForecast[1] == 0 ? weatherForecast[1] = "Now" : weatherForecast[1] = `${weatherForecast[1]} mins`;
                    //console.log(sess.raceRain[j]);
                    forecastDiv.innerHTML = `<p class=forecast-out>${weatherForecast[1]}</p> <img class=forecastsvg src=${weather_svg[weatherForecast[0]]}><br><p class=rain-chance>${sess.raceRain[j][0]}%</p><img src="./raindrop.svg" class=rain-chance-icon> `;
                    newWeatherDiv.appendChild(forecastDiv);
                }
            } else if (sess.raceWeather == undefined) {
                while (weatherDiv.lastElementChild) {
                    weatherDiv.removeChild(weatherDiv.lastElementChild);
                }
            }
            if (weatherDiv.innerHTML != newWeatherDiv.innerHTML) {
                weatherDiv.innerHTML = newWeatherDiv.innerHTML;
            }
        } catch (e) {
            //console.log(e);
        }
    }
});
