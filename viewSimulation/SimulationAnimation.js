class SimulationAnimation{
    constructor(simulatedLap, name, scene, engine){
        this.simulatedLap = simulatedLap;
        this.name = name
        this.engine = engine;
        this.scene = scene;
        this.FRAME_RATE = 60;
        this.totalTime = simulatedLap.totalTime;
        this.totalDistance = simulatedLap.lengthInMeters;
        this.animations = [];
        this.currentNode = 0;
        this.distanceTravelled = 0;
        this.time = 0;

        //Gmeter related stuff
        this.maxG = Math.max(Math.abs(simulatedLap.nodes[0].longitudinalG), Math.abs(simulatedLap.nodes[0].lateralG));
        this.simulatedLap.nodes.forEach(node => {
          if(this.maxG && node.longitudinalG && node.lateralG){
            this.maxG = Math.max(this.maxG, Math.abs(node.longitudinalG));
            this.maxG = Math.max(this.maxG, Math.abs(node.lateralG));
          }
        });

        //animatable
        this.carAnim;
        this.steerableAnim = [];
        this.steerableWheelAnim = [];
        this.wheelsAnim = [];
        this.steeringWheelAnim = [];
        this.helmetAnim = [];
        this.simualationSecificAnim;

        scene.useRightHandedSystem = false;

        //Line Mesh
        this.lineMesh = BABYLON.MeshBuilder.CreateLines(
        "simulationPath",
        {
          points: simulatedLap.nodes.map(n => new BABYLON.Vector3(n.x, n.y+0.1, n.z)),
          updatable: false
        },
        scene
        );
        //this.lineMesh.renderingGroupId = 1;


        //Car Mesh
        this.steerableWheel = [];
        this.steerables = [];
        this.rearWheels = [];
        this.steeringWheel = [];
        this.helmet = [];

        this.carMesh;
        const url = simulatedLap.car.meshURL;
        return BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, ".glb")
            .then((result) => {
            URL.revokeObjectURL(url);

            this.carMesh = result.meshes[0];
            this.carMesh.renderingGroupId = 2; //so it renders on the track(0) and on line(1)
            this.carMesh.getChildMeshes(false).forEach(m => m.renderingGroupId = 2);
            this.carMesh.getChildMeshes(false).forEach(mesh => {

            if (mesh.name.includes("WHEEL_STEERABLE")) {  //adds rolling and steering animation
              this.steerableWheel.push(mesh);
            } else if (mesh.name.includes("STEERABLE")) {  //adds only steering animation
              this.steerables.push(mesh);

            } else if (mesh.name.includes("STEERING_WHEEL")) {   //adds steering animation with steering ratio multiplier
              this.steeringWheel.push(mesh);

            } else if (mesh.name.includes("WHEEL_REAR")) {    //only rolling animation
              this.rearWheels.push(mesh);
            } else if (mesh.name.includes("DRIVER_HELMET")) {
              this.helmet.push(mesh);
            }
            });


        //Onboards Cameras

        scene.useRightHandedSystem = true;
        function onboardCamera(mesh,carCamera, name, minZ){
            
            const newCamera = new BABYLON.TargetCamera(
                                name,
                                new BABYLON.Vector3(-carCamera.x, carCamera.y, carCamera.z),
                                scene,
                                false
                            );
            newCamera.rotation.set(-carCamera.pitch, -carCamera.yaw+Math.PI, carCamera.roll);
            newCamera.fov = carCamera.fov;
            newCamera.minZ = minZ;

            newCamera.parent = mesh;

            return newCamera;
        }

        const carDriverCam = simulatedLap.car.cameras.driverCam;
        this.driverCam = onboardCamera(this.carMesh, carDriverCam, "driverCam", 0.05);
        //scene.activeCamera = this.driverCam;

        const carTcam = simulatedLap.car.cameras.Tcam;
        this.Tcam = onboardCamera(this.carMesh, carTcam, "Tcam", 0.05);
        //scene.activeCamera = this.Tcam;

        const carBumperCam = simulatedLap.car.cameras.bumperCam;
        this.bumperCam = onboardCamera(this.carMesh, carBumperCam, "bumperCam", 0.05);
        //scene.activeCamera = this.bumperCam;

        const carOnboard1 = simulatedLap.car.cameras.onboard1;
        this.onboard1 = onboardCamera(this.carMesh, carOnboard1, "onboard1", 0.05);
        //scene.activeCamera = this.onboard1;

        const carOnboard2 = simulatedLap.car.cameras.onboard2;
        this.onboard2 = onboardCamera(this.carMesh, carOnboard2, "onboard2", 0.05);
        //scene.activeCamera = this.onboard2;

        const carOnboard3 = simulatedLap.car.cameras.onboard3;
        this.onboard3 = onboardCamera(this.carMesh, carOnboard3, "onboard3", 0.05);
        //scene.activeCamera = this.onboard3;

        const carTopView = {
            x: 0,
            y: 70,
            z: 0,
            pitch: Math.PI/2,
            yaw: 0,
            roll:0,
            fov: 0.8
        }
        this.topView = onboardCamera(this.carMesh, carTopView, "topView", 1);
        scene.activeCamera = this.topView;


        
        const startPos = simulatedLap.nodes[0];
        this.carMesh.position = new BABYLON.Vector3(startPos.x, startPos.y, startPos.z);

        const direction = new BABYLON.Vector3(
              simulatedLap.nodes[1].x - simulatedLap.nodes[0].x,
              simulatedLap.nodes[1].y - simulatedLap.nodes[0].y,
              simulatedLap.nodes[1].z - simulatedLap.nodes[0].z
            )

        const rotY = Math.atan2(direction.x, direction.z) + Math.PI;

        this.carMesh.rotation = new BABYLON.Vector3(0, rotY, 0);
        this.steerables.forEach(element => {
          element.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, 0);
        });
        this.steerableWheel.forEach(element => {
          element.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, 0);
        });


        scene.useRightHandedSystem = false;
        //Follow Camera
        this.fc = new BABYLON.FollowCamera(
            "FollowCamera",
            this.carMesh.position.add(new BABYLON.Vector3(0, 10, -20)),
            scene,
            this.carMesh
        );

        this.fc.radius = 15;
        this.fc.heightOffset = 7;
        this.fc.rotationOffset = 180;
        this.fc.cameraAcceleration = 0.05;
        this.fc.maxCameraSpeed = 10;
        //scene.activeCamera = this.fc;
        scene.useRightHandedSystem = true;

        this.calculateAnimations();


        return this;


        });
    }

    switchToCamera(id){
        scene.useRightHandedSystem = true;
        this.helmet.forEach(mesh => {
            mesh.isVisible = true;
        });

        switch(id){
            case "driverCam":
                this.scene.activeCamera = this.driverCam;
                this.helmet.forEach(mesh => {
                    mesh.isVisible = false;
                });
                return;
            case "Tcam":
                this.scene.activeCamera = this.Tcam;
                return;
            case "bumperCam":
                this.scene.activeCamera = this.bumperCam;
                return;
            case "onboard1":
                this.scene.activeCamera = this.onboard1;
                return;
            case "onboard2":
                this.scene.activeCamera = this.onboard2;
                return;
            case "onboard3":
                this.scene.activeCamera = this.onboard3;
                return;
            case "topView":
                this.scene.activeCamera = this.topView;
                return;
            case "chase":
                scene.useRightHandedSystem = false;
                this.scene.activeCamera = this.fc;
                return;
        }
    }


    showLine(condition){
      this.lineMesh.isVisible = condition;
    }


    deleteLineMesh(){
        this.lineMesh.dispose();
    }

    deleteCarMesh(){
        this.carMesh.dispose();
    }

    deleteMeshes(){
        this.deleteLineMesh();
        this.deleteCarMesh();
    }

    setLineColor(r,g,b){
        this.lineMesh.color = new BABYLON.Color3(r, g, b);
    }

    carRenderFront(){
        this.carMesh.renderingGroupId = 2;
        this.carMesh.getChildMeshes(false).forEach(m => m.renderingGroupId = 2);
    }

    carRenderBehind(){
        this.carMesh.renderingGroupId = 0;
        this.carMesh.getChildMeshes(false).forEach(m => m.renderingGroupId = 0);
    }


    calculateAnimations(){
        const points = this.simulatedLap.nodes;
        
        //Car
        const carMovement = new BABYLON.Animation(`movement`, "position", this.FRAME_RATE,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const carRotation = new BABYLON.Animation(`rotation`, "rotation", this.FRAME_RATE,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );


        //Current Node
        const currentNodeAnim = new BABYLON.Animation(`currentNode`, "currentNode", this.FRAME_RATE,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );


        //Distance Travelled
        const distanceTravelledAnim = new BABYLON.Animation(`distanceTravelled`, "distanceTravelled", this.FRAME_RATE,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );


        //Time
        const timeAnim = new BABYLON.Animation(`time`, "time", this.FRAME_RATE,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );


        const carMovementKeysFrames = [];
        const carRotationKeysFrames = [];

        const steerablesKeysFrames = [];
        const steeringKeysFrames = [];

        const helmetKeysFrames = [];

        const currentNodeKeysFrames = [];
        const distanceTravelledKeysFrames = [];
        const timeKeysFrames = [];

        let t = 0;
        let d = 0;

        let precRotY;
        let helmetPrecRotY;

        for (let i = 0; i < points.length - 1; i++) {

            //Car Movement
            carMovementKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: new BABYLON.Vector3(points[i].x, points[i].y, points[i].z)
            });

            //Direction and rotation
            const direction = new BABYLON.Vector3(
              points[i+1].x - points[i].x,
              points[i+1].y - points[i].y,
              points[i+1].z - points[i].z
            )

            //To fix the change of direction when passing trought the 0
            //otherwise it would go from 0.01 to 6.2 wich its correct
            //but the animation would do the whole rotation creating visual glitches
            //this fixes the rotation making the transition smooth
            let rotY = Math.atan2(direction.x, direction.z) + Math.PI;

            if (precRotY) {
              let delta = rotY - precRotY;
              if (delta > Math.PI) {
                rotY -= Math.PI * 2;
              } 
              else if (delta < -Math.PI) {
                rotY += Math.PI * 2;
              }
            }
            precRotY = rotY;


            const elevationLookAhead = Math.min(i + 3, points.length - 1);

            const smoothElevation = new BABYLON.Vector3(
              points[elevationLookAhead].x - points[i].x,
              points[elevationLookAhead].y - points[i].y,
              points[elevationLookAhead].z - points[i].z
            ).normalize();
            const rotX = Math.asin(smoothElevation.y);
            
            const rotZ = 0;

            //Car Rotation
            carRotationKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: new BABYLON.Vector3(rotX, rotY, rotZ)
            });


            //Steerables
            steerablesKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: new BABYLON.Vector3(Math.PI/2, Math.PI/2, points[i].wheelsAngle)
            });


            //SteeringWheel
            steeringKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: new BABYLON.Vector3(0, 0, (points[i].wheelsAngle)*this.simulatedLap.car.steeringRatio)
            });

            //Helmet
            let lookahead = i + 50;
            lookahead = Math.min(lookahead, points.length - 1);
            let helmetDirection = new BABYLON.Vector3(
              points[lookahead].x - points[i].x,
              points[lookahead].y - points[i].y,
              points[lookahead].z - points[i].z
            )

            let helmetRotY = Math.atan2(helmetDirection.x, helmetDirection.z);
            if (helmetPrecRotY) {
              let helmetDelta = helmetRotY - helmetPrecRotY;
              while (helmetDelta < -Math.PI) helmetDelta += Math.PI * 2;
              while (helmetDelta > Math.PI) helmetDelta -= Math.PI * 2;
              helmetRotY = helmetPrecRotY + helmetDelta;
            }
            helmetPrecRotY = helmetRotY;

            let headAngle = -Math.atan2(helmetDirection.x, helmetDirection.z) + (rotY - Math.PI);

            while (headAngle < -Math.PI) headAngle += Math.PI * 2;
            while (headAngle > Math.PI) headAngle -= Math.PI * 2;

            //helmet movement limitations, otherwise the driver could have a serious neck injury
            if (headAngle > Math.PI / 4) headAngle = Math.PI / 4;
            if (headAngle < -Math.PI / 4) headAngle = -Math.PI / 4;

            helmetKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: new BABYLON.Vector3(0, headAngle, 0)
            });


            //Current Node
            currentNodeKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: i
            });

            //Distance
            distanceTravelledKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: d
            });

            //Time
            timeKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: t
            });

            t += this.simulatedLap.nodes[i].t;
            d += this.simulatedLap.nodes[i].d;
        }
    
    
        //Car Movement and Rotation
        carMovement.setKeys(carMovementKeysFrames);
        carRotation.setKeys(carRotationKeysFrames);
        this.carMesh.animations.push(carMovement);
        this.carMesh.animations.push(carRotation);


        //Steerables
        this.steerableWheel.forEach(wheel => {
          const steerableRotation = new BABYLON.Animation(`wheel`, "rotation", this.FRAME_RATE, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
          steerableRotation.setKeys(steerablesKeysFrames);
          wheel.animations.push(steerableRotation);
        });


        this.steerables.forEach(steerable => {
          const steerableRotation = new BABYLON.Animation(`steerable`, "rotation", this.FRAME_RATE, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
          steerableRotation.setKeys(steerablesKeysFrames);
          steerable.animations.push(steerableRotation);
        });


        //Steering Wheel
        this.steeringWheel.forEach(stWheelEl => {
          const steeringWheelRotation = new BABYLON.Animation(`stWheelEl`, "rotation", this.FRAME_RATE, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
          steeringWheelRotation.setKeys(steeringKeysFrames);
          stWheelEl.animations.push(steeringWheelRotation);
        });


        //Helmet
        this.helmet.forEach(helmetEl => {
          const helmetRotation = new BABYLON.Animation(`helmetEl`, "rotation", this.FRAME_RATE, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
          helmetRotation.setKeys(helmetKeysFrames);
          helmetEl.animations.push(helmetRotation);
        });


        //Current Node
        currentNodeAnim.setKeys(currentNodeKeysFrames);
        this.animations.push(currentNodeAnim);


        //Distance Travelled
        distanceTravelledKeysFrames.push({
          frame: this.FRAME_RATE * this.totalTime,
          value: this.totalDistance
        });
        distanceTravelledAnim.setKeys(distanceTravelledKeysFrames);
        this.animations.push(distanceTravelledAnim);


        //Time
        timeAnim.setKeys(timeKeysFrames);
        this.animations.push(timeAnim);
    }



    startAnimation(startTime){
      this.steerableAnim = [];
      this.steerableWheelAnim = [];
      this.steeringWheelAnim = [];
      this.helmetAnim = [];
      //start Car Animation
      this.carAnim = this.scene.beginAnimation(this.carMesh, startTime*this.FRAME_RATE, this.totalTime * this.FRAME_RATE);

      //start Steerables Animation
      this.steerableWheel.forEach(wheel => {
        this.steerableWheelAnim.push(this.scene.beginAnimation(wheel, startTime*this.FRAME_RATE, this.totalTime * this.FRAME_RATE));
      });

      this.steerables.forEach(steerable => {
        this.steerableAnim.push(this.scene.beginAnimation(steerable, startTime*this.FRAME_RATE, this.totalTime * this.FRAME_RATE));
      });

      //start Steering Animation
      this.steeringWheel.forEach(stWheelEl => {
        this.steeringWheelAnim.push(this.scene.beginAnimation(stWheelEl, startTime*this.FRAME_RATE, this.totalTime * this.FRAME_RATE));
      });

      //start Helmet Animation
      this.helmet.forEach(helmetEl => {
        this.helmetAnim.push(this.scene.beginAnimation(helmetEl, startTime*this.FRAME_RATE, this.totalTime * this.FRAME_RATE));
      });

      //start Current Node Animation
      this.simualationSecificAnim = this.scene.beginAnimation(this, startTime*this.FRAME_RATE, this.totalTime * this.FRAME_RATE);
    }


    pauseAnimation(){
      this.carAnim.pause();

      this.steerableAnim.forEach(element => {
        element.pause();
      });

      this.steerableWheelAnim.forEach(element =>{
        element.pause();
      });

      this.wheelsAnim.forEach(element =>{
        element.pause();
      });

      this.steeringWheelAnim.forEach(element =>{
        element.pause();
      });

      this.helmetAnim.forEach(element =>{
        element.pause();
      });

      this.simualationSecificAnim.pause();
    }


    resumeAnimation(){
      this.carAnim.restart();

      this.steerableAnim.forEach(element => {
        element.restart();
      });

      this.steerableWheelAnim.forEach(element =>{
        element.restart();
      });

      this.wheelsAnim.forEach(element =>{
        element.restart();
      });

      this.steeringWheelAnim.forEach(element =>{
        element.restart();
      });

      this.helmetAnim.forEach(element =>{
        element.restart();
      });

      this.simualationSecificAnim.restart();
    }


    resetAnimation(){
      this.carAnim.reset();

      this.steerableAnim.forEach(element => {
        element.reset();
      });

      this.steerableWheelAnim.forEach(element =>{
        element.reset();
      });

      this.wheelsAnim.forEach(element =>{
        element.reset();
      });

      this.steeringWheelAnim.forEach(element =>{
        element.reset();
      });

      this.helmetAnim.forEach(element =>{
        element.reset();
      });

      this.simualationSecificAnim.reset();
    }

}