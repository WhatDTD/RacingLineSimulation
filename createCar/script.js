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
scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/environment.env", scene);
BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "Showroom.glb", scene);

const defaultSpeed = 0.2;
let freeCamera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-5.6334244397982065, 4.714844991974612, 13.893594048703429),
  scene
);
freeCamera.attachControl(canvas, true);
freeCamera.speed = defaultSpeed;
freeCamera.rotation = new BABYLON.Vector3(0.297601403656662, 2.5303772749927615, 0);
freeCamera.minZ = 0.01;

const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);


//keys related controls
window.addEventListener("keydown", (e) => {
  if (e.shiftKey) {
    freeCamera.speed = 0.05
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) {
    freeCamera.speed = defaultSpeed;
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

//not my code og code src --> https://www.youtube.com/watch?v=0oE7SdXCmqE&t=76s   (why r indian people so smart?!!)
//maximum file size seems to be around 3 MB
//3D models textures dont work, only base colors (it's not a problem, it's a feature)
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
