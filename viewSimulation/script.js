const canvas = document.querySelector("canvas");
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
const hostname = window.location.hostname;
let folder = "";
if (hostname !== "localhost" && hostname !== "127.0.0.1") {
  folder = "/RacingLineSimulation";
} 
scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(`${folder}/assets/environment.env`, scene);


//Free Camera
const camera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-320, 1262, 409),
  scene
);
camera.attachControl(canvas, true);
const defaultSpeed = 3;
camera.speed = defaultSpeed;
camera.rotation = new BABYLON.Vector3(1.42, 1.5185, 0);
let fovChange = 0.0005;



//Free Camera Keyboard inputs
//Camera Speed while holding Shift
window.addEventListener("keydown", (e) => {
  if (e.shiftKey) {
    camera.speed = 1;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) {
    camera.speed = defaultSpeed;
  }
});


//Camera Speed while holding Ctrl
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    camera.speed = 15;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.ctrlKey) {
    camera.speed = defaultSpeed;
  }
});

window.addEventListener("wheel", (e)=>{
  camera.fov += e.deltaY * fovChange;
  if(camera.fov < 0.08){
    camera.fov = 0.08;
  }

    if(camera.fov > 2.9){
    camera.fov = 2.9;
  }
});

//camera fov reset: Shift+f
window.addEventListener("keydown", (e)=>{
  if(e.key === "F") camera.fov = 0.8;
});




const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);

let colorList = [ {r: 0, g: 0, b: 0.6},
                  {r: 0.6, g: 0, b: 0},
                  {r: 0, g: 0.6, b: 0},
                  {r: 1, g: 0.8, b: 0},
                  {r: 0, g: 1, b: 1},
                  {r: 1, g: 0, b: 1}
]

let cameras = ["driverCam", "Tcam", "bumperCam", "onboard1", "onboard2", "onboard3", "topView", "chase"];
let currentCamera = 0;
let currentCar = 0;

let colorCounter = 0;

let trackMesh;
let simulationsList = [];


let trackMeshLoaded = false;
let simulationLoaded = false;



//Additional Key Inputs

//Hide Lines if H key is pressed
let showLines = true;
window.addEventListener("keydown", (e) => {
  if (e.key === "h") {
    showLines = !showLines;
    simulationsList.forEach(simulation => {
      simulation.showLine(showLines);
    });
  }
});




//import Track
const importTrackModel = document.querySelector('#importTrackModel');

importTrackModel.addEventListener("change", async (e) =>{
  const file = e.target.files[0];
  if (!file) return;


  const url = URL.createObjectURL(file);

  if(trackMesh) trackMesh.dispose();

  engine.displayLoadingUI();
  const sceneSystem = scene.useRightHandedSystem;
  scene.useRightHandedSystem = false;
  BABYLON.SceneLoader.ImportMeshAsync("", "", file, scene)
    .then((result) => {
        engine.hideLoadingUI();
        scene.useRightHandedSystem = sceneSystem;

        trackMesh = result.meshes[0];
        trackMeshLoaded = true;
        checkRunSimulationBtn();
    });
});



//import Simulation

const importSimulation = document.querySelector('#importSimulation');

importSimulation.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }  
  const simulation = JSON.parse(await file.text());
  const simulationAnimation = await new SimulationAnimation(simulation, scene, engine);
  simulationLoaded = true;
  simulationsList.push(simulationAnimation);
  simulationAnimation.setLineColor(colorList[colorCounter].r, colorList[colorCounter].g, colorList[colorCounter].b);
  simulationAnimation.showLine(showLines);
  if(simulationsList) currentCar = simulationsList.length-1;
  colorCounter++;

  checkRunSimulationBtn();
});


const runSimulationButton = document.querySelector('#runSimulation');
runSimulationButton.addEventListener('click', () => {
  simulationsList.forEach(simulation => {
      simulation.startAnimation();
  });
});


const clearSimulationsButton = document.querySelector('#clearSimulations');
clearSimulationsButton.addEventListener('click', () => {
  simulationsList.forEach(simulation => {
      simulation.deleteMeshes();
  });
  scene.useRightHandedSystem = false;
  scene.activeCamera = camera;
  colorCounter = 0;
  currentCar = 0;
  simulationsList = [];
  simulationLoaded = false;
  checkRunSimulationBtn();
});


const nextCarButton = document.querySelector("#nextCar");
nextCarButton.addEventListener("click", () =>{
  nextCar();
});

const nextCameraButton = document.querySelector("#nextCamera");
nextCameraButton.addEventListener("click", () =>{
  nextCamera();
});


engine.runRenderLoop(() => {
  scene.render();
});


function nextCar(){
  if(simulationsList.length != 0){
    scene.useRightHandedSystem = true;
    currentCar++;
    if(currentCar >= simulationsList.length) currentCar = 0;
    simulationsList[currentCar].switchToCamera(cameras[currentCamera]);
  }
}

function nextCamera(){
  if(simulationsList.length){
    if(currentCamera > cameras.length-2){
      scene.useRightHandedSystem = false;
      scene.activeCamera = camera;
      currentCamera = -1;
    }else{
      scene.useRightHandedSystem = true;
      currentCamera++;
      simulationsList[currentCar].switchToCamera(cameras[currentCamera]);
    }
  }
}



function checkRunSimulationBtn(){
  if(trackMesh && simulationLoaded){
    if(runSimulationButton.hasAttribute("disabled")) runSimulationButton.removeAttribute("disabled");
  }else{
    runSimulationButton.setAttribute("disabled", true);
  }
}