window.addEventListener('load', () => {
  let path = new Track();

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

  let trackMeshes = []; //its length 1, i dont know why tho

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
      if (trackMeshes.length !== 0) {
        trackMeshes.forEach(m => m.dispose());
      }
      trackMeshes = result.meshes.filter(m => m.isPickable);

      //export button
      const exportLineButton = document.querySelector('#exportLine');
      exportLineButton.addEventListener("click", () => {
        const json = path.exportJSON();
        const blob = new Blob(
          [json],
          { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "track_nodes.json";
        a.click();
        URL.revokeObjectURL(url);
      });

      //undo button
      const undoButton = document.querySelector('#undo');
      undoButton.addEventListener('click', () => {
        path.undo();
      });
    });
  });

  scene.onPointerObservable.add((pi) => { //pi is pointerInfo
    if (pi.type !== BABYLON.PointerEventTypes.POINTERDOWN) {
      return;
    }  

    const pick = scene.pick(scene.pointerX, scene.pointerY);
    if (!pick.hit || !pick.pickedPoint) {
      return;
    }  

    const node = new TrackNode(
      pick.pickedPoint.x, pick.pickedPoint.y, pick.pickedPoint.z
    );
    path.addPoint(node.x, node.y, node.z);
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key.toLowerCase() === "z") {
      path.undo();
    }
  });
});