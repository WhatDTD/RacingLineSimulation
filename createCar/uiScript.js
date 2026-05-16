window.addEventListener('load', () => {
    //Ui related tags ids
    const ui = document.querySelector('#ui');
    const menuToggle = {element: document.querySelector('#menuToggle'), state: 0};
    const tabs = ui.querySelector('#tabs');
    const content = ui.querySelector('#content');
    let activeTab = "carUi";


    //Car
    let car={
        manufacture: "",
        model: "",
        year: 0,
        category:"",
        description: "",
        meshURL: null,
        previewImageURL: null,

        mass: {min: 0, max: 0},

        A: {min: 0, max: 0},
        Cl: {min: 0, max: 0},
        Cd: {min: 0, max: 0},
        bindedAero: false,

        steeringRatio: 1,

        brakingPower:{min: 0, max: 0},
        AvrgWheelRadius: 0.5,

        Power: {min: 0, max: 0},

        FrC: {min: 0, max: 0},


        gearBox:{
            RPM:{
                idle: 0, 
                min: 0, 
                shift: 0,
                max: 0, 
                variation: 0
            },

            
            gears:[
                0
            ]
        },

        cameras:{
            driverCam:{
                x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
            },

            Tcam:{
                x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
            },

            bumperCam:{
                x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
            },

            onboard1:{
                x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
            },

            onboard2:{
                x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
            },

            onboard3:{
                x:0, y:1, z:0, pitch:0, roll:0, yaw: 0, fov: 0.8
            },
        }
    };

    let numberOfGears = 1;

    activateCarUi();

    //files
    let previewImageFile;

    //mouse position stuff

    window.addEventListener('mousemove', mouseMoveHandler);

    let relativeX;
    let relativeY;

    let viewPortWidth = document.documentElement.clientWidth;
    let viewPortHeight = document.documentElement.clientHeight;

    let xBounds = {min: (viewPortWidth/100)*25, max: viewPortWidth};
    let yBounds = {min: 0, max: viewPortHeight};

    tabs.addEventListener("click", (event) => {
        tabs.querySelectorAll("li").forEach( (el) => {
            if(el.getAttribute("data-id") !== event.target.getAttribute("data-id")){
                el.removeAttribute("class","is-active");
            }
        });
        const tabID = event.target.getAttribute("data-id");

        tabs.querySelector("#"+tabID).setAttribute("class", "is-active" );
        activeTab = tabID;

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
        //console.log(activeTab);
    });

    //MenuToggle
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

        //console.log("x: "+relativeX, "y: "+relativeY);
    }

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

    function activateCarUi(){
        //Car Ui
        content.innerHTML = carUiHtml;
        
        //Car Ui inputs
        const manufactureIn = document.querySelector("#manufactureIn");
        const modelIn = document.querySelector("#modelIn");
        const yearIn = document.querySelector("#yearIn");
        const categoryIn = document.querySelector("#categoryIn");
        const descriptionIn = document.querySelector("#descriptionIn");

        if(car.manufacture && car.manufacture != "") manufactureIn.value = car.manufacture;
        if(car.model && car.model != "") modelIn.value = car.model;
        if(car.year && car.year > 0) yearIn.value = car.year;
        if(car.category && car.category != "") categoryIn.value = car.category;
        if(car.description && car.description != "") descriptionIn.value = car.description;
            
        //inputs events
        manufactureIn.addEventListener("change", (e) =>{
            car.manufacture = manufactureIn.value;
        });
            
        modelIn.addEventListener("change", (e) =>{
            car.model = modelIn.value;
        });
            
        yearIn.addEventListener("change", (e) =>{
            car.year = yearIn.value;
        });
            
        categoryIn.addEventListener("change", (e) =>{
            car.category = categoryIn.value;
        });
            
        manufactureIn.addEventListener("change", (e) =>{
            car.manufacture = manufactureIn.value;
        });
            
        descriptionIn.addEventListener("change", (e) =>{
            car.description = descriptionIn.value;
        });
            
        //image
        const previewImage = ui.querySelector("#previewImage");
        const previewImageInput = ui.querySelector("#selectImageInput");

        if(car.previewImageURL) loadPreviewImage(car.previewImageURL);
            
            previewImageInput.addEventListener('change', async (event)=>{
            const file = event.target.files[0];             
            toBase64(file).then(res =>{
                car.previewImageURL = res;
                loadPreviewImage(res);
            });
        });

        function loadPreviewImage(url){
            previewImage.setAttribute("src", url);
        }
    }
});