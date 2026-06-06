const GmeterCanvas = document.querySelector("#GmeterCanvas");
const GmeterLabel = document.querySelector("#GmeterLabel");
const peakGLabel = document.querySelector("#peakGLabel");
let ctx = GmeterCanvas.getContext('2d');

GmeterCanvas.width = 1000;
GmeterCanvas.height = 1000;

GballColor = "#ff7743";

let peakG = 0;
let peakGcounter = 0;
let simulationChecker;
function resetGmeter(){
    ctx.clearRect(0, 0, GmeterCanvas.width, GmeterCanvas.height);
    let lineThickness = 10;
    let GballRadius = 45;
    ctx.lineWidth = lineThickness;
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.fillStyle = "rgba(0, 3, 30, 0.4)";
    ctx.arc(GmeterCanvas.width/2, GmeterCanvas.height/2, 500-lineThickness/2, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = GballColor;
    ctx.arc(500, 500, GballRadius, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();

    GmeterLabel.innerHTML = "No data";
    peakGLabel.innerHTML = "peak: No data";
}

function drawGmeter(){
    if(!simulationsList[currentCar]){
        resetGmeter();
        return
    }
    let currentSimulation = simulationsList[currentCar];
    let currentNode = currentSimulation.simulatedLap.nodes[Math.trunc(currentSimulation.currentNode)];
    let maxG = Math.trunc(currentSimulation.maxG)+1;

    let longG = currentNode.longitudinalG;
    let latG = currentNode.lateralG;
    let totalG = Math.sqrt(longG**2 + latG**2);

    if(!simulationChecker) simulationChecker = currentSimulation;
    if(simulationChecker !== currentSimulation){
        peakG = 0;
        peakGcounter = currentSimulation.currentNode;
        simulationChecker = currentSimulation;
    }else if(currentSimulation.currentNode - peakGcounter >= 130){
        peakG = 0;
        peakGcounter = currentSimulation.currentNode;
    }
    if(totalG > peakG) peakG = totalG;

    let Gx = ((latG+maxG)/(maxG))*GmeterCanvas.width/2;
    let Gy = ((longG+maxG)/(maxG))*GmeterCanvas.height/2;

    let lineThickness = 10;
    let GballRadius = 45;
    let gap = (GmeterCanvas.width/2-lineThickness/2)/maxG;

    let radius = gap;

    ctx.beginPath();
    ctx.clearRect(0, 0, GmeterCanvas.width, GmeterCanvas.height);
    ctx.fillStyle = "rgba(0, 3, 30, 0.4)";
    ctx.arc(GmeterCanvas.width/2, GmeterCanvas.height/2, 500-lineThickness/2, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.lineWidth = lineThickness;
    ctx.strokeStyle = "white";
    ctx.moveTo(0, GmeterCanvas.height/2);
    ctx.lineTo(GmeterCanvas.width, GmeterCanvas.height/2);
    ctx.moveTo(GmeterCanvas.width/2, 0);
    ctx.lineTo(GmeterCanvas.width/2, GmeterCanvas.height);
    ctx.moveTo(GmeterCanvas.width/2, GmeterCanvas.height/2);
    for(let i=0; i < maxG; i++){
        ctx.arc(GmeterCanvas.width/2, GmeterCanvas.height/2, radius, 0, 2 * Math.PI, false);
        ctx.stroke();

        radius += gap;
    }
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = GballColor;
    ctx.arc(Gx, Gy, GballRadius, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();

    GmeterLabel.innerHTML = totalG.toFixed(1)+" G";
    peakGLabel.innerHTML = "peak: "+peakG.toFixed(1)+" G";
}