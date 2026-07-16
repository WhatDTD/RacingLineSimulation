const statsElement = {html: document.querySelector("#simulationStats"), visible: true};

function hideShowStats(){
    if(statsElement.visible){
        statsElement.html.style.display = 'none';
        statsElement.visible = false;
    }else{
        statsElement.html.style.display = 'block';
        statsElement.visible = true;
    }
}

function calculateLapStats(simLap){
    calculateTyreStress(simLap);
    simLap.simulatedLap.stats = {};
    calculateAvrgSpeed(simLap);
    calculateMaxSpeed(simLap);
    calculateThrottleStats(simLap);
    calculateBrakeStats(simLap);
    updateStats();
}


function calculateTyreStress(simLap){
    //Tyre stress
    simLap.simulatedLap.tyreStress = {
        FL: 0,
        FR: 0,
        RL: 0,
        RR: 0
    }

    for(let i=0; i < simLap.simulatedLap.nodes.length-1; i++){
        let lat = simLap.simulatedLap.nodes[i].lateralG;
        let longit = simLap.simulatedLap.nodes[i].longitudinalG;
        let stress = simLap.simulatedLap.tyreStress;

        stress.FL++;
        stress.FR++;
        stress.RL++;
        stress.RR++;

        if(lat < 0){
            stress.FL += Math.abs(lat);
            stress.RL += Math.abs(lat);
        }else{
            stress.FR += Math.abs(lat);
            stress.RR += Math.abs(lat);
        }

        if(longit < 0){
            stress.FL += Math.abs(longit);
            stress.FR += Math.abs(longit);
        }else{
            stress.RL += Math.abs(longit);
            stress.RR += Math.abs(longit);
        }
    }
}

function calculateAvrgSpeed(simLap){
    simLap.simulatedLap.stats.avrgV = simLap.totalDistance/simLap.totalTime;
}

function calculateMaxSpeed(simLap){
    let maxV = 0;
    for(let i=0; i < simLap.simulatedLap.nodes.length-2; i++){
        maxV = Math.max(simLap.simulatedLap.nodes[i].V, maxV);
    }

    simLap.simulatedLap.stats.maxV = maxV;
}

function calculateThrottleStats(simLap){
    let i=0;
    let fullThrottleNodes = 0;
    let throttleNodes = 0;
    while(i < simLap.simulatedLap.nodes.length-2){
        if(simLap.simulatedLap.nodes[i].throttle != 0){
            throttleNodes++;
            if(simLap.simulatedLap.nodes[i].throttle >= 100) fullThrottleNodes++;
        }
        i++;
    }

    simLap.simulatedLap.stats.fullThrottlePercentage = (fullThrottleNodes/i)*100;
    simLap.simulatedLap.stats.throttlePercentage = (throttleNodes/i)*100;
}

function calculateBrakeStats(simLap){
    let i=0;
    let brakeNodes = 0;
    while(i < simLap.simulatedLap.nodes.length-2){
        if(simLap.simulatedLap.nodes[i].brake != 0){
            brakeNodes++;
        }
        i++;
    }

    simLap.simulatedLap.stats.brakePercentage = (brakeNodes/i)*100;
}


const statsLapTime = document.querySelector("#statsLapTime");
const statsMaxSpeed = document.querySelector("#statsMaxSpeed");
const statsAvrgSpeed = document.querySelector("#statsAvrgSpeed");
const statsFullThrottlePc = document.querySelector("#statsFullThrottlePc");
const statsThrottlePc = document.querySelector("#statsThrottlePc");
const statsBrakePc = document.querySelector("#statsBrakePc");

const FLlabel = document.querySelector("#FLlabel");
const FRlabel = document.querySelector("#FRlabel");
const RLlabel = document.querySelector("#RLlabel");
const RRlabel = document.querySelector("#RRlabel");

const FL = document.querySelector("#FL");
const FR = document.querySelector("#FR");
const RL = document.querySelector("#RL");
const RR = document.querySelector("#RR");

function defaultStats(){
    statsLapTime.innerHTML = "0:00.000";
    statsMaxSpeed.innerHTML = "0 Km/h";
    statsAvrgSpeed.innerHTML = "0 Km/h";
    statsFullThrottlePc.innerHTML = "0%";
    statsThrottlePc.innerHTML = "0%";
    statsBrakePc.innerHTML = "0%";

    FLlabel.innerHTML = "0%";
    FRlabel.innerHTML = "0%";
    RLlabel.innerHTML = "0%";
    RRlabel.innerHTML = "0%";

    FL.style.background = "rgb(20, 22, 26)";
    FR.style.background = "rgb(20, 22, 26)";
    RL.style.background = "rgb(20, 22, 26)";
    RR.style.background = "rgb(20, 22, 26)";

    FL.innerHTML = "0G";
    FR.innerHTML = "0G";
    RL.innerHTML = "0G";
    RR.innerHTML = "0G";
}

function updateStats(){
    let sim = simulationsList[currentCar].simulatedLap;
    if(!sim){
        defaultStats();
        return;
    };

    statsLapTime.innerHTML = secondsToTimeString(sim.totalTime, 3);
    statsMaxSpeed.innerHTML = Math.round(sim.stats.maxV * 3.6) + " Km/h";
    statsAvrgSpeed.innerHTML = Math.round(sim.stats.avrgV * 3.6) + " Km/h";
    statsFullThrottlePc.innerHTML = Math.round(sim.stats.fullThrottlePercentage) + "%";
    statsThrottlePc.innerHTML = Math.round(sim.stats.throttlePercentage) + "%";
    statsBrakePc.innerHTML = Math.round(sim.stats.brakePercentage) + "%";

    let minTyreStress = Math.min(sim.tyreStress.FL, sim.tyreStress.FR, sim.tyreStress.RL, sim.tyreStress.RR);

    renderTyreStress(sim.tyreStress.FL, FL, FLlabel);
    renderTyreStress(sim.tyreStress.FR, FR, FRlabel);
    renderTyreStress(sim.tyreStress.RL, RL, RLlabel);
    renderTyreStress(sim.tyreStress.RR, RR, RRlabel);

    function renderTyreStress(tyreStress, tyre, tyreLabel){
        let pc = 0;
        if(tyreStress == minTyreStress){
            tyreLabel.innerHTML = "ref";
        }else{
            pc = (tyreStress-minTyreStress)/minTyreStress*100;
            tyreLabel.innerHTML = Math.trunc(pc)+"%";
        }

        tyre.innerHTML = (tyreStress/(sim.nodes.length-2)).toFixed(1)+"G";

        let pcThreshold = 40;
        let hslThreshold = 130;

        if(pc > pcThreshold) pc = pcThreshold;

        let hslValue = hslThreshold-(pc/pcThreshold)*hslThreshold;
        tyre.style.background = `hsl(${hslValue}deg 100% 25%)`;
    }
}