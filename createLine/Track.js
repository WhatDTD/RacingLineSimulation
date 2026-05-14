class TrackNode {
  constructor(x, y, z, r, d) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
    this.d = d;
  }

  toVector() {
    return new BABYLON.Vector3(
      this.x,
      this.y,
      this.z
    );
  }

  projectOntoTrack() {
    const origin = new BABYLON.Vector3(
      this.x,
      1000,
      this.z
    );

    const ray = new BABYLON.Ray(
      origin,
      BABYLON.Vector3.Down(),
      2000
    );

    const hit = scene.pickWithRay(ray, m => {
      return trackMeshes.includes(m);
    });

    if (hit && hit.pickedPoint) {
      this.y = hit.pickedPoint.y;
    }
  }

  render() {
    const nodeMesh = BABYLON.MeshBuilder.CreateSphere(
      "node",
      { diameter: 2 },
      scene
    );
    nodeMesh.position.copyFrom(new BABYLON.Vector3(this.x, this.y, this.z));
    const mat = new BABYLON.StandardMaterial("nodeMat", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    nodeMesh.material = mat;
    return nodeMesh;
  }  
}


class Track {
  constructor() {
    this.nodes = [];
    this.meshesNodes = [];
    this.meshesLines = [];
    this.history = [];
  }

  addPoint(x, y, z) {
    const node = new TrackNode(x, y, z);
    this.nodes.push(node);
    const nodeMesh = node.render();
    this.meshesNodes.push(nodeMesh);
    
    const action = {
      nodesAdded: [node],
      meshesAdded: [nodeMesh]
    };
    
    if (this.nodes.length === 1) {
      this.history.push(action); 
      return node;
    }
    
    if (this.nodes.length === 2) {
      this.arrowController = this.createArrow(this.nodes[0]);
      action.meshesAdded.push(this.arrowController.mesh);
      this.history.push(action); 
      return node;
    }
    
    if (this.nodes.length === 3) {
      const firstArc = this.connect(
        this.nodes[0],
        this.arrowController,
        this.nodes[1]
      );
      action.meshesAdded.push(firstArc.mesh);
      action.nodesAdded.push(...firstArc.insertedNodes);
      this.arrowController.dispose();
      delete this.arrowController;
    }
    let len = this.nodes.length;
    const arc = this.connect(
      this.nodes[len-3],
      this.nodes[len-2],
      this.nodes[len-1]
    );
    action.meshesAdded.push(arc.mesh);
    action.nodesAdded.push(...arc.insertedNodes);

    this.history.push(action);
    return node;
  }

  undo() {
    if (this.history.length === 0) {
      return;
    }
    const action = this.history.pop();
    action.nodesAdded.forEach(n => {
      const index = this.nodes.indexOf(n);
      if (index !== -1) {
        this.nodes.splice(index, 1);
      }
    });
    action.meshesAdded.forEach(m => {
      if (m) {
        m.dispose();
      }
    });
    if (this.nodes.length === 1) {
      this.arrowController.dispose();
      delete this.arrowController;
    }
    if (this.nodes.length === 2) {
      this.arrowController = this.createArrow(this.nodes[0]);
    }
  }

  calculateRadius(p1,p2,p3){

    if(p2.mesh) p2 = p2.mesh.position;

    let a = distance(p1,p2);
    let b = distance(p2,p3);
    let c = distance(p3,p1);

    let s = (a+b+c)/2;

    return (a*b*c)/4/Math.sqrt(s*(s-a)*(s-b)*(s-c));
  }

  insert(index, points) {
    const insertNodes = points.map(p => new TrackNode(p.x, p.y, p.z));
    this.nodes.splice(index + 1, 0, ...insertNodes);
  }

  connect(p1, p2, p3) {
    let radius = this.calculateRadius(p1,p2,p3);
    if(!radius) radius = 10000;

    document.querySelector("#radius").innerHTML = `Radius: ${Math.trunc(radius)} m`;
    console.log(radius);

    const numPoints = Math.floor(2*Math.PI*radius/6);
    //console.log("C: "+2*Math.PI*radius, "P: "+numPoints);

    const arc = BABYLON.Curve3.ArcThru3Points(
      p1.toVector(),
      p2.toVector(),
      p3.toVector(),
      numPoints,
      false,
      false
    );
    
    let points = arc.getPoints();
    p1.r = radius;
    p2.r = radius;
    p3.r = radius;

    let lastR;
    let lastP;
    points.forEach(p => {
      lastR = p.r;
      p.r = radius;

      //distance between points tests
      if(lastP) lastP.d = distance(p,lastP);
    
      lastP = p;

      const ray = new BABYLON.Ray(
        new BABYLON.Vector3(p.x, 1000, p.z),
        BABYLON.Vector3.Down(),
        2000
      );
      const hit = scene.pickWithRay(ray, m => trackMeshes.includes(m));
      if (hit && hit.pickedPoint) {
        p.y = hit.pickedPoint.y + 0.5; //0.5 so it doesnt clip
      }
    });

    points[points.length-1].r = lastR ? lastR : points[points.length-2].r;

    if (this.nodes.length > 2) {
      let beforeP2Index = 0;
      let dx = points[0].x - p2.x;
      let dy = points[0].y - p2.y;
      let dz = points[0].z - p2.z;
      let minDist = dx*dx + dy*dy + dz*dz;
      for (let i = 1; i < points.length; i++) {
        dx = points[i].x - p2.x;
        dy = points[i].y - p2.y;
        dz = points[i].z - p2.z;
        const dist = dx*dx + dy*dy + dz*dz;
        if (dist < minDist) {
          minDist = dist;
          beforeP2Index = i;
        }
      }
      points = points.slice(beforeP2Index+1);
    }
    
    const insertPoints = points.slice(1, -1);
    
    const p3Index = this.nodes.indexOf(p3);
    const insertNodes = insertPoints.map(p => {
      const node = new TrackNode(p.x, p.y, p.z, p.r, p.d);
      node.projectOntoTrack();
      node.render
      return node;  
    });
    this.nodes.splice(p3Index, 0, ...insertNodes);

    points.unshift(p2);
    const arcMesh = BABYLON.MeshBuilder.CreateLines("arcDebug", {
      points: points,
      updatable: false
    });
    arcMesh.color = new BABYLON.Color3(0, 0, 1);
    this.meshesLines.push(arcMesh);
    arc.mesh = arcMesh; //adding mesh field
    arc.insertedNodes = insertNodes; //adding inserted nodes field
    points.shift();

    return arc;
  }

  createArrow(node) {
    const pos = node.toVector();

    const sphere = BABYLON.MeshBuilder.CreateSphere("gizmoSphere", { diameter: 1 }, scene);
    sphere.position.copyFrom(pos);

    const mat = new BABYLON.StandardMaterial("gizmoMat", scene);
    mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    sphere.material = mat;

    const gizmo = new BABYLON.PositionGizmo();
    gizmo.attachedMesh = sphere;
    gizmo.yGizmo.isEnabled = false;

    gizmo.onDragObservable.add(() => {
      if (!trackMeshes.length) {
        return;
      }

      const origin = new BABYLON.Vector3(
        sphere.position.x,
        1000,
        sphere.position.z
      );

      const ray = new BABYLON.Ray(origin, BABYLON.Vector3.Down(), 2000);
      const hit = scene.pickWithRay(ray, m => trackMeshes.includes(m));

      if (hit && hit.pickedPoint) {
        sphere.position.y = hit.pickedPoint.y;
      }

      gizmo.position = new BABYLON.Vector3(
        sphere.position.x,
        sphere.position.y,
        sphere.position.z
      );
    });

    const arrowController = {
      mesh: sphere,
      gizmo: gizmo,
      toVector() {
        return gizmo.position;
      },
      dispose() {
        if (this.gizmo) {
          this.gizmo.attachedMesh = null;
          this.gizmo.dispose();
          this.gizmo = null;
        }
        if (this.mesh) {
          this.mesh.dispose();
          this.mesh = null;
        }
      }
    }

    return arrowController;
  }

  getPoints() {
    return this.nodes.map(node => new BABYLON.Vector3(node.x, node.y, node.z));
  }

  calculateAndAssignDistanceBetweenPoints(){
    for(let i = 0; i < this.nodes.length-1; i++){
      this.nodes[i].d = distance(this.nodes[i], this.nodes[i+1]);
    }
  }

  exportJSON() {

    this.calculateAndAssignDistanceBetweenPoints();

    const data = this.nodes.map(node => ({
      x: node.x,
      y: node.y,
      z: node.z,
      r: node.r,
      d: node.d
    }));
    return JSON.stringify(data, null, 2);
  }
}

function createVerticalLine(node, height = 100) {
  const startPoint = node.toVector();
  const endPoint = new BABYLON.Vector3(
    node.x,
    node.y + height,
    node.z
  );
  
  const line = BABYLON.MeshBuilder.CreateLines("verticalLine", {
    points: [startPoint, endPoint],
    updatable: false
  });
  
  line.color = new BABYLON.Color3(1, 1, 0); 
  
  return line;
}

function distance(p1,p2){
  return Math.sqrt((p1.x - p2.x)**2+(p1.y - p2.y)**2+(p1.z - p2.z)**2);
}