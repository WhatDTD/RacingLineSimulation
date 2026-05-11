let path = new Track();

const canvas = document.querySelector("canvas");
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
scene.environmentTexture =
  BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/environment.env", scene);

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

    //import button
    const importLineInput = document.querySelector('#importLine');

    importLineInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }  
      const text = await file.text();   
      const data = JSON.parse(text);   

      path.nodes = [];

      data.forEach(p => {
        const node = new TrackNode(p.x, p.y, p.z, p.r, p.d);
        path.nodes.push(node);
        const len = path.nodes.length;
        //path.meshesNodes.push(path.nodes[len-1].render()); 
        if (len > 1) {
          const meshLines = BABYLON.MeshBuilder.CreateLines('line', {
            points: [
              path.nodes[len-1].toVector().add(new BABYLON.Vector3(0, 0.5, 0)),
              path.nodes[len-2].toVector().add(new BABYLON.Vector3(0, 0.5, 0))
            ],
            updatable: false
          });
          meshLines.color = new BABYLON.Color3(0, 0, 1)
          path.meshesLines.push(meshLines);
        }
      });
      const importCarModel = document.querySelector('#importCarModel');

      importCarModel.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) {
          return;
        }  
        const simulation = JSON.parse(await file.text());

        //run simulation button
        const runSimulationButton = document.querySelector('#runSimulation');
        runSimulationButton.addEventListener('click', () => {
          
          path.meshesLines.forEach(m => {
            if (m) {
              m.dispose();
            }
          });
          startSimulation(simulation, scene, engine);
        });
      });
    });
  });  
});  

engine.runRenderLoop(() => {
  scene.render();
});