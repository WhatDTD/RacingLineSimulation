const carUiHtml = `
<!--Car UI-->
<h2 class='title is-5'>Car Ui</h2>

<div id='selectImage'>
    <input id='selectImageInput' class='file-input' type='file' accept='image/png'/>
    <img id='previewImage' src='./resources/SelectImage.png' alt='Select Preview Image'/>
</div>


<!--manufacture-->
<div id='fieldsLines'>
    <div class='title is-5 mt-4'>Manufacture:</div><input class='input mt-2' type='text' placeholder='Manufacture' id='manufactureIn'/>
</div>

<!--model-->
<div id='fieldsLines'>
    <div class='title is-5 mt-4'>Model:</div><input class='input mt-2' type='text' placeholder='Model' id='modelIn'/>
</div>

<!--year-->
<div id='fieldsLines'>
    <div class='title is-5 mt-4'>Year:</div><input class='input mt-2' type='number' placeholder='Year' id='yearIn' min="1"/>
</div>

<!--category-->
<div id='fieldsLines'>
    <div class='title is-5 mt-4'>Category:</div><input class='input mt-2' type='text' placeholder='Category' id='categoryIn'/>
</div>

<div>
    <div class='title is-5 mt-4'>Description:</div>
    <textarea class='textarea' placeholder='Car Description' autocorrect='off' spellcheck='false' id='descriptionIn'></textarea>
</div>
`;



//------------------------------------------------------------------------------------------------------------------------------------//


const carSetpHtml = `
<h2 class='title is-5'>Car Setup</h2>


<!--Weights-->
<div class="title is-5">Weights</div>


<div class="title is-6 minMaxTitle">Mass (kg):</div>
<div class="minMaxIn">
    <span>min: </span>
    <input class='input mr-3' type='number' placeholder='min' id='massMinIn'/>

    <span class="ml-3">max: </span>
    <input class='input' type='number' placeholder='max' id='massMaxIn'/>
</div>


<!--Aerodynamic-->
<div class="title is-5 mt-6">Aerodynamic</div>

<div class="title is-6 minMaxTitle">Coefficient of Lift:</div>
<div class="minMaxIn">
    <span>min: </span>
    <input class='input mr-3' type='number' placeholder='min' id='clMinIn'/>

    <span class="ml-3">max: </span>
    <input class='input' type='number' placeholder='max' id='clMaxIn'/>
</div>


<div class="title is-6 minMaxTitle">Coefficient of Drag:</div>
<div class="minMaxIn">
    <span>min: </span>
    <input class='input mr-3' type='number' placeholder='min' id='cdMinIn'/>

    <span class="ml-3">max: </span>
    <input class='input' type='number' placeholder='max' id='cdMaxIn'/>
</div>


<div class="title is-6 minMaxTitle">Frontal Area (m²):</div>
<div class="minMaxIn">
    <span>min: </span>
    <input class='input mr-3' type='number' placeholder='min' id='areaMinIn'/>

    <span class="ml-3">max: </span>
    <input class='input' type='number' placeholder='max' id='areaMaxIn'/>
</div>

<input class="mt-5" type="checkbox" id="bindedAero"/><span class="ml-3">Binded Aero</span>
<div>(Not Raccomended for Cars that produce Lift)</div>


<div class="title is-5 mt-6">PU</div>

<div class="title is-6 minMaxTitle">Power (Kw):</div>
<div class="minMaxIn">
    <span>min: </span>
    <input class='input mr-3' type='number' placeholder='min' id='powerMinIn'/>

    <span class="ml-3">max: </span>
    <input class='input' type='number' placeholder='max' id='powerMaxIn'/>
</div>


<div class="title is-5 mt-6">Brakes</div>

<div class="title is-6 minMaxTitle">Braking Power (Kw):</div>
<div class="minMaxIn">
    <span>min: </span>
    <input class='input mr-3' type='number' placeholder='min' id='brakingPowerMinIn'/>

    <span class="ml-3">max: </span>
    <input class='input' type='number' placeholder='max' id='brakingPowerMaxIn'/>
</div>


<div class="title is-5 mt-6">Tyres</div>

<div class="title is-6 minMaxTitle">Tyres Friction Coefficient:</div>
<div class="minMaxIn">
    <span>min: </span>
    <input class='input mr-3' type='number' placeholder='min' id='FrCMinIn'/>

    <span class="ml-3">max: </span>
    <input class='input' type='number' placeholder='max' id='FrCMaxIn'/>
</div>


<!--GearBox-->
<div class="title is-5 mt-6">Gear Box</div>

<div class="title is-6 minMaxTitle">Engine RPM</div>
<div class="minMaxIn">
    <span>Idle: </span>
    <input class='input mr-3' type='number' placeholder='RPM' id='RPMidleIn'/>

    <span>Min: </span>
    <input class='input mr-3' type='number' placeholder='RPM' id='RPMminIn'/>

</div>

<div class="minMaxIn mt-5">
    
    <span>Shift: </span>
    <input class='input mr-3' type='number' placeholder='RPM' id='RPMshiftIn'/>

    <span>Max: </span>
    <input class='input mr-3' type='number' placeholder='RPM' id='RPMmaxIn'/>

</div>


<div class="minMaxIn mt-5">
    <span>Variation: </span>
    <input class='input mr-3' type='number' placeholder='RPM' id='RPMvariationIn'/>
</div>

<div class="title is-5 mt-6">Gears</div>

<span>Number of Gears: </span>
<input class='input mr-3 gearIn' type='number' placeholder='' id='nGearsIn'/>

<hr>

<div class="minMaxIn">
    <div class="title is-6">Gears End Speed (Km/h):</div>
</div>
<br>
<div id="gears"></div>
`;


//------------------------------------------------------------------------------------------------------------------------------------//


const camerasHtml = `
<!--Cameras-->
<h2 class='title is-5'>Cameras</h2>

<div id='camearsButtons'>

<div id='baseCameras'>
    <button class='button is-link is-light' id='DriverCam'>Driver Cam</button>
    <button class='button is-link is-light ml-2 mr-2' id='Tcam'>T Cam</button>
    <button class='button is-link is-light' id='BumperCam'>Bumper Cam</button>
</div>


<div id='onboards'>
    <button class='button is-link is-light' id='OnboardCam1'>Onboard 1</button>
    <button class='button is-link is-light ml-2 mr-2' id='OnboardCam2'>Onboard 2</button>
    <button class='button is-link is-light' id='OnboardCam3'>Onboard 3</button>
</div>

<div class='title is-5' id='cameraTitle'>Driver Cam</div>

    <div id='PositionInput'>
        <div id='PositionsFieldsLines'>
            <div class='title is-5 mt-4' id='Xfield'>X:</div><input class='input' type='number' placeholder='x position' id='XIn'/>
            <div class='title is-5 mt-4' id='Yfield'>Z:</div><input class='input' type='number' placeholder='y position' id='YIn'/>
            <div class='title is-5 mt-4' id='Zfield'>Y:</div><input class='input' type='number' placeholder='z position' id='ZIn'/>
        </div>
    
        <div class='mt-4' id='PositionsFieldsLines'>
            <div class='title is-5 mt-4' id='PitchField'>P:</div><input class='input' type='number' placeholder='pitch' id='PitchIn'/>
            <div class='title is-5 mt-4' id='YawField'>Y:</div><input class='input' type='number' placeholder='yaw' id='YawIn'/>
            <div class='title is-5 mt-4' id='RollField'>R:</div><input class='input' type='number' placeholder='roll' id='RollIn'/>
        </div>
    
        <div class='mt-4' id='fieldsLines'>
            <div class='title is-5 mt-4' id='fovField'>FOV:</div><input class='input' type='number' placeholder='0' id='fovIn'/>
        </div>
    </div>

    <input class="mt-5" type="checkbox" id="hideHelmet"/><span class="ml-3 title is-6">Hide Helmet</span>
    <br><br><br>

    <button class='button is-info is-inverted is-outlined mt-2 uiBtn' id='cameraLock'>
        <span id='cameraLockLabel'>Lock view ●</span>
    </button>
    
    <button class='button is-link mt-2 uiBtn' id='setCameraCurrent'>
        <span>Set Camera as Current</span>
    </button>

</div>
`;


//------------------------------------------------------------------------------------------------------------------------------------//


const animationsHtml = `
<!--Animations-->
<h2 class='title is-5'>Animations</h2>

<div id='fieldsLines'>
    <div class='title is-5 mt-4'>Steering Ratio:</div><input class='input mt-2' type='number' placeholder='1 : ?' id='steeringRatioIn'/>
</div>

<div id='steeringLabel' class='title is-5 mt-4'>Steering Angle:</div>
<div id='steeringValue' class='mt-4'>0°</div>

<div class='slidecontainer'>
    <input type='range' min='-45' max='45' value='0' class='slider' id='steeringIn'>
</div>

<br><br><br>

<div id='fieldsLines'>
    <div class='title is-5 mt-4'>Wheels Radius: (m)</div><input class='input mt-2' type='number' placeholder='Radius in m' id='wheelsRadiusIn'/>
</div>

<div id='speedLabel' class='title is-5 mt-4'>Speed:</div>
<div id='speedValue' class='mt-4'>0 Km/h</div>

<div class='slidecontainer'>
    <input type='range' min='0' max='400' value='0' class='slider' id='speedIn'>
</div>
`;