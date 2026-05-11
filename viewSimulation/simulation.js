async function startSimulation(simulation, scene, engine) {
  if (simulation.nodes.length < 2) {
    return;
  } 

  let meshLoaded = false;
  let carMesh;
  let steerableWheel = [];
  let steerables = [];
  let rearWheels = [];
  let steeringWheel = [];
  let helmet = [];

  function loadMesh(url){
    if(carMesh) carMesh.dispose(), steerableWheel = [], steerables = [], rearWheels = [], helmet = [];

    return BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, ".glb")
      .then((result) => {
        URL.revokeObjectURL(url);

        meshLoaded = true;
        carMesh = result.meshes[0];
        scene.meshes.forEach(mesh => {
          //console.log(mesh.name);

          if (mesh.name.includes("WHEEL_STEERABLE")) {  //adds rolling and steering animation
            steerableWheel.push(mesh);
          } else if (mesh.name.includes("STEERABLE")) {  //adds only steering animation
            steerables.push(mesh);

          } else if (mesh.name.includes("STEERING_WHEEL")) {   //adds steering animation with steering ratio multiplier
            steeringWheel.push(mesh);

          } else if (mesh.name.includes("WHEEL_REAR")) {    //only rolling animation
            rearWheels.push(mesh);
          } else if (mesh.name.includes("DRIVER_HELMET")) {
            helmet.push(mesh);
          }
        });
        return carMesh;
      });
  }

  carMesh = await loadMesh(simulation.car.meshURL);
  
  carMesh.position.copyFrom(() => {
    const startPos = simulation.nodes[0];
    return new BABYLON.Vector3(startPos.x, startPos.y, startPos.z);
  });
  
  const fc = new BABYLON.FollowCamera(
    "FollowCamera",
    carMesh.position.add(new BABYLON.Vector3(0, 10, -20)),
    scene,
    carMesh
  );
  fc.radius = 15;
  fc.heightOffset = 7;
  fc.rotationOffset = 180;
  fc.cameraAcceleration = 0.05;
  fc.maxCameraSpeed = 10;
  //scene.activeCamera = fc;
  
  const points = simulation.nodes;
  const FRAME_RATE = 60;
  const movement = new BABYLON.Animation(`movement`, "position", FRAME_RATE,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const rotation = new BABYLON.Animation(`rotation`, "rotation", FRAME_RATE,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const movementKeysFrames = [];
  const rotationKeysFrames = [];
  let t = 0; 

  for (let i = 0; i < points.length - 2; i++) {
    movementKeysFrames.push({
      frame: FRAME_RATE * t,
      value: () => {
        return new BABYLON.Vector3(points[i].x, points[i].y, points[i].z);
      }
    });
    const direction = new BABYLON.Vector3(
      points[i+1].x - points[i].x,
      points[i+1].y - points[i].y,
      points[i+1].z - points[i].z
    )
    const rotY = Math.atan2(direction.x, direction.z) + Math.PI;
    const rotX = -Math.asin(direction.y);
    const rotZ = 0;
    rotationKeysFrames.push({
      frame: FRAME_RATE * t,
      value: new BABYLON.Vector3(rotX, rotY, rotZ)
    });
    t += simulation.nodes[i].t; 
  }
  movement.setKeys(movementKeysFrames);
  rotation.setKeys(rotationKeysFrames);
  carMesh.animations.push(movement);
  carMesh.animations.push(rotation);

  scene.beginAnimation(carMesh, 0, t * FRAME_RATE);
}