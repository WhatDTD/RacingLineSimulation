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

const camera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-320, 1262, 409),
  scene
);
camera.attachControl(canvas, true);
camera.speed = 12;
camera.rotation = new BABYLON.Vector3(1.42, 1.5185, 0);

const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);

let colorList = [ {r: 0, g: 0, b: 0.6},
                  {r: 0.6, g: 0, b: 0},
                  {r: 0, g: 0.6, b: 0},
                  {r: 1, g: 0.8, b: 0},
                  {r: 0, g: 1, b: 1},
                  {r: 1, g: 0, b: 1}
]

let colorCounter = 0;

let trackMesh;
let simulationsList = [];


let trackMeshLoaded = false;
let simulationLoaded = false;


//import Track
const importTrackModel = document.querySelector('#importTrackModel');

importTrackModel.addEventListener("change", async (e) =>{
  const file = e.target.files[0];
  if (!file) return;


  const url = URL.createObjectURL(file);

  if(trackMesh) trackMesh.dispose();

  engine.displayLoadingUI();
  scene.useRightHandedSystem = false;
  BABYLON.SceneLoader.ImportMeshAsync("", "", file, scene)
    .then((result) => {
        engine.hideLoadingUI();
        scene.useRightHandedSystem = true;

        trackMeshLoaded = true;
        //checkRunAnimationBtn();

        trackMesh = result.meshes[0];
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
  colorCounter++;
});


const runSimulationButton = document.querySelector('#runSimulation');
runSimulationButton.addEventListener('click', () => {
    simulationsList.forEach(simulation => {
        simulation.startAnimation();
    });
});


engine.runRenderLoop(() => {
  scene.render();
});



function checkRunSimulationBtn(){
  if(trackMesh && simulationLoaded){
    runSimulationButton.removeAttribute("disabled");
  }else{
    runSimulationButton.setAttribute("disabled", true);
  }
}