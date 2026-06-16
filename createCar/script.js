const canvas = document.querySelector('canvas');
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
const modelInput = document.querySelector('#selectCarModelIn');

//meshes
let meshLoaded = false;

let carMesh;
let steerableWheel = [];
let steerables = [];
let rearWheels = [];
let steeringWheel = [];
let helmet = [];
let radius;

let wheelsSpeedRotation;
let fovChange = 0.0005;

scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
const hostname = window.location.hostname;
let folder = "";
if (hostname !== "localhost" && hostname !== "127.0.0.1") {
  folder = "/RacingLineSimulation";
} 
scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(`${folder}/assets/environment.env`, scene);
BABYLON.SceneLoader.ImportMeshAsync("", "./resources/", "Showroom.glb", scene);

//--- Free Camera ---
const defaultSpeed = 0.2;
let speed = defaultSpeed;

let freeCamera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-5.6334244397982065, 4.714844991974612, 13.893594048703429),
  scene
);
freeCamera.inputs.clear();
freeCamera.inputs.add({
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

freeCamera.inputs.add({
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
freeCamera.attachControl(canvas, true);
freeCamera.speed = defaultSpeed;
freeCamera.rotation = new BABYLON.Vector3(0.297601403656662, 2.5303772749927615, 0);
freeCamera.minZ = 0.01;

const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);


//keys related controls
window.addEventListener("keydown", (e) => {
  if (e.shiftKey) {
    speed = 0.05
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) {
    speed = defaultSpeed;
  }
});


window.addEventListener("wheel", (e)=>{
  if(checkMouse()){
    freeCamera.fov += e.deltaY * fovChange;
    if(freeCamera.fov < 0.08){
      freeCamera.fov = 0.08;
    }
  
      if(freeCamera.fov > 2.9){
      freeCamera.fov = 2.9;
    }
  }
});

//camera fov reset: Shift+f
window.addEventListener("keydown", (e)=>{
  if(e.key === "F") freeCamera.fov = 0.8;
});


//3D model loader
modelInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  const url = URL.createObjectURL(file);

  toBase64(file).then(res =>{
    car.meshURL = res;
    loadMesh(res);
  });  
});

function loadMesh(url){
  if(carMesh) carMesh.dispose(), steerableWheel = [], steerables = [], rearWheels = [], helmet = [];
  BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, ".glb")
    .then((result) => {
      URL.revokeObjectURL(url);

      meshLoaded = true;
      carMesh = result.meshes[0];
      scene.meshes.forEach(mesh => {
        //console.log(mesh.name);

        if(mesh.name.includes("WHEEL_STEERABLE")){  //adds rolling and steering animation
          steerableWheel.push(mesh);

        }else if(mesh.name.includes("STEERABLE")){  //adds only steering animation
          steerables.push(mesh);

        }else if(mesh.name.includes("STEERING_WHEEL")){   //adds steering animation with steering ratio multiplier
          steeringWheel.push(mesh);

        }else if(mesh.name.includes("WHEEL_REAR")){    //only rolling animation
          rearWheels.push(mesh);
        }else if(mesh.name.includes("DRIVER_HELMET")){
          helmet.push(mesh);
        }
      });
    });
}


function showHelmet(){
  helmet.forEach(mesh => {
      mesh.isVisible = true;
  });
}

function hideHelmet(){
  helmet.forEach(mesh => {
      mesh.isVisible = false;
  });
}

//not my code og code src --> https://www.youtube.com/watch?v=0oE7SdXCmqE&t=76s
//maximum file size seems to be around 3 MB
//3D models textures dont work, only base colors
const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
})


engine.runRenderLoop(() => {
  scene.render();
  if(meshLoaded){
    if(wheelsSpeedRotation){

      steerableWheel.forEach(wheel => {
        wheel.addRotation(0, wheelsSpeedRotation, 0);
      });

      rearWheels.forEach(wheel =>{
        wheel.addRotation(0, wheelsSpeedRotation, 0);
      });
    }
  }
  //console.log("rot: "+freeCamera.rotation+"  Pos:"+freeCamera._deferredPositionUpdate+ "Fov: "+freeCamera.fov);
});
