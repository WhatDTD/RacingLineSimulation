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

let trackMeshes = [];
let lineMeshes = [];
let simulationsList = [];

const importTrackModel = document.querySelector('#importTrackModel');
importTrackModel.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const text = await file.text();

  engine.displayLoadingUI();
  BABYLON.SceneLoader.ImportMeshAsync("", "", file, scene)
  .then(result => {
    engine.hideLoadingUI(); 

    trackMeshes.forEach(m => {
      m.dispose();
    });

    trackMeshes = result.meshes.filter(m => m.isPickable);
      
    document.querySelector("#importSimulationBtn").removeAttribute("disabled");
    document.querySelector("#importSimulation").removeAttribute("disabled");

    const importSimulation = document.querySelector('#importSimulation');

    importSimulation.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }  
      const simulation = JSON.parse(await file.text());
      simulationsList.push(simulation);

      //clearLines();

      // Rebuild line meshes from simulation nodes
      const points = simulation.nodes.map(n => new BABYLON.Vector3(n.x, n.y, n.z));

      const lineMesh = BABYLON.MeshBuilder.CreateLines(
        "simulationPath",
        {
          points: points,
          updatable: false
        },
        scene
      );
      lineMesh.renderingGroupId = 1;
      lineMesh.color = new BABYLON.Color3(colorList[colorCounter].r, colorList[colorCounter].g, colorList[colorCounter].b); 
      lineMeshes.push(lineMesh);

      colorCounter++;
      if(colorCounter >= colorList.length) colorCounter = 0;

      document.querySelector("#runSimulation").removeAttribute("disabled");

      const runSimulationButton = document.querySelector('#runSimulation');
      runSimulationButton.addEventListener('click', () => {
        simulationsList.forEach(simelationEl => {
          startSimulation(simelationEl, scene, engine);
        });
        
      });
    });
  });  
});  

engine.runRenderLoop(() => {
  scene.render();
});


function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function clearLines(){
  lineMeshes.forEach(m => {
    if (m) {
      m.dispose();
    }
  });
  lineMeshes = []; // clear the array after disposing
}