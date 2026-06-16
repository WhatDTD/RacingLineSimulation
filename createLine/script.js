let path = new Track();

const canvas = document.querySelector("#canvas");
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
const hostname = window.location.hostname;
let folder = "";
if (hostname !== "localhost" && hostname !== "127.0.0.1") {
  folder = "/RacingLineSimulation";
} 
scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(`${folder}/assets/environment.env`, scene);

const defaultSpeed = 3;
let speed = defaultSpeed;

const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-320, 1262, 409), scene);

camera.inputs.clear();
camera.inputs.add({
  _keys: [],
  _onKeyDown: null,
  _onKeyUp: null,
  _onLostFocus: null,

  getClassName() { return "CustomCameraWasdInput"; },
  getSimpleName() { return "wasd"; },

  attachControl(noPreventDefault) {
    const _this = this;
    this._onKeyDown = (evt) => {
      if (!_this._keys.includes(evt.code)) _this._keys.push(evt.code);
    };
    this._onKeyUp = (evt) => {
      const i = _this._keys.indexOf(evt.code);
      if (i >= 0) _this._keys.splice(i, 1);
    };
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  },

  detachControl() {
    const engine = this.camera.getEngine();
    const element = engine.getInputElement();
    if (this._onKeyDown) {
      element.removeEventListener("keydown", this._onKeyDown);
      element.removeEventListener("keyup", this._onKeyUp);
      BABYLON.Tools.UnregisterTopRootEvents(canvas, [{ name: "blur", handler: this._onLostFocus }]);
      this._keys = [];
      this._onKeyDown = null;
      this._onKeyUp = null;
    }
  },

  checkInputs() {
    if (!this._keys.length) return;
    const camera = this.camera;
    const forward = camera.getDirection(BABYLON.Vector3.Forward());
    const right = camera.getDirection(BABYLON.Vector3.Right());
    if (this._keys.includes("ArrowUp")) camera.position.addInPlace(forward.scale(speed));
    if (this._keys.includes("ArrowDown")) camera.position.addInPlace(forward.scale(-speed));
    if (this._keys.includes("ArrowLeft")) camera.position.addInPlace(right.scale(-speed));
    if (this._keys.includes("ArrowRight")) camera.position.addInPlace(right.scale(speed));
  }
});

camera.inputs.add({
  _onPointerDown: null,
  _onPointerMove: null,
  _onPointerUp: null,
  _isPointerDown: false,
  _previousX: 0,
  _previousY: 0,
  sensibility: 0.003,

  getClassName() { return "CustomCameraMouseInput"; },
  getSimpleName() { return "mouse"; },

  attachControl(noPreventDefault) {
    const _this = this;

    this._onPointerDown = (evt) => {
      _this._isPointerDown = true;
      _this._previousX = evt.clientX;
      _this._previousY = evt.clientY;
    };

    this._onPointerMove = (evt) => {
      if (!_this._isPointerDown) return;
      const dx = evt.clientX - _this._previousX;
      const dy = evt.clientY - _this._previousY;
      _this.camera.rotation.y += dx * _this.sensibility;
      _this.camera.rotation.x += dy * _this.sensibility;
      _this._previousX = evt.clientX;
      _this._previousY = evt.clientY;
    };

    this._onPointerUp = () => {
      _this._isPointerDown = false;
    };

    window.addEventListener("pointerdown", this._onPointerDown);
    window.addEventListener("pointermove", this._onPointerMove);
    window.addEventListener("pointerup", this._onPointerUp);
  },

  detachControl() {
    window.removeEventListener("pointerdown", this._onPointerDown);
    window.removeEventListener("pointermove", this._onPointerMove);
    window.removeEventListener("pointerup", this._onPointerUp);
    this._isPointerDown = false;
  },

  checkInputs() {}
});
camera.attachControl(canvas, true);
camera.rotation = new BABYLON.Vector3(1.42, 1.5185, 0);


//Free Camera Keyboard inputs
//Camera Speed while holding Shift
window.addEventListener("keydown", (e) => {
  if (e.shiftKey) {
    speed = 1;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) {
    speed = defaultSpeed;
  }
});


//Camera Speed while holding Ctrl
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    speed = 15;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.ctrlKey) {
    speed = defaultSpeed;
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