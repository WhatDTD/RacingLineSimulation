const trackMapCanvas = document.querySelector("#trackMapCanvas");
const trackMapPointsCanvas = document.querySelector("#trackMapPointsCanvas");
let TMctx = trackMapCanvas.getContext('2d');
let TMPctx = trackMapPointsCanvas.getContext('2d');

trackMapCanvas.width = 1;
trackMapCanvas.height = 1;
trackMapPointsCanvas.width = 1;
trackMapPointsCanvas.height = 1;

let maxX;
let minX;
let maxY;
let minY;

let lineThickness = 0.02;
let pointsRadiusPc = 0.025;
let currentPointRadiusPc = 0.035;

let gap = 0;

let width;
let height;

let zero = {
    x:0,
    y:0
}

function clearTrackMap(){
    TMctx.beginPath();
    TMctx.clearRect(0, 0, trackMapCanvas.width, trackMapCanvas.height);
    TMctx.closePath();
    trackMapCanvas.width = 1;
    trackMapCanvas.height = 1;
    trackMapPointsCanvas.width = 1;
    trackMapPointsCanvas.height = 1;
    maxX = null;
    minX = null;
    maxY = null;
    minY = null;
}

function drawTrackMap(){
    simulationsList.forEach(sim => {
        sim.simulatedLap.nodes.forEach(node => {
            if(!maxX){
                maxX = node.x;
                minX = node.x;
                maxY = node.z;
                minY = node.z;
            }else{
                maxX = Math.max(maxX, node.x);
                minX = Math.min(minX, node.x);
                maxY = Math.max(maxY, node.z);
                minY = Math.min(minY, node.z);
            }
        });
    });

    width = maxX - minX;
    height = maxY - minY;

    trackMapCanvas.width = width + currentPointRadiusPc*width*2;
    trackMapCanvas.height = height + currentPointRadiusPc*width*2;

    gap = currentPointRadiusPc*width/2;

    trackMapPointsCanvas.width = trackMapCanvas.width;
    trackMapPointsCanvas.height = trackMapCanvas.height;

    let norm;
    if(Math.abs(maxX) < Math.abs(minX)){
        norm = Math.abs(maxX)/width;
        zero.x = width*norm;
    }else{
        norm = Math.abs(minX)/width;
        zero.x = width - width*norm;
    }

    if(Math.abs(maxY) < Math.abs(minY)){
        norm = Math.abs(maxY)/height;
        zero.y = height - height*norm;
    }else{
        norm = Math.abs(minY)/height;
        zero.y = height*norm;
    }

    console.log(zero)

    TMctx.beginPath();
    TMctx.clearRect(0, 0, trackMapCanvas.width, trackMapCanvas.height);
    TMctx.closePath();
    TMctx.beginPath();
    TMctx.lineWidth = lineThickness*width;
    TMctx.strokeStyle = "white";
    simulationsList.forEach(sim => {
        TMctx.moveTo(zero.x-sim.simulatedLap.nodes[0].x+currentPointRadiusPc*width/2+gap, zero.y+sim.simulatedLap.nodes[0].z+currentPointRadiusPc*width/2+gap);
        sim.simulatedLap.nodes.forEach(node => {
            TMctx.lineTo(zero.x-node.x+currentPointRadiusPc*width/2+gap, zero.y+node.z+currentPointRadiusPc*width/2+gap);
        });
    });
    TMctx.stroke();
    TMctx.closePath();
}

function drawTrackMapPoints(){
    TMPctx.beginPath();
    TMPctx.clearRect(0, 0, trackMapCanvas.width, trackMapCanvas.height);
    TMPctx.closePath();
    simulationsList.forEach(sim => {
        if(sim !== simulationsList[currentCar]){
            TMPctx.beginPath();
            TMPctx.fillStyle = sim.color;
            let node = sim.simulatedLap.nodes[Math.trunc(sim.currentNode)];
            TMPctx.arc(zero.x-node.x+currentPointRadiusPc*width/2+gap, zero.y+node.z+currentPointRadiusPc*width/2+gap, trackMapCanvas.width*pointsRadiusPc, 0, Math.PI*2);
            TMPctx.fill();
            TMPctx.closePath();
        }
    });

    if(!simulationsList[currentCar]) return;
    TMPctx.beginPath();
    let sim = simulationsList[currentCar];
    console.log(sim.color);
    TMPctx.fillStyle = sim.color;
    let node = sim.simulatedLap.nodes[Math.trunc(sim.currentNode)];
    TMPctx.arc(zero.x-node.x+currentPointRadiusPc*width/2+gap, zero.y+node.z+currentPointRadiusPc*width/2+gap, trackMapCanvas.width*currentPointRadiusPc, 0, Math.PI*2);
    TMPctx.fill();
    TMPctx.closePath();
}