const simulationSetupHtml = `
<div id="carInfo">
    <img id='previewImage' src='' alt='Preview Image'/>
    <div id="infos">
        <div class="title is-5" id="carNameModelYear"></div>
        <div class="title is-3" id="category"><i></i></div>
        <div id="description"></div>
    </div>
</div>

<hr>

<div class="title is-4 mt-3">Car Setup</div>

<div class="title is-5 mt-3">Weights</div>

<!--Mass-->
<div>
    <div class="setupIn">
        <span>Mass (Kg): </span>
        <input class='input mr-3' type='number' placeholder='Mass' id='massInput'/>
    </div>

    <br>

    <div class='slidecontainer'>
        <input type='range' min='0' max='0' value='0' class='slider' id='massSlider'>
    </div>
</div>

<br><br><hr>



<div class="title is-5 mt-3">Aerodynamics</div>

<!--Cl-->
<div>
    <div class="setupIn">
        <span>Cl: </span>
        <input class='input mr-3' type='number' placeholder='Cl' id='ClInput'/>
    </div>

    <br>

    <div class='slidecontainer'>
        <input type='range' min='0' max='0' value='0' class='slider' id='ClSlider'>
    </div>
</div>

<br><br><br>


<!--Cd-->
<div>
    <div class="setupIn">
        <span>Cd: </span>
        <input class='input mr-3' type='number' placeholder='Cd' id='CdInput'/>
    </div>

    <br>

    <div class='slidecontainer'>
        <input type='range' min='0' max='0' value='0' class='slider' id='CdSlider'>
    </div>
</div>

<br><br><br>



<!--Frontal Area-->
<div>
    <div class="setupIn">
        <span>Frontal Area (m²): </span>
        <input class='input mr-3' type='number' placeholder='Area' id='areaInput'/>
    </div>

    <br>

    <div class='slidecontainer'>
        <input type='range' min='0' max='0' value='0' class='slider' id='areaSlider'>
    </div>
</div>

<br><br><hr>


<div class="title is-5 mt-3">PU</div>

<!--Power-->
<div>
    <div class="setupIn">
        <span>Power (Kw): </span>
        <input class='input mr-3' type='number' placeholder='Power' id='powerInput'/>
    </div>

    <br>

    <div class='slidecontainer'>
        <input type='range' min='0' max='0' value='0' class='slider' id='powerSlider'>
    </div>
</div>

<br><br><hr>



<div class="title is-5 mt-3">Brakes</div>

<!--Braking Power-->
<div>
    <div class="setupIn">
        <span>Braking Power (Kw): </span>
        <input class='input mr-3' type='number' placeholder='Br Power' id='brakingPowerInput'/>
    </div>

    <br>

    <div class='slidecontainer'>
        <input type='range' min='0' max='0' value='0' class='slider' id='brakingPowerSlider'>
    </div>
</div>

<br><br><hr>



<div class="title is-5 mt-3">Tyres</div>

<!--Tyres-->
<div>
    <div class="setupIn">
        <span>Friction Coefficient: </span>
        <input class='input mr-3' type='number' placeholder='Friction' id='FrCInput'/>
    </div>

    <br>

    <div class='slidecontainer'>
        <input type='range' min='0' max='0' value='0' class='slider' id='FrCSlider'>
    </div>
</div>

<br><br><hr>


<div class="title is-4 mt-3">Track & World Conditions</div>


<!--Air Density-->
<div class="setupIn">
    <span>Air Density (Kg/m³): </span>
    <input class='input mr-3' type='number' placeholder='Air Dens' id='airDensityInput' value="1.225"/>
</div>

<br>

<!--Gravity Acceleration-->
<div class="setupIn">
    <span>Gravity Acceleration (m/s²): </span>
    <input class='input mr-3' type='number' placeholder='g' id='gInput' value="9.81"/>
</div>

<br><br>


<!--Track Grip-->
<div>
    <div class="setupIn">
        <span>Track Grip %: </span>
        <input class='input mr-3' type='number' placeholder='Friction' id='trackGripInput' value="100"/>
    </div>

    <br>

    <div class='slidecontainer'>
        <input type='range' min='70' max='100' value='100' class='slider' id='trackGripSlider'>
    </div>
</div>

<br><br><hr>

<div class="title is-4 mt-3">Simulation Info</div>

<!--Simulation Start Speed-->
<div class="setupIn">
    <span>Simulation Start Speed (Km/h): </span>
    <input class='input mr-3' type='number' placeholder='Km/h' id='startSpeedInput' value="0"/>
</div>

<br><hr>

<div class="title is-4 mt-3">Simulation</div>

<div class="flex flex-spBtw">
    <div>Simulation Lap Time:</div>
    <div>Delta to Best Simulation:</div>
</div>


<div id="simulationTimeLine" class="flex flex-spBtw">
    <div class="title is-3 mt-3" id="simulationTime">0:00.000</div>
    <span class="title is-3 mt-3" id="deltaToBest">+0.000</span>
</div>
<br>

<div class="flex">
    <button class="inputButton uiBtn button is-dark mt-2" id="downloadSim" disabled>
      <span>Download Simulation</span>
    </button>

    <button class="inputButton buttonMargin uiBtn button is-primary mt-2" id="downloadCsv" disabled>
      <span>Download CSV</span>
    </button>
</div>

<br><br><hr>


<button class="uiBtn button is-warning mt-2" id="simBestRes" disabled>
  Return to Best Simulation Result
</button>

<br><br><br>
`;