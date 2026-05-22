const telemetryBox = document.querySelector("#telemetryBox");

const simulationInfoBox = document.querySelector("#simulationInfoBox");
const simulationInfo = document.querySelector("#simulationInfo");
simulationInfoBox.style.display = 'none';

function simulationInfoDefault(){
    simulationInfo.innerHTML = "No Simulation Selected Yet";
}

telemetryBox.addEventListener('mouseenter', (e)=>{
    if(simulationsList[0]) simulationInfo.innerHTML = simulationsList[currentCar].name.replace(".RLSsim","")+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+secondsToTimeString(simulationsList[currentCar].totalTime, 3);
    simulationInfoBox.style.display = 'block';
});

telemetryBox.addEventListener('mouseleave', (e)=>{
    simulationInfoBox.style.display = 'none'; 
});

const carNameEl = document.querySelector("#carName");

const RPMbarEl = document.querySelector("#RPMbar");
const RPMel = document.querySelector("#RPM");

const brakeBarEl = document.querySelector("#brakeBar");
const throttleBarEl = document.querySelector("#throttleBar");

const gearEl = document.querySelector("#gear");

const speedEl = document.querySelector("#speed");

const deltaEl = document.querySelector("#delta");


function updateTelemetry(){
    if(!simulationsList[currentCar]){ 
        resetTelemetry() 
        return;
    }

    const currentNode = Math.trunc(simulationsList[currentCar].currentNode);

    carNameEl.innerHTML = simulationsList[currentCar].simulatedLap.car.manufacture+" "+ simulationsList[currentCar].simulatedLap.car.model;

    RPMbarEl.max = simulationsList[currentCar].simulatedLap.car.gearBox.RPM.max;
    RPMbarEl.min = simulationsList[currentCar].simulatedLap.car.gearBox.RPM.idle;

    let RPM = simulationsList[currentCar].simulatedLap.nodes[currentNode].RPM;
    RPMbarEl.value = RPM;
    RPMel.innerHTML = Math.round(RPM);

    let brake = simulationsList[currentCar].simulatedLap.nodes[currentNode].brake;
    brakeBarEl.value = brake;

    let throttle = simulationsList[currentCar].simulatedLap.nodes[currentNode].throttle;
    throttleBarEl.value = throttle;

    let gear = simulationsList[currentCar].simulatedLap.nodes[currentNode].gear;
    gearEl.innerHTML = gear;

    let speed = simulationsList[currentCar].simulatedLap.nodes[currentNode].V*3.6;
    speedEl.innerHTML = Math.round(speed);

    let delta = deltaToBest(simulationsList[currentCar]);
    deltaEl.innerHTML = (delta >= 0 ? "+" : "")+delta.toFixed(3);
    if(delta < 0){
        deltaEl.style.color = "#16c419";
    }else if(delta > 0){
        deltaEl.style.color = "#d11104";
    }else{
        deltaEl.style.color = "white";
    }
}

function resetTelemetry(){
    carNameEl.innerHTML = "No Car";

    RPMbarEl.value = 0;
    RPMbarEl.max = 0;
    RPMbarEl.min = 0;

    RPMel.innerHTML = 0;

    brakeBarEl.value = 0;

    throttleBarEl.value = 0;

    gearEl.innerHTML = "N";

    speedEl.innerHTML = 0;

    deltaEl.innerHTML = "+0.000";
    deltaEl.style.color = "white";
}

function deltaToBest(lap){
    if(!bestSimulation) return;
    if(bestSimulation == lap) return 0;

    let currentCarNormalizedPos = lap.distanceTravelled / lap.totalDistance;
    let currentCarPosition = bestSimulation.totalDistance * currentCarNormalizedPos;
    let distanceGap = bestSimulation.distanceTravelled - currentCarPosition;

    let Vcur = lap.simulatedLap.nodes[Math.trunc(lap.currentNode)].V;
    let Vbest = bestSimulation.simulatedLap.nodes[Math.trunc(bestSimulation.currentNode)].V;

    let delta = distanceGap/((Vcur+Vbest)/2);

    if(bestSimulation.totalDistance == bestSimulation.distanceTravelled){
        return lap.totalTime - bestSimulation.totalTime;
    }else{
        return delta;
    }
}

function secondsToTimeString(time, decimals){
    let str;
    let m = Math.trunc(time/60);
    str = m +":"
    let s = Math.trunc((time/60 - m)*60);
    let mill = Math.trunc((time - Math.trunc(time))*(10**decimals));
    if(s < 10) str += "0";
    mill = String(mill).padEnd(3, "0");
    return str+s+"."+mill;
  }

engine.runRenderLoop(() => {
    updateTelemetry();
  scene.render();
});