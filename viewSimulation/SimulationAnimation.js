class SimulationAnimation{
    constructor(simulatedLap, scene, engine){
        this.simulatedLap = simulatedLap;
        this.engine = engine;
        this.scene = scene;
        this.FRAME_RATE = 60;
        this.totalTime = simulatedLap.totalTime;

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
            this.scene.meshes.forEach(mesh => {

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
            newCamera.rotation.set(-carCamera.pitch, carCamera.yaw+Math.PI, carCamera.roll);
            newCamera.fov = carCamera.fov;
            newCamera.minZ = minZ;

            newCamera.parent = mesh;

            return newCamera;
        }

        const carDriverCam = simulatedLap.car.cameras.driverCam;
        this.driverCam = onboardCamera(this.carMesh, carDriverCam, "driverCam", 0.01);
        //scene.activeCamera = this.driverCam;

        const carTcam = simulatedLap.car.cameras.Tcam;
        this.Tcam = onboardCamera(this.carMesh, carTcam, "Tcam", 0.01);
        //scene.activeCamera = this.Tcam;

        const carBumperCam = simulatedLap.car.cameras.bumperCam;
        this.bumperCam = onboardCamera(this.carMesh, carBumperCam, "bumperCam", 0.01);
        //scene.activeCamera = this.bumperCam;

        const carOnboard1 = simulatedLap.car.cameras.onboard1;
        this.onboard1 = onboardCamera(this.carMesh, carOnboard1, "onboard1", 0.01);
        //scene.activeCamera = this.onboard1;

        const carOnboard2 = simulatedLap.car.cameras.onboard2;
        this.onboard2 = onboardCamera(this.carMesh, carOnboard2, "onboard2", 0.01);
        //scene.activeCamera = this.onboard2;

        const carOnboard3 = simulatedLap.car.cameras.onboard3;
        this.onboard3 = onboardCamera(this.carMesh, carOnboard3, "onboard3", 0.01);
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
        switch(id){
            case "driverCam":
                this.scene.activeCamera = this.driverCam;
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

        const carMovementKeysFrames = [];
        const carRotationKeysFrames = [];

        let t = 0; 

        for (let i = 0; i < points.length - 2; i++) {

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
            const rotY = Math.atan2(direction.x, direction.z) + Math.PI;
            const rotX = Math.asin(direction.y);
            const rotZ = 0;

            //Car Rotation
            carRotationKeysFrames.push({
              frame: this.FRAME_RATE * t,
              value: new BABYLON.Vector3(rotX, rotY, rotZ)
            });


            t += this.simulatedLap.nodes[i].t; 
        }
        carMovement.setKeys(carMovementKeysFrames);
        carRotation.setKeys(carRotationKeysFrames);
        this.carMesh.animations.push(carMovement);
        this.carMesh.animations.push(carRotation);
    }


    startAnimation(){
        this.scene.beginAnimation(this.carMesh, 0, this.totalTime * this.FRAME_RATE);
    }



}