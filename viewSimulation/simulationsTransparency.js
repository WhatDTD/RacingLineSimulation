let isTransparencyOn = true;

let minTransparency = 0.17; //minimum transparency value (reached when distance == 0)
let maxDistance = 7.5; //in meters (if distance is bigger or equal to this value; transparency will be equal 1)

//Transparency Toggle with T key button
window.addEventListener("keydown", (e) => {
  if (e.key === "t") {
    isTransparencyOn = !isTransparencyOn;
  }
});


function calculateSimulationsTransparency(){
    if(simulationsList < 2) return;
    if(!isTransparencyOn){
        simulationsList.forEach(sim => {
            sim.carMesh.getChildMeshes(false).forEach(mesh => {
                if(!mesh.material) return; 
                mesh.material.transparencyMode = mesh.material.alpha < 1 ? 2 : 0; 
                mesh.visibility = 1;
            });
        })
        return;
    }
    simulationsList.forEach(sim => {
        let distanceFromCurrentCar = distance(sim.getPosition(), simulationsList[currentCar].getPosition())
        let transparencyValue = calculateTransparencyValue(distanceFromCurrentCar);
        if(sim !== simulationsList[currentCar] && distanceFromCurrentCar < maxDistance){
            sim.carMesh.getChildMeshes(false).forEach(mesh => {
                if(!mesh.material) return; 
                mesh.material.transparencyMode = 2;
                mesh.material.needDepthPrePass = true;
                mesh.visibility = transparencyValue;
            });
        }else{
            sim.carMesh.getChildMeshes(false).forEach(mesh => {
                if(!mesh.material) return; 
                mesh.material.transparencyMode = mesh.material.alpha < 1 ? 2 : 0; 
                mesh.material.needDepthPrePass = false;
                mesh.visibility = 1;
            });
        }
    });
}

function calculateTransparencyValue(distance){
    if(distance >= maxDistance) return 1;
    return distance/maxDistance*(1-minTransparency)+minTransparency;
}

function distance(p1,p2){
  return Math.sqrt((p1.x - p2.x)**2+(p1.y - p2.y)**2+(p1.z - p2.z)**2);
}