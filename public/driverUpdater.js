var socket = new WebSocket('ws://' + window.location.hostname);
var my_position_dropdown = document.getElementById("driverSelfPos"); 
var my_idx = 1;
var my_position = 4;
var limit = -1;
var data;
var driverTable = document.getElementById("table-body");
my_position_dropdown.addEventListener("change", function() {
    let ceiling;
    if (data.Drivers !== undefined) {
        if (this.value <= 20 && this.value >= 0) {
            for (var i = 0; i < data.Drivers.length; i++) {
                if (data.Drivers[i].pos == this.value) {
                    my_idx = data.Drivers[i].idx; 
                }
            }
            my_position = this.value-1;
        }
    }
}, false);

socket.addEventListener("message", function(event) {
    data = JSON.parse(event.data);
    if (data.Type == "id" || data.Type == "ModalInfo" || data.Type == "CommandReply") {}
    else{
        if (data.Drivers !== undefined) {
            while (driverTable.lastElementChild) {
                driverTable.removeChild(driverTable.lastElementChild);
            }
            limit = data.Drivers.length;
            let me;
            for (var driver of data.Drivers) {
                if (driver.idx == my_idx) {
                    me = driver;
                    my_position = driver.pos-1;
                }
            }
            var drivers;
            my_position == 0 ? drivers = data.Drivers.slice(0, 3) 
            : my_position == 1 ? drivers = data.Drivers.slice(0,4) 
            : my_position == data.Drivers.length - 1 ? drivers = data.Drivers.slice(my_position-2,my_position)
            : my_position == data.Drivers.length - 2 ? drivers = data.Drivers.slice(my_position-2, my_position+1)
            : drivers = data.Drivers.slice(my_position-2, my_position+3);
            for (var driver of drivers){
                driverDiv = document.createElement("tr");
                driverDiv.classList.add("driver");
                if (driver.pos == my_position+1) {
                    driverDiv.classList.add("driver-self");
                }
                driverTable.appendChild(driverDiv);
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
                    if (driver.fuelLaps > 0) {
                        driver.petrol = `+${driver.fuelLaps}`;
                    } else if (driver.fuelLaps < 0) {
                        driver.petrol = `${driver.fuelLaps}`;
                    }
                    if (driver.status != 3 && driver.status != 2) {
                        driverDiv.innerHTML = `<td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.pos}</td>
                    <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"} class=${driver.pos == my_position+1 ? "self" : "other"}>DNF</td>
                    <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>DNF</td>
                    <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>DNF</td>
                    <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>DNF</td>`;
                    } else {
                        if (driver.pit == 0) {
                            if (driver.status == 3) {
                                if (driver.pos == 1) {
                                    driver.pos += "🥇";
                                }
                                if (driver.pos == 2) {
                                    driver.pos += "🥈";
                                }
                                if (driver.pos == 3) {
                                    driver.pos += "🥉";
                                }
                                driver.pos += "🏁";
                            }
                            driverDiv.innerHTML = `<td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.pos}</td>
                        <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"} bgcolor=${driver.tyreCompoundColour}>${driver.tyreWear}%</td>
                                <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.ers}%</td>
                                <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.pens}</td>
                                <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>L${driver.lWing} - R${driver.rWing}</td>`;
                        } else if (driver.pit == 1 || driver.pit == 2) {
                            driverDiv.innerHTML = `<td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>Pitting</td>
                        <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>PITS</td>
                        <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.ers}</td>
                        <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.pens}</td>
                        <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>L${driver.lWing} - R${driver.rWing}</td>`;
                        }
                    }
                } else if (driver.privacy == "Private Telemetry") {
                    if (driver.status != 3 && driver.status != 2) {
                    driverDiv.innerHTML = `<td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.pos}</td>
                    <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>DNF</td>
                    <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>DNF</td>
                    <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>DNF</td>
                    <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>DNF</td>`;
                    } else {
                        if (driver.pit == 0) {
                            if (driver.status == 3) {
                                if (driver.pos == 1) {
                                    driver.pos += "🥇";
                                }
                                if (driver.pos == 2) {
                                    driver.pos += "🥈";
                                }
                                if (driver.pos == 3) {
                                    driver.pos += "🥉";
                                }
                                driver.pos += "🏁";
                            }
                            driverDiv.innerHTML = `<td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.pos}</td>
                       <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>Private</td>
                        <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>Private</td>
                        <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.pens}</td>
                        <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>Private</td>`;
                        } else if (driver.pit == 1 || driver.pit == 2) {
                            driverDiv.innerHTML = `<td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>Pitting</td>
                            <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>PITS</td>
                            <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>PITS</td>
                            <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>${driver.pens}</td>
                            <td targ=${driver.idx} class=${driver.pos == my_position+1 ? "self" : "other"}>Private</td>`;
                        }
                    }
                }
            }
        }
    }
});
