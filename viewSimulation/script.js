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

let trackMeshes = [];
let lineMeshes = [];

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
    trackMeshes = result.meshes.filter(m => m.isPickable);
      
    const importSimulation = document.querySelector('#importSimulation');

    importSimulation.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }  
      const simulation = JSON.parse(await file.text());

      lineMeshes.forEach(m => {
          if (m) {
            m.dispose();
          }
        });
        lineMeshes = []; // clear the array after disposing

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
      lineMesh.color = new BABYLON.Color3(0, 0, 0.6); 
      lineMeshes.push(lineMesh);

      const runSimulationButton = document.querySelector('#runSimulation');
      runSimulationButton.addEventListener('click', () => {
        startSimulation(simulation, scene, engine);
      });
    });
  });  
});  

engine.runRenderLoop(() => {
  scene.render();
});