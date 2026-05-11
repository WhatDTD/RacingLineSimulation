const canvas = document.querySelector('canvas');
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/environment.env", scene);

const defaultSpeed = 3;
let fovChange = 0.0005;

let freeCamera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(-5.6334244397982065, 4.714844991974612, 13.893594048703429),
  scene
);
freeCamera.attachControl(canvas, true);
freeCamera.speed = defaultSpeed;


const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);


//mouse position stuff

window.addEventListener('mousemove', mouseMoveHandler);

let relativeX;
let relativeY;

let viewPortWidth = document.documentElement.clientWidth;
let viewPortHeight = document.documentElement.clientHeight;

let xBounds = {min: (viewPortWidth/100)*25, max: viewPortWidth};
let yBounds = {min: 0, max: viewPortHeight};

function checkMouse(){
    if(relativeX >= xBounds.min && relativeX <= xBounds.max 
    && relativeY >= yBounds.min && relativeY <= yBounds.max){
        return true;
    }

    return false;
}


function mouseMoveHandler(e){
    relativeX = e.clientX;
    relativeY = e.clientY;
}



//keys related controls

//Camera Speed while holding Shift
window.addEventListener("keydown", (e) => {
  if (e.shiftKey) {
    freeCamera.speed = 1;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.shiftKey) {
    freeCamera.speed = defaultSpeed;
  }
});


//Camera Speed while holding Ctrl
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    freeCamera.speed = 10;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.ctrlKey) {
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

//Important things
let car;
let simCar = {};
let carName;
let carLoaded = false;

let trackMesh;
let trackName;
let trackMeshLoaded = false;

let line;
let lineMesh;
let lineLoaded = false;

let bestSimulation = {totalTime: Infinity};
let lastBestSimulation = {totalTime: Infinity};
let simulatedLap;
let updateSimulationTime;


//data
let airDensity = 1.225;
let g = 9.81;
let trackGrip = 1;
let simulationStartVelocity = 0;


//menu Toggle
const menuToggle = {element: document.querySelector('#menuToggle'), state: 0};

const moveRightAnim = [
    {transform:"translatex(0vw)"},
    {transform:"translatex(-23.7vw)"}
];

const moveLeftAnim = [
    {transform:"translatex(-23.7vw)"},
    {transform:"translatex(0vw)"}
];

const moveTiming = { 
  duration: 155,
  iterations: 1,
};

//menuToggle button
menuToggle.element.addEventListener("click", (event) => {
    if(menuToggle.state == 0){
       ui.animate(moveRightAnim, moveTiming);
       ui.style.transform = "translatex(-23.7vw)";
       menuToggle.element.textContent = '>';
       menuToggle.state = 1;
       xBounds.min = 0;
    }else{
        ui.animate(moveLeftAnim, moveTiming);
        ui.style.transform = "translatex(0vw)";
        menuToggle.element.textContent = '<';
        menuToggle.state = 0;
        xBounds.min = (viewPortWidth/100)*25;
    }
});

//Important HTML elements

const content = document.querySelector("#content");
let simBestResBtn;

let downloadSimulationBtn;
let downloadCsvBtn;


//inputs

//Select Car
const carInput = document.querySelector("#selectCarIn");

carInput.addEventListener("change",async (e) =>{
  const file = e.target.files[0];
  if (!file) return;

  carName = file.name.replace(".RLSdata","");

  const text = await file.text();   
  car = JSON.parse(text);
  carLoaded = true;

  bestSimulation = {totalTime: Infinity};
  lastBestSimulation = {totalTime: Infinity};
  simulatedLap = null;

  simCar.manufacture = car.manufacture;
  simCar.model = car.model;
  simCar.mass = car.mass.min;
  simCar.year = car.year;
  simCar.category = car.category;
  simCar.description = car.description;
  simCar.Cl = car.Cl.max;
  simCar.Cd = car.Cd.min;
  simCar.A = car.A.min;
  simCar.steeringRatio = car.steeringRatio;
  simCar.Power = car.Power.min;
  simCar.brakingPower = car.brakingPower.min;
  simCar.AvrgWheelRadius = car.AvrgWheelRadius;
  simCar.FrC = car.FrC.min;
  simCar.gearBox = car.gearBox;

  simCar.meshURL = car.meshURL;

  checkSimulationBtn();
  activateSimSetup();

  allowDownloads(false);
});


//Select Track
const trackInput = document.querySelector("#selectTrack");

trackInput.addEventListener("change", async (e) =>{
  const file = e.target.files[0];
  if (!file) return;

  trackName = file.name.replace(".glb","");

  const url = URL.createObjectURL(file);

  if(trackMesh) trackMesh.dispose();
  BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, ".glb")
    .then((result) => {
      URL.revokeObjectURL(url);

      trackMeshLoaded = true;
      checkSimulationBtn();

      trackMesh = result.meshes[0];
    });
});


//Select Line
const lineInput = document.querySelector("#selectLineIn");

lineInput.addEventListener("change", async (e) =>{
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();   
  line = JSON.parse(text);

  bestSimulation = {totalTime: Infinity};
  lastBestSimulation = {totalTime: Infinity};
  simulatedLap = null;

  lineLoaded = true;
  checkSimulationBtn();
  allowDownloads(false);

  if(lineMesh) lineMesh.dispose();

  lineMesh = BABYLON.MeshBuilder.CreateLines("line", { points: line });
  lineMesh.color = new BABYLON.Color3(0,0,1);

  updateSimulationTime(0);
  simBestResBtn.setAttribute("disabled", true);
});

//Run Simulation Button
const simulationBtn = document.querySelector("#RunSimulation");
const simulationBtnSpan = document.querySelector("#RunSimulationSpan");

simulationBtn.addEventListener("click", (e) =>{
  lastBestSimulation = deepCopy(bestSimulation);
  simulatedLap = calculateLap(simCar, line, simulationStartVelocity, airDensity, trackGrip);
  if(simulatedLap.totalTime <= bestSimulation.totalTime) bestSimulation = deepCopy(simulatedLap);
  updateSimulationTime(simulatedLap.totalTime);

  if(simBestResBtn.hasAttribute("disabled")) simBestResBtn.removeAttribute("disabled");

  allowDownloads(true);
});

function checkSimulationBtn(){
  if(carLoaded && trackMeshLoaded && lineLoaded){
    if(simulationBtn.hasAttribute("disabled")) simulationBtn.removeAttribute("disabled");
    simulationBtnSpan.title = "Click the button to see the result of the Simulation";
  }
}


function deepCopy(obj){
  return JSON.parse(JSON.stringify(obj));
}



//-----------------------------------Simulation Setup Page-------------------------------------//

//Activate Simulation Setup HTML
function activateSimSetup(){
  fetch('/simulationSetup.html')
  .then(response => response.text())
  .then(
    (data) => {
      content.innerHTML = data;

      //Preview Image
      const previewImage = document.querySelector("#previewImage");
      previewImage.setAttribute("src", car.previewImageURL);

      //Car Infos
      const carNameModelYear = document.querySelector("#carNameModelYear");
      carNameModelYear.innerHTML = `${car.manufacture} ${car.model} '<i>${car.year}</i>`

      const category = document.querySelector("#category");
      category.innerHTML = car.category;

      const description = document.querySelector("#description");
      description.innerHTML = car.description;



      //Car Setup

      function updateInput(input, min, max, value){
        if(value < min){ 
          input.value = min;
        }else if(value > max){
          input.value = max;
        }else{
          input.value = value;
        }
      }


      function updateSlider(slider, sliderPrecision, min, max, value){
        slider.value = value*sliderPrecision;
        slider.min = min*sliderPrecision;
        slider.max = max*sliderPrecision;
      }

      function updateInputAndSlider(input, slider, sliderPrecision, min, max, value){
        updateInput(input, min, max, value);
        updateSlider(slider, sliderPrecision, min, max, value);
      }
      

      //Weights

      //Mass
      const massInput = document.querySelector("#massInput");
      const massSlider = document.querySelector("#massSlider");

      massInput.value = simCar.mass;
      massSlider.value = car.mass.min;
      massSlider.min = car.mass.min;
      massSlider.max = car.mass.max;

      massInput.addEventListener("change", (e) =>{
        updateInputAndSlider(massInput, massSlider, 1, car.mass.min, car.mass.max, Number(massInput.value));
        simCar.mass = Number(massInput.value);
      });

      massSlider.addEventListener("change", (e) =>{
        updateInputAndSlider(massInput, massSlider, 1, car.mass.min, car.mass.max, Number(massSlider.value));
        simCar.mass = Number(massInput.value);
      });


      //Aerodynamics

      //Cl
      const ClInput = document.querySelector("#ClInput");
      const ClSlider = document.querySelector("#ClSlider");
      const ClRange = Math.abs(car.Cl.max - car.Cl.min);

      const ClSliderPrecision = 100;


      ClInput.value = simCar.Cl;
      ClSlider.value = -car.Cl.max * ClSliderPrecision;
      ClSlider.max = -car.Cl.min * ClSliderPrecision;
      ClSlider.min = -car.Cl.max * ClSliderPrecision;

      ClInput.addEventListener("change", (e) =>{
        updateInput(ClInput, car.Cl.min, car.Cl.max, Number(ClInput.value));
        updateSlider(ClSlider, ClSliderPrecision, -car.Cl.max, -car.Cl.min, Number(-ClInput.value));
        if(car.bindedAero) updateBindedAero((-ClInput.value + car.Cl.max)/ClRange);
        simCar.Cl = Number(ClInput.value);
      });

      ClSlider.addEventListener("change", (e) =>{
        updateInput(ClInput, car.Cl.min, car.Cl.max, Number(-ClSlider.value)/ClSliderPrecision);
        if(car.bindedAero) updateBindedAero((-ClInput.value + car.Cl.max)/ClRange);
        simCar.Cl = Number(ClInput.value);
      });


      function updateClChange(change){
        updateInput(ClInput, car.Cl.min, car.Cl.max, +car.Cl.max - change*ClRange);
        if(car.bindedAero) updateSlider(ClSlider, ClSliderPrecision, -car.Cl.max, -car.Cl.min, -car.Cl.max + change*ClRange);
        simCar.Cl = Number(ClInput.value);
      }




      //Cd
      const CdInput = document.querySelector("#CdInput");
      const CdSlider = document.querySelector("#CdSlider");
      const CdRange = Math.abs(car.Cd.max - car.Cd.min);

      const CdSliderPrecision = 100;

      CdInput.value = simCar.Cd;
      CdSlider.value = car.Cd.min * CdSliderPrecision;
      CdSlider.min = car.Cd.min * CdSliderPrecision;
      CdSlider.max = car.Cd.max * CdSliderPrecision;

      CdInput.addEventListener("change", (e) =>{
        updateInputAndSlider(CdInput, CdSlider, CdSliderPrecision, car.Cd.min, car.Cd.max, Number(CdInput.value));
        if(car.bindedAero) updateBindedAero((Number(CdInput.value) - car.Cd.min)/CdRange);
        simCar.Cd = Number(CdInput.value);
      });

      CdSlider.addEventListener("change", (e) =>{
        updateInputAndSlider(CdInput, CdSlider, CdSliderPrecision, car.Cd.min, car.Cd.max, Number(CdSlider.value)/CdSliderPrecision);
        if(car.bindedAero) updateBindedAero((Number(CdInput.value) - car.Cd.min)/CdRange);
        simCar.Cd = Number(CdInput.value);
      });


      function updateCdChange(change){
        updateInputAndSlider(CdInput, CdSlider, CdSliderPrecision, car.Cd.min, car.Cd.max, car.Cd.min + change*CdRange);
        simCar.Cd = Number(CdInput.value);
      }




      //Frontal Area
      const areaInput = document.querySelector("#areaInput");
      const areaSlider = document.querySelector("#areaSlider");
      const areaRange = Math.abs(car.A.max - car.A.min);

      const areaSliderPrecision = 100;

      areaInput.value = simCar.A;
      areaSlider.value = car.A.min * areaSliderPrecision;
      areaSlider.min = car.A.min * areaSliderPrecision;
      areaSlider.max = car.A.max * areaSliderPrecision;

      areaInput.addEventListener("change", (e) =>{
        updateInputAndSlider(areaInput, areaSlider, areaSliderPrecision, car.A.min, car.A.max, Number(areaInput.value));
        if(car.bindedAero) updateBindedAero((Number(areaInput.value) - car.A.min)/areaRange);
        simCar.A = Number(areaInput.value);
      });

      areaSlider.addEventListener("change", (e) =>{
        updateInputAndSlider(areaInput, areaSlider, areaSliderPrecision, car.A.min, car.A.max, Number(areaSlider.value)/areaSliderPrecision);
        if(car.bindedAero) updateBindedAero((Number(areaInput.value) - car.A.min)/areaRange);
        simCar.A = Number(areaInput.value);
      });


      function updateAreaChange(change){
        updateInputAndSlider(areaInput, areaSlider, areaSliderPrecision, car.A.min, car.A.max, car.A.min + change*areaRange);
        simCar.A = Number(areaInput.value);
      }



      //Update all binded Aero
      function updateBindedAero(change){
        updateClChange(change);
        updateCdChange(change);
        updateAreaChange(change);
      }



      //PU

      //Power

      const powerInput = document.querySelector("#powerInput");
      const powerSlider = document.querySelector("#powerSlider");

      powerInput.value = simCar.Power;
      powerSlider.value = car.Power.min;
      powerSlider.min = car.Power.min;
      powerSlider.max = car.Power.max;

      powerInput.addEventListener("change", (e) =>{
        updateInputAndSlider(powerInput, powerSlider, 1, car.Power.min, car.Power.max, Number(powerInput.value));
        simCar.Power = Number(powerInput.value);
      });

      powerSlider.addEventListener("change", (e) =>{
        updateInputAndSlider(powerInput, powerSlider, 1, car.Power.min, car.Power.max, Number(powerSlider.value));
        simCar.Power = Number(powerInput.value);
      });



      //Brakes

      //Braking Power

      const brakingPowerInput = document.querySelector("#brakingPowerInput");
      const brakingPowerSlider = document.querySelector("#brakingPowerSlider");

      brakingPowerInput.value = simCar.brakingPower;
      brakingPowerSlider.value = car.brakingPower.min;
      brakingPowerSlider.min = car.brakingPower.min;
      brakingPowerSlider.max = car.brakingPower.max;

      brakingPowerInput.addEventListener("change", (e) =>{
        updateInputAndSlider(brakingPowerInput, brakingPowerSlider, 1, car.brakingPower.min, car.brakingPower.max, Number(brakingPowerInput.value));
        simCar.brakingPower = Number(brakingPowerInput.value);
      });

      brakingPowerSlider.addEventListener("change", (e) =>{
        updateInputAndSlider(brakingPowerInput, brakingPowerSlider, 1, car.brakingPower.min, car.brakingPower.max, Number(brakingPowerSlider.value));
        simCar.brakingPower = Number(brakingPowerInput.value);
      });




      //Tyres

      //Friction Coefficient

      const FrCInput = document.querySelector("#FrCInput");
      const FrCSlider = document.querySelector("#FrCSlider");

      const FrCSliderPrecision = 100;

      FrCInput.value = simCar.FrC;
      FrCSlider.value = car.FrC.min * FrCSliderPrecision;
      FrCSlider.min = car.FrC.min * FrCSliderPrecision;
      FrCSlider.max = car.FrC.max * FrCSliderPrecision;

      FrCInput.addEventListener("change", (e) =>{
        updateInputAndSlider(FrCInput, FrCSlider, FrCSliderPrecision, car.FrC.min, car.FrC.max, Number(FrCInput.value));
        simCar.FrC = Number(FrCInput.value);
      });

      FrCSlider.addEventListener("change", (e) =>{
        updateInputAndSlider(FrCInput, FrCSlider, FrCSliderPrecision, car.FrC.min, car.FrC.max, Number(FrCSlider.value)/FrCSliderPrecision);
        simCar.FrC = Number(FrCInput.value);
      });




      //Track & World Conditions

      //Air Density

      const airDensityInput = document.querySelector("#airDensityInput");

      airDensityInput.value = airDensity;

      airDensityInput.addEventListener("change", (e) =>{
        if(!Number(airDensityInput.value) > 0) airDensityInput.value = airDensity;
        airDensity = Number(airDensityInput.value);
      });



      //Gravity Acceleration

      const gInput = document.querySelector("#gInput");

      gInput.value = g;

      gInput.addEventListener("change", (e) =>{
        if(!Number(gInput.value) > 0) gInput.value = g;
        g = Number(gInput.value);
      });




      //Track Grip

      const trackGripInput = document.querySelector("#trackGripInput");
      const trackGripSlider = document.querySelector("#trackGripSlider");

      trackGripInput.value = trackGrip*100;

      const trackGripSliderPrecision = 1;

      trackGripInput.addEventListener("change", (e) =>{
        updateInputAndSlider(trackGripInput, trackGripSlider, trackGripSliderPrecision, trackGripSlider.min, trackGripSlider.max, Number(trackGripInput.value));
        trackGrip = Number(trackGripInput.value)/100;
      });

      trackGripSlider.addEventListener("change", (e) =>{
        updateInputAndSlider(trackGripInput, trackGripSlider, trackGripSliderPrecision, trackGripSlider.min, trackGripSlider.max, Number(trackGripSlider.value)/trackGripSliderPrecision);
        trackGrip = Number(trackGripInput.value)/100;
      });




      //Simulation Info

      //Simulation Start Speed

      const startSpeedInput = document.querySelector("#startSpeedInput");

      startSpeedInput.value = simulationStartVelocity;

      startSpeedInput.addEventListener("change", (e) =>{
        if(!Number(startSpeedInput.value) > 0) startSpeedInput.value = simulationStartVelocity;
        simulationStartVelocity = Number(startSpeedInput.value);
      });




      //-----------------------------------------------------------------//

      //Lap Time

      const simulationTime = document.querySelector("#simulationTime");
      const deltaToBest = document.querySelector("#deltaToBest");


      updateSimulationTime = function updateTime(time){
        simulationTime.innerHTML = secondsToTimeString(time, 3);

        let comparationTime = time < lastBestSimulation.totalTime ? time - lastBestSimulation.totalTime : time - bestSimulation.totalTime;
                
        let value = Math.trunc(comparationTime*1000)/1000;

        if(value == -Infinity || value == Infinity) value = 0;

        deltaToBest.innerHTML = (value >= 0 ? "+" : "")+value.toFixed(3);

        if(value == 0){
          deltaToBest.style.color = "#ebecf0";
        }else if(value < 0){
          deltaToBest.style.color = "#16c419";
        }else{
          deltaToBest.style.color = "#d11104";
        }
      }


      function secondsToTimeString(time, decimals){
        let str;
        let m = Math.trunc(time/60);

        str = m +":"

        let s = Math.trunc((time/60 - m)*60);

        let mill = Math.trunc((time - Math.trunc(time))*(10**decimals));

        if(s < 10) str += "0";

        mill = String(mill).padEnd(3, "0");

        return str+s+"."+mill;
      }



      //Downloads
      assignListenersToDownloadBtns();


      //Return to Best Simulation Setup

      function updateSimSetup(){
        updateInputAndSlider(massInput, massSlider, 1, car.mass.min, car.mass.max, simCar.mass);

        updateInput(ClInput, car.Cl.min, car.Cl.max, simCar.Cl);
        updateSlider(ClSlider, ClSliderPrecision, -car.Cl.max, -car.Cl.min, -simCar.Cl);

        updateInputAndSlider(CdInput, CdSlider, CdSliderPrecision, car.Cd.min, car.Cd.max, simCar.Cd);

        updateInputAndSlider(areaInput, areaSlider, areaSliderPrecision, car.A.min, car.A.max, simCar.A);

        updateInputAndSlider(powerInput, powerSlider, 1, car.Power.min, car.Power.max, simCar.Power);

        updateInputAndSlider(brakingPowerInput, brakingPowerSlider, 1, car.brakingPower.min, car.brakingPower.max, simCar.brakingPower);

        updateInputAndSlider(FrCInput, FrCSlider, FrCSliderPrecision, car.FrC.min, car.FrC.max, simCar.FrC);

        airDensityInput.value = airDensity

        gInput.value = g;

        trackGripInput.value = trackGrip*100;
        trackGripSlider.value = trackGrip*100;

        startSpeedInput.value = simulationStartVelocity;
      }

      simBestResBtn = document.querySelector("#simBestRes");

      simBestRes.addEventListener("click", (e) =>{
        simCar = deepCopy(bestSimulation.car);
        airDensity = deepCopy(bestSimulation.airDensity);
        trackGrip = deepCopy(bestSimulation.trackGrip);
        simulationStartVelocity = deepCopy(bestSimulation.simulationStartVelocity);
        updateSimSetup();

        //console.log(bestSimulation, lastBestSimulation,simulatedLap)

        lastBestSimulation = deepCopy(bestSimulation);
        updateSimulationTime(bestSimulation.totalTime);
        simulatedLap = deepCopy(bestSimulation);

        simBestResBtn.setAttribute("disabled",true);
      });



    });
}

//--------------------------------------------------------------------------------------------//


//Render Loop
engine.runRenderLoop(() => {
  scene.render();
});