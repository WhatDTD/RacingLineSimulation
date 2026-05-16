//you can find activateCarUi at the end of uiScript

function activateCarSetup(){
    content.innerHTML = carSetpHtml;

    //Car Setup Inputs

    //Mass
    const massMin = document.querySelector("#massMinIn");
    const massMax = document.querySelector("#massMaxIn");

    massMin.value = car.mass.min;
    massMax.value = car.mass.max;

    massMin.addEventListener("change", (e) => {
        car.mass.min = Number(massMin.value);
    });

    massMax.addEventListener("change", (e) => {
        car.mass.max = Number(massMax.value);
    });


    //Aero

    const ClMin = document.querySelector("#clMinIn");
    const ClMax = document.querySelector("#clMaxIn");

    ClMin.value = car.Cl.min;
    ClMax.value = car.Cl.max;

    ClMin.addEventListener("change", (e) => {
        car.Cl.min = Number(ClMin.value);
    });

    ClMax.addEventListener("change", (e) => {
        car.Cl.max = Number(ClMax.value);
    });



    const CdMin = document.querySelector("#cdMinIn");
    const CdMax = document.querySelector("#cdMaxIn");

    CdMin.value = car.Cd.min;
    CdMax.value = car.Cd.max;

    CdMin.addEventListener("change", (e) => {
        car.Cd.min = Number(CdMin.value);
    });

    CdMax.addEventListener("change", (e) => {
        car.Cd.max = Number(CdMax.value);
    });



    const areaMin = document.querySelector("#areaMinIn");
    const areaMax = document.querySelector("#areaMaxIn");

    areaMin.value = car.A.min;
    areaMax.value = car.A.max;

    areaMin.addEventListener("change", (e) => {
        car.A.min = Number(areaMin.value);
    });

    areaMax.addEventListener("change", (e) => {
        car.A.max = Number(areaMax.value);
    });




    const bindedAero = document.querySelector("#bindedAero");

    if(car.bindedAero) bindedAero.setAttribute("checked","true");

    bindedAero.addEventListener("change", (e) => {
        car.bindedAero = !car.bindedAero;

        if(car.bindedAero == false) bindedAero.setAttribute("checked","false");
    });




    //Power
    const powerMin = document.querySelector("#powerMinIn");
    const powerMax = document.querySelector("#powerMaxIn");

    powerMin.value = car.Power.min;
    powerMax.value = car.Power.max;

    powerMin.addEventListener("change", (e) => {
        car.Power.min = Number(powerMin.value);
    });

    powerMax.addEventListener("change", (e) => {
        car.Power.max = Number(powerMax.value);
    });


    //Braking Power
    const brakingPowerMin = document.querySelector("#brakingPowerMinIn");
    const brakingPowerMax = document.querySelector("#brakingPowerMaxIn");

    brakingPowerMin.value = car.brakingPower.min;
    brakingPowerMax.value = car.brakingPower.max;

    brakingPowerMin.addEventListener("change", (e) => {
        car.brakingPower.min = Number(brakingPowerMin.value);
    });

    brakingPowerMax.addEventListener("change", (e) => {
        car.brakingPower.max = Number(brakingPowerMax.value);
    });



    //Tyres Friction
    const frictionMinIn = document.querySelector("#FrCMinIn");
    const frictionMaxIn = document.querySelector("#FrCMaxIn");

    frictionMinIn.value = car.FrC.min;
    frictionMaxIn.value = car.FrC.max;

    frictionMinIn.addEventListener("change", (e) =>{
        car.FrC.min = Number(frictionMinIn.value);
    });

    frictionMaxIn.addEventListener("change", (e) =>{
        car.FrC.max = Number(frictionMaxIn.value);
    });

    //RPM
    const RPMidleIn = document.querySelector("#RPMidleIn");
    const RPMminIn = document.querySelector("#RPMminIn");
    const RPMshiftIn = document.querySelector("#RPMshiftIn");
    const RPMmaxIn = document.querySelector("#RPMmaxIn");
    const RPMvariationIn =document.querySelector("#RPMvariationIn");


    RPMidleIn.value = car.gearBox.RPM.idle;
    RPMminIn.value = car.gearBox.RPM.min;
    RPMshiftIn.value = car.gearBox.RPM.shift;
    RPMmaxIn.value = car.gearBox.RPM.max;
    RPMvariationIn.value = car.gearBox.RPM.variation;

    RPMidleIn.addEventListener("change", (e) =>{
        car.gearBox.RPM.idle = Number(RPMidleIn.value);
    });

    RPMminIn.addEventListener("change", (e) =>{
        car.gearBox.RPM.min = Number(RPMminIn.value);
    });

    RPMshiftIn.addEventListener("change", (e) =>{
        car.gearBox.RPM.shift = Number(RPMshiftIn.value);
    });

    RPMmaxIn.addEventListener("change", (e) =>{
        car.gearBox.RPM.max = Number(RPMmaxIn.value);
    });

    RPMvariationIn.addEventListener("change", (e) =>{
        car.gearBox.RPM.variation = Number(RPMvariationIn.value);
    });


    //Gears
    const numberOfGearsElement = document.querySelector("#nGearsIn");

    numberOfGears = car.gearBox.gears.length-1;

    numberOfGears = numberOfGears < 1 ? 1 : numberOfGears;

    numberOfGearsElement.value = numberOfGears;

    updateGears();

    numberOfGearsElement.addEventListener("change", (e) =>{
        if(numberOfGearsElement.value < 1){
            numberOfGearsElement.value = 1;
            numberOfGears = 1;
        }else{
            numberOfGears = Number(numberOfGearsElement.value);
        }

        if(car.gearBox.gears.length > numberOfGears) car.gearBox.gears = car.gearBox.gears.slice(0, numberOfGears+1);

            updateGears();
    });
    function updateGears(){

        let maxGearValue = car.gearBox.gears[car.gearBox.gears.length-1];

        //firstGear section
        let gearsHTML = `
            <span>1</span>
            <input class='input mr-3 gearIn' type='number' placeholder='Km/h' id='1gear'/>
            <progress class="progress is-link is-normal mt-2" id="1gearBar" value="${car.gearBox.gears[1]}" max="${maxGearValue}"></progress>
            <br>
            `;
            
        //all other gears section
        for(let i = 1; i < numberOfGears; i++){
            gearsHTML += `
            <span>${i+1}</span>
            <input class='input mr-3 gearIn' type='number' placeholder='Km/h' id='${i+1}gear'/>
            <progress class="progress is-link is-normal mt-2" id="${i+1}gearBar" value="${car.gearBox.gears[i+1]}" max="${maxGearValue}"></progress>
            <br>
            `;
        }

        //updating the HTML
        document.querySelector("#gears").innerHTML = gearsHTML;

        //updating eventListeners for every gear input
        for(let i = 0; i < numberOfGears; i++){
            let gear = document.getElementById((i+1)+"gear");

            gear.value = car.gearBox.gears[i+1];
            gear.addEventListener("change", (e) => {
                car.gearBox.gears[i+1] = Number(gear.value);
                let gearBar= document.getElementById((i+1)+"gearBar");

                maxGearValue = car.gearBox.gears[car.gearBox.gears.length-1];
                
                //updating gears progress bars to the new max value/changed input value
                for(let j = 0; j < numberOfGears; j++){
                    let gearBar= document.getElementById((j+1)+"gearBar");
                    gearBar.max = maxGearValue;
                    gearBar.value = document.getElementById((j+1)+"gear").value;
                }
            });
        }
    }
}



function activateAnimations(){

    //Animations
    content.innerHTML = animationsHtml;

    //Animations Inputs

    const wheelsRadiusIn = document.querySelector("#wheelsRadiusIn");
    const steeringRatioIn = document.querySelector("#steeringRatioIn");

    steeringRatioIn.value = car.steeringRatio;
    wheelsRadiusIn.value = car.AvrgWheelRadius;

    steeringRatioIn.addEventListener("change", (e) =>{
        car.steeringRatio = Number(steeringRatioIn.value);
    });
        
    wheelsRadiusIn.addEventListener("change", (e) =>{
        car.AvrgWheelRadius = Number(wheelsRadiusIn.value);
        radius = car.AvrgWheelRadius;
    });
    
    
    //sliders
    const steeringSlider = document.querySelector("#steeringIn");
    const steeringValue = document.querySelector("#steeringValue");
    
    
    steeringSlider.addEventListener("input", (e) =>{
        steeringValue.innerHTML = e.target.value+"°";
    
    if(meshLoaded){
        //console.log("Components for steering animation found");
    
        steerableWheel.forEach(wheel => {
            wheel.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, e.target.value * Math.PI/180);
        });
    
        steerables.forEach(steer =>{
            steer.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, e.target.value * Math.PI/180);
        });
    
        steeringWheel.forEach(steer =>{
            steer.rotation = new BABYLON.Vector3(0, 0, (e.target.value * Math.PI/180)*car.steeringRatio);
        });
    
            helmet.forEach(element =>{
                element.rotation = new BABYLON.Vector3(0, - e.target.value * Math.PI/180, 0);
            });
        }
    });
        
        
        
    const speedSlider = document.querySelector("#speedIn");
    const speedValue = document.querySelector("#speedValue");
    
    speedSlider.addEventListener("input", (e) =>{
        speedValue.innerHTML = e.target.value+" Km/h";
    
        if(meshLoaded && radius){
            //console.log("Components for rolling animation found");
            wheelsSpeedRotation = (e.target.value/3.6)/(radius*60);
        }
    });

}



function activateCameras(){
    //Cameras

    content.innerHTML = camerasHtml;

    let currentCamera = car.cameras.driverCam;


    //Camera Lock button
    const cameraLockButton = document.querySelector("#cameraLock");
    let cameraLockLabel = {element: document.querySelector("#cameraLockLabel"), state: 0}

    //inputs
    const XIn = document.querySelector("#XIn");
    const YIn = document.querySelector("#YIn");
    const ZIn = document.querySelector("#ZIn");
    const PitchIn = document.querySelector("#PitchIn");
    const YawIn = document.querySelector("#YawIn");
    const RollIn = document.querySelector("#RollIn");
    const fovIn = document.querySelector("#fovIn");
    const hideHelmetIn = {element: document.querySelector("#hideHelmet"), state:0};


    XIn.value = currentCamera.x;
    YIn.value = currentCamera.y;
    ZIn.value = currentCamera.z;
    PitchIn.value = currentCamera.pitch;
    YawIn.value = currentCamera.yaw;
    RollIn.value = currentCamera.roll;
    fovIn.value = currentCamera.fov;


    XIn.addEventListener("change", (e)=>{
        if(e.target.value) currentCamera.x = Number(e.target.value);

        if(cameraLockLabel.state == 1) freeCamera._position._x = currentCamera.x;
    });

    YIn.addEventListener("change", (e)=>{
        if(e.target.value) currentCamera.y = Number(e.target.value);
    
        if(cameraLockLabel.state == 1) freeCamera._position._y = currentCamera.y;
    });

    ZIn.addEventListener("change", (e)=>{
        if(e.target.value) currentCamera.z = Number(e.target.value);
    
        if(cameraLockLabel.state == 1) freeCamera._position._z = currentCamera.z;
    });

    PitchIn.addEventListener("change", (e)=>{
        if(e.target.value) currentCamera.pitch = Number(e.target.value);
    
        if(cameraLockLabel.state == 1) freeCamera.rotation._x = currentCamera.pitch;
    });

    YawIn.addEventListener("change", (e)=>{
        if(e.target.value) currentCamera.yaw = Number(e.target.value);
    
        if(cameraLockLabel.state == 1) freeCamera.rotation._y = currentCamera.yaw;
    });

    RollIn.addEventListener("change", (e)=>{
        if(e.target.value) currentCamera.roll = Number(e.target.value);
    
        if(cameraLockLabel.state == 1) freeCamera.rotation._z = currentCamera.roll;
    });

    fovIn.addEventListener("change", (e)=>{
        if(e.target.value) currentCamera.fov = Number(e.target.value);
    
        if(cameraLockLabel.state == 1) freeCamera.fov = currentCamera.fov;
    });

    hideHelmetIn.element.addEventListener("change", (e)=>{
        if(hideHelmetIn.state == 0){
            hideHelmet();
            hideHelmetIn.state = 1;
        }else{
            showHelmet();
            hideHelmetIn.state = 0;                    
        }
    });


    function reloadPositionInputs(){
        XIn.value = currentCamera.x;
        YIn.value = currentCamera.y;
        ZIn.value = currentCamera.z;
        PitchIn.value = currentCamera.pitch
        YawIn.value = currentCamera.yaw;
        RollIn.value = currentCamera.roll;
        fovIn.value = currentCamera.fov;
    }

    function loadCurrentCameraDataInFC(){
        console.log(freeCamera);
        freeCamera._position._x = currentCamera.x;
        freeCamera._position._y = currentCamera.y;
        freeCamera._position._z = currentCamera.z;
        freeCamera.rotation._x = currentCamera.pitch;
        freeCamera.rotation._y = currentCamera.yaw;
        freeCamera.rotation._z = currentCamera.roll;
        freeCamera.fov = currentCamera.fov;
    }





    //Camera Lock button event
        
    cameraLockButton.addEventListener("click", (e) =>{
        if(cameraLockLabel.state == 0){
            cameraLockLabel.element.textContent = "Unlock view ○";
            cameraLockLabel.state = 1;
            freeCamera.detachControl(canvas);
            fovChange = 0;
            loadCurrentCameraDataInFC();
        }else if( cameraLockLabel.state == 1){
            cameraLockLabel.element.textContent = "Lock view ●";
            cameraLockLabel.state = 0;
            freeCamera.attachControl(canvas, true);
            fovChange = 0.0005;
        }
    });
        
        
            
    //Camera set buttons
    const driverCamElement = document.querySelector("#DriverCam");
    const TcamElement = document.querySelector("#Tcam");
    const bumperCamElement = document.querySelector("#BumperCam");
    const OnboardCam1Element = document.querySelector("#OnboardCam1");
    const OnboardCam2Element = document.querySelector("#OnboardCam2");
    const OnboardCam3Element = document.querySelector("#OnboardCam3");

    //label
    const cameraLabel = document.querySelector("#cameraTitle");
        
        
    driverCamElement.addEventListener("click", (e)=>{
        currentCamera = car.cameras.driverCam;
        reloadPositionInputs();
        loadCurrentCameraDataInFC();

        cameraLabel.innerHTML = e.target.textContent;
    });

    TcamElement.addEventListener("click", (e)=>{
        currentCamera = car.cameras.Tcam;
        reloadPositionInputs();
        loadCurrentCameraDataInFC();
        
        cameraLabel.innerHTML = e.target.textContent;
    });

    bumperCamElement.addEventListener("click", (e)=>{
        currentCamera = car.cameras.bumperCam;
        reloadPositionInputs();
        loadCurrentCameraDataInFC();
    
        cameraLabel.innerHTML = e.target.textContent;
    
        showHelmet();
    });

    OnboardCam1Element.addEventListener("click", (e)=>{
        currentCamera = car.cameras.onboard1;
        reloadPositionInputs();
        loadCurrentCameraDataInFC();
    
        cameraLabel.innerHTML = e.target.textContent;
    
        showHelmet();
    });

    OnboardCam2Element.addEventListener("click", (e)=>{
        currentCamera = car.cameras.onboard2;
        reloadPositionInputs();
        loadCurrentCameraDataInFC();
    
        cameraLabel.innerHTML = e.target.textContent;
    
        showHelmet();
    });

    OnboardCam3Element.addEventListener("click", (e)=>{
        currentCamera = car.cameras.onboard3;
        reloadPositionInputs();
        loadCurrentCameraDataInFC();
    
        cameraLabel.innerHTML = e.target.textContent;
    
        showHelmet();
    });
        
        
    const setCurrentCamera = document.querySelector("#setCameraCurrent");
        
    setCurrentCamera.addEventListener("click", (e)=>{
        currentCamera.x = freeCamera._deferredPositionUpdate._x;
        currentCamera.y = freeCamera._deferredPositionUpdate._y;
        currentCamera.z = freeCamera._deferredPositionUpdate._z;
        currentCamera.pitch = freeCamera.rotation._x;
        currentCamera.yaw = freeCamera.rotation._y;
        currentCamera.roll = freeCamera.rotation._z;
        currentCamera.fov = freeCamera.fov;

        reloadPositionInputs();
    });

}

//inport
const selectCarDataFileBtn = document.querySelector("#selectCarDataFile");
const selectCarDataFileIn = document.querySelector("#selectCarDataFileIn");

selectCarDataFileIn.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }  
    const text = await file.text();   
    car = JSON.parse(text);

    loadMesh(car.meshURL);

    radius = car.AvrgWheelRadius;

    switch (activeTab){
        case "carUi":
            activateCarUi();
            break;
        case "carSetup":
            activateCarSetup();
            break;
        case "animations":
            activateAnimations();
            break;
        case "camera":
            activateCameras();
            break;
    }
});


//export
function exportCarJSON(){
    return JSON.stringify(car, null, 2);
}


const saveCar = document.querySelector('#saveCar');
saveCar.addEventListener("click", () => {
    const json = exportCarJSON();
    const blob = new Blob(
      [json],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = car.manufacture+"_"+car.model+".RLSdata";
    a.click();
    URL.revokeObjectURL(url);
});