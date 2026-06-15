const trackMapCanvas = document.querySelector("#trackMapCanvas");
const trackMapPointsCanvas = document.querySelector("#trackMapPointsCanvas");
const trackMapSectorsCanvas = document.querySelector("#trackMapSectorsCanvas");
let TMctx = trackMapCanvas.getContext('2d');
let TMPctx = trackMapPointsCanvas.getContext('2d');
let TMSctx = trackMapSectorsCanvas.getContext('2d');

trackMapCanvas.width = 1;
trackMapCanvas.height = 1;
trackMapPointsCanvas.width = 1;
trackMapPointsCanvas.height = 1;
trackMapSectorsCanvas.width = 1;
trackMapSectorsCanvas.height = 1;

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

let size = 12;

let zero = {
    x:0,
    y:0
}

function clearTrackMap(){
    TMctx.beginPath();
    TMctx.clearRect(0, 0, trackMapCanvas.width, trackMapCanvas.height);
    TMctx.closePath();

    TMSctx.beginPath();
    TMSctx.clearRect(0, 0, trackMapSectorsCanvas.width, trackMapSectorsCanvas.height);
    TMSctx.closePath();

    trackMapCanvas.width = 1;
    trackMapCanvas.height = 1;
    trackMapPointsCanvas.width = 1;
    trackMapPointsCanvas.height = 1;
    trackMapSectorsCanvas.width = 1;
    trackMapSectorsCanvas.height = 1;
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

    trackMapSectorsCanvas.width = trackMapCanvas.width;
    trackMapSectorsCanvas.height = trackMapCanvas.height;

    let norm;
    if(Math.abs(maxX) < Math.abs(minX)){
        norm = Math.abs(maxX)/width;
        zero.x = width*norm;
        if(maxX < 0) zero.x *= -1;
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
    TMPctx.fillStyle = sim.color;
    let node = sim.simulatedLap.nodes[Math.trunc(sim.currentNode)];
    TMPctx.arc(zero.x-node.x+currentPointRadiusPc*width/2+gap, zero.y+node.z+currentPointRadiusPc*width/2+gap, trackMapCanvas.width*currentPointRadiusPc, 0, Math.PI*2);
    TMPctx.fill();
    TMPctx.closePath();
}

function calculateSectors(){
    TMSctx.beginPath();
    TMSctx.clearRect(0, 0, trackMapSectorsCanvas.width, trackMapSectorsCanvas.height);
    TMSctx.closePath();
    if(!bestSimulation) return;
    let sectorsDistance = 100;
    let sectorGap = sectorsDistance/bestSimulation.totalDistance;
    let normalizedPosition = 0;

    while(normalizedPosition < 1){
        let simsData = [];
        simulationsList.forEach(sim => {
            let startIndex = 0;
            let startDistance = 0;
            let nodes = sim.simulatedLap.nodes;
            while(startDistance < sim.totalDistance*normalizedPosition){
                startDistance += nodes[startIndex].d;
                startIndex++;
            }

            let simData = {nodes: [], avgV:0, color: sim.color};
            let endDistance = startDistance;
            let endIndex = startIndex
            let time = 0;
            while(endDistance < startDistance+sim.totalDistance*sectorGap && endIndex < nodes.length-2){
                endDistance += nodes[endIndex].d;
                time += nodes[endIndex].t;
                simData.nodes.push(nodes[endIndex]);
                endIndex++;
            }

            simData.avgV = (endDistance-startDistance)/time;
            simsData.push(simData);
        });

        const bestSimData = simsData.reduce((max, sim) => sim.avgV > max.avgV ? sim : max);
        
        TMSctx.beginPath();
        TMSctx.lineWidth = (lineThickness/2)*width;
        TMSctx.strokeStyle = bestSimData.color;
        TMSctx.moveTo(zero.x-bestSimData.nodes[0].x+currentPointRadiusPc*width/2+gap, zero.y+bestSimData.nodes[0].z+currentPointRadiusPc*width/2+gap);
        bestSimData.nodes.forEach(node => {
            TMSctx.lineTo(zero.x-node.x+currentPointRadiusPc*width/2+gap, zero.y+node.z+currentPointRadiusPc*width/2+gap);
        });
        TMSctx.stroke();
        TMSctx.closePath();

        normalizedPosition += sectorGap;
    }
}

const increaseSizeBtn = document.querySelector("#increaseSize");
const decreaseSizeBtn = document.querySelector("#decreaseSize");

increaseSizeBtn.addEventListener("click", (e) =>{
    changeMapSize(1);
});

increaseSizeBtn.addEventListener("dblclick", (e) =>{
    changeMapSize(4);
});

decreaseSizeBtn.addEventListener("click", (e) =>{
    changeMapSize(-1);
});

decreaseSizeBtn.addEventListener("dblclick", (e) =>{
    changeMapSize(-4);
});

function changeMapSize(value){
    trackMapCanvas.style = `width: ${size+value}vw;`
    trackMapSectorsCanvas.style = `width: ${size+value}vw;`
    trackMapPointsCanvas.style = `width: ${size+value}vw;`
    size += value;
}