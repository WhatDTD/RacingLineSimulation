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
let bestSimulation;
let worstSimulation;


let trackMeshLoaded = false;
let simulationLoaded = false;

let isAnimationPaused = true;
let timeLineUpdateAvailable = true;



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
    });
});



//import Simulation

const importSimulation = document.querySelector('#importSimulation');

importSimulation.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  resetAnimations();
  pauseAnimations();

  const simulation = JSON.parse(await file.text());
  const simulationAnimation = await new SimulationAnimation(simulation, file.name, scene, engine);
  if(!bestSimulation || await simulationAnimation.simulatedLap.totalTime < bestSimulation.simulatedLap.totalTime) bestSimulation = await simulationAnimation;
  if(!worstSimulation || await simulationAnimation.simulatedLap.totalTime > worstSimulation.simulatedLap.totalTime) worstSimulation = await simulationAnimation;
  updateTimeLineValues();
  simulationLoaded = true;
  simulationsList.push(simulationAnimation);
  beginAnimations(0);
  pauseAnimations();
  drawTrackMap();
  simulationAnimation.setLineColor(colorList[colorCounter].r, colorList[colorCounter].g, colorList[colorCounter].b);
  simulationAnimation.showLine(showLines);
  if(simulationsList) currentCar = simulationsList.length-1;
  colorCounter++;
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
  bestSimulation = null;
  worstSimulation = null;
  simulationLoaded = false;
  resetTimeLine();
  clearTrackMap();
  simulationInfoDefault();
});


const nextCarButton = document.querySelector("#nextCar");
nextCarButton.addEventListener("click", () =>{
  nextCar();
});

const prevCarButton = document.querySelector("#prevCar");
prevCarButton.addEventListener("click", () =>{
  prevCar();
});

const nextCameraButton = document.querySelector("#nextCamera");
nextCameraButton.addEventListener("click", () =>{
  nextCamera();
});


const playPauseButton = document.querySelector("#playPause");
playPauseButton.addEventListener("click", () => {
  if(worstSimulation){
    if(isAnimationPaused){
      resumeAnimations();
    }else{
      pauseAnimations();
    }
  }
});

const timeLine = document.querySelector("#timeLine");

timeLine.addEventListener('mouseenter', (e)=>{
  timeLineUpdateAvailable = false;
});
timeLine.addEventListener('mouseleave', (e)=>{
  timeLineUpdateAvailable = true;
});
timeLine.addEventListener("change", (e) =>{
  beginAnimations(timeLine.value);
  if(isAnimationPaused){
    setTimeout(() => {
      pauseAnimations();
    }, 1);
  }
});

function updateTimeLine(){
  if(!isAnimationPaused && timeLineUpdateAvailable && worstSimulation) timeLine.value = worstSimulation.time * 60;
}

function updateTimeLineValues(){
  timeLine.max = Math.trunc(worstSimulation.totalTime*worstSimulation.FRAME_RATE);
  timeLine.value = 0;
}

function resetTimeLine(){
  timeLine.max = 0;
  timeLine.value = 0;
}

function beginAnimations(startFrame){
  simulationsList.forEach(simulation => {
    simulation.startAnimation(startFrame/60);
  });
}

function pauseAnimations(){
  if(playPauseButton){
    playPauseButton.innerHTML = "<img src='./resources/playIcon.svg' alt='Play/Pause'/>";
    isAnimationPaused = true;
  }
  simulationsList.forEach(simulation => {
    simulation.pauseAnimation();
  });
}


function resumeAnimations(){
  if(playPauseButton){
    playPauseButton.innerHTML = "<img src='./resources/pauseIcon.svg' alt='Play/Pause'/>";
    isAnimationPaused = false;
  }
  simulationsList.forEach(simulation => {
    simulation.resumeAnimation();
  });
}


function resetAnimations(){
  simulationsList.forEach(simulation => {
    simulation.resetAnimation();
  });
}


function nextCar(){
  if(simulationsList.length != 0){
    scene.useRightHandedSystem = true;
    currentCar++;
    if(currentCar >= simulationsList.length) currentCar = 0;
    simulationsList[currentCar].switchToCamera(cameras[currentCamera]);
    if(scene.activeCamera == camera) scene.useRightHandedSystem = false;
  }
}

function prevCar(){
  if(simulationsList.length != 0){
    scene.useRightHandedSystem = true;
    currentCar--;
    if(currentCar < 0) currentCar = simulationsList.length-1;
    simulationsList[currentCar].switchToCamera(cameras[currentCamera]);
    if(scene.activeCamera == camera) scene.useRightHandedSystem = false;
  }
}

function nextCamera(){
  if(simulationsList.length){
    if(currentCamera > cameras.length-2){
      simulationsList.forEach(sim => {
        sim.carRenderBehind();
      });
      scene.useRightHandedSystem = false;
      scene.activeCamera = camera;
      currentCamera = -1;
    }else{
      simulationsList.forEach(sim => {
        sim.carRenderFront();
      });
      scene.useRightHandedSystem = true;
      currentCamera++;
      simulationsList[currentCar].switchToCamera(cameras[currentCamera]);
    }
  }
}