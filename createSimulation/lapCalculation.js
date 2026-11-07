function calculateLap(SimCar, data, simulationStartVelocity, airDens, trackGrip){

    let constantLoad = SimCar.constantLoad;


    //FORMULAS

    //Src Mdn
    function getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
    }



    //Lift Force
    function calculateLiftForce(p, V, Cl, A, constantLoad){
        return p/2 * (V**2) *(Cl * -1) * A + constantLoad;
    }

    //Weight Vector with roll and pitch
    function calculateWeightVectorComponents(m, g, pitch, roll){
        let w = m * g;
        return{
            vertical: Math.cos(pitch) * Math.cos(roll) * w,
            lateral: Math.sin(roll) * w,
            longitudinal: Math.sin(-pitch) * w
        }
    }

    //Normal Force
    function calculateNormalForce(m, g, Fl, Fc, pitch, roll){
        return calculateWeightVectorComponents(m, g, pitch, roll).vertical + Fc * Math.sin(roll) + Fl;
    }


    //Centripetal Force
    function calculateCentripetalForce(m, V, r){
        return (m*(V**2))/r;
    }


    //Friction Force
    function calculateFrictionForce(FrC, N){
        return N*FrC;
    }


    //Drag Force
    function calculateDragForce(p, V, Cd, A){
        return p/2 * (V**2) * Cd * A;
    }

    //Friction Limited Acceleration
    function calculateAccelerationFL(m, Fr){
        return Fr/m
    }

    //Simple Power Curve Calculation
    function calculatePowerCurveValue(gears, V, P, Pg){
        if(V*3.6 > gears[gears.length-1]) return 0;
        let gear = 0;
        while(gears[gear] < V * 3.6){
            gear++;
            if(gear > gears.length) return P;
        }
        let minV = gears[gear-1]/3.6;
        let maxV = gears[gear]/3.6;
        let expectedVgap = gears[gears.length-1]/(gears.length-1)/3.6;
        let actualVgap = maxV - minV;
        let gearEfficency = expectedVgap/actualVgap;
        let startPowerMul = Math.pow(gear/(gears.length - 1), 1/Pg);
        //The higher the gear the less we drop power
        //Pg determines how much the power drops at the gear change
        //The higher the value the less the power drops

        let gearNorm = (V - minV)/actualVgap;
        let xp = Math.min(gearEfficency, 1);
        let ys = startPowerMul * Math.pow(gearEfficency, 1/4);
        let ye = Math.pow(gearEfficency, 1/4);
        let y = 1;
        if(gearNorm <= xp){
            y = (ys - 1)/(xp**2)*(gearNorm - xp)**2 + 1;
        }else{
            y = (ye - 1)/((1 - xp)**2) * (gearNorm - xp) + 1;
        }
        let resPower = P * y;
        return !resPower || resPower > P ? P : resPower;
    }


    //Power Limited Acceleration
    function calculateAccelerationPL(m, g, pitch, P, Fd, Fr, Fc, slipAngleLimit, V){
        let x = Fr == 0 ? 0 : Fc / Fr;
        x = Math.min(Math.max(x, 0), 1);
        let currentSlipAngleRad = (slipAngleLimit * (Math.PI / 180)) * (x**2);
        let FLat = Fc < Fr ? Fc : Fr;
        let tyreDragForce = FLat * Math.sin(currentSlipAngleRad);
        let aTyreDrag = tyreDragForce / m;

        let f = ((P * 1000) - Fd * V)/(m * V);
        return f - aTyreDrag + calculateWeightVectorComponents(m, g, pitch, 0).longitudinal/m;
    }

    //Maximum acceleration trought a turn of radius r
    function calculateAccelerationForR(aFL, aPL, Fr, Fc){
        let FLat = Math.abs(Fc) < Fr ? Math.abs(Fc) : Fr; //the lowest between the Friction force and the Centripetal force is the maximum possible
        let FLatNorm = FLat/Fr;
        let aGripCircle = Math.sin(Math.acos(FLatNorm))*aFL; //calculation of the grip circle
        return aPL < aGripCircle ? aPL : aGripCircle;
    }

    //terminal velocity
    function calculateTerminalVel(P, p, Cd, A){
        return Math.cbrt(
                        (2*(P*1000))/   //*1000 to convert from Kw to W
                        (p*Cd*A));
    }

    //Maximum Velocity trought a turn af radius r with tyre load sensitivity
    function maxVelforR(m, g, r, FrC, tls, Cl, A, p, constantLoad, roll, AltSpeed){
        let V = 1;
        for(let i = 0; i < 50; i++){
            V = calculateVel(V);
        }

        return V < AltSpeed ? V : AltSpeed;

        function calculateVel(V){
            let a = m/r;
            let b = Math.sin(roll)/(r*g)+(p * (Cl*-1) * A)/(2 * m * g);
            let c = (FrC * m * g)/a;
            let d = (Math.cos(roll) + constantLoad/(m * g) + b*V**2)**tls;
            return Math.sqrt(c*d)
        }
    }

    function calculateFrictionCoefficientOnLoad(m, g, N, FrC, tls){
        return FrC * (N/(m*g))**(tls-1);
    }

    function getDirection(x0, y0, x1, y1, x2, y2){
        let xA = x1 - x0;
        let yA = y1 - y0;
        let aA = Math.atan2(yA, xA);
    
        let xB = x2 - x1;
        let yB = y2 - y1;
        let aB = Math.atan2(yB, xB);
    
        let diff = aB - aA;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
    
        return diff < 0 ? 1 : -1;
    }

    //wheels angle from radius
    function wheelsAngleFromR(r, x0, y0, x1, y1, x2, y2, Fr, Fc, slipAngleLimit){
        let dir = getDirection(x0, y0, x1, y1, x2, y2);
        let x = Fr == 0 ? 0 : Fc/Fr;
        x = Math.min(Math.max(x, 0), 1);
    
        return (Math.atan(3/r)+(x**2)*(slipAngleLimit*(Math.PI/180))*0.5)*dir;
    }

    //throttle/brake percentage
    function calculatePedalInput(m, Fd, aPL, a){
        //compare the maximum acceleration that the power
        //can give us and than we compare it with the actual acceleration
        //taking acount drag
        //this will give us the pedal input whether it is the throttle or the brake
        if(aPL <= a) return 100;
        let t = a/aPL*100+(Fd/m)/aPL*100;
        if(t > 100) return 100;
        return t;
    }

    let terminalVel = calculateTerminalVel(SimCar.Power, airDens, SimCar.Cd, SimCar.A);
    
    //deceleration function
    function calculateDeceleration(car, nodes, endPoint) {
        let i = endPoint - 1;
        let brakingSamples = 0;
        let brakingDistance = 0;
        let brakePeak = 0;

        let m = car.mass;
        let Bp = car.brakingPower;
        let Cd = car.Cd;
        let Cl = car.Cl;
        let A = car.A;
        let latFrC = car.tyre.latFrC*trackGrip;
        let longFrC = car.tyre.longFrC*trackGrip;

        while (nodes[i].V > nodes[i+1].V) {
            let V = nodes[i+1].V;
            let t = nodes[i].d/V;
            let roll = nodes[i].roll * getDirection(nodes[i-1].x, nodes[i-1].z, nodes[i].x, nodes[i].z, nodes[i+1].x, nodes[i+1].z);
            let pitch = Math.asin((nodes[i+1].y - nodes[i].y)/nodes[i].d);
            let Fl = calculateLiftForce(airDens, V, Cl, A, constantLoad);
            let Fc = calculateCentripetalForce(m, V, nodes[i].r);
            let N = calculateNormalForce(m, g, Fl, Fc, pitch, roll);
            let realLongFrC = calculateFrictionCoefficientOnLoad(m, g, N, longFrC, SimCar.tyre.longTls);
            let realLatFrC = calculateFrictionCoefficientOnLoad(m, g, N, latFrC, SimCar.tyre.latTls);
            let longFr = calculateFrictionForce(realLongFrC, N);
            let latFr = calculateFrictionForce(realLatFrC, N);
            let Fd = calculateDragForce(airDens, V, Cd, A);
            let aFL = calculateAccelerationFL(m, longFr);
            let aBL = calculateAccelerationPL(m, g, pitch, Bp, -Fd, latFr, Math.cos(roll)*Fc, -SimCar.tyre.slipAngleLimit, V);
            let a = calculateAccelerationForR(aFL, aBL, latFr, Math.cos(roll)*Fc + calculateWeightVectorComponents(m, g, pitch, roll).lateral);
            let FLat = Math.cos(roll)*Fc < latFr ? Math.cos(roll)*Fc : latFr;

            nodes[i].longitudinalG =-a/g;
            nodes[i].lateralG =(FLat/m)/g;

            nodes[i].throttle = 0;
            nodes[i].brake = calculatePedalInput(m, Fd, aBL, a);
            brakePeak = Math.max(brakePeak, nodes[i].brake);

            nodes[i].P = 0;
            nodes[i].energyOnPowerKJ = 0;
            nodes[i].energyOnBrakeKJ = Bp*(nodes[i].brake/100)*t;
            
            let newSpeed = nodes[i+1].V + a*t;
            if (newSpeed < nodes[i].V && newSpeed < nodes[i-1].V) {
                nodes[i].V = newSpeed;
                nodes[i].t = t;
            }else{
                let BrakingData={
                    maxSpeed: nodes[i],
                    samples: brakingSamples,
                    distance: brakingDistance,
                    peak: brakePeak
                };
                return BrakingData;
            }

            nodes[i].wheelsAngle = wheelsAngleFromR(nodes[i].r, nodes[i-1].x, nodes[i-1].z, nodes[i].x, nodes[i].z, nodes[i+1].x, nodes[i+1].z, latFr, Math.cos(roll)*Fc, car.tyre.slipAngleLimit);

            i--;
            brakingSamples++;
            brakingDistance += nodes[i].d;
        }

        let BrakingData={
            maxSpeed: nodes[i],
            samples: brakingSamples,
            distance: brakingDistance,
            peak: brakePeak
        };
        return BrakingData;
    }

    //lap calculation main function
    function simulateLap(nodes, car){
        //limit pass
        for(let i=0; i < nodes.length; i++){
            let V = maxVelforR(car.mass, g, nodes[i].r, car.tyre.latFrC*trackGrip, car.tyre.latTls, 
                                                car.Cl, car.A, airDens, constantLoad, 
                                                nodes[i].roll * getDirection(nodes[Math.max(i-1,0)].x, nodes[Math.max(i-1,0)].z, 
                                                nodes[i].x, nodes[i].z, 
                                                nodes[Math.min(i+1, nodes.length-1)].x, nodes[Math.min(i+1, nodes.length-1)].z)
                                                , 299792458);
            nodes[i].V = nodes[i].limitSpeed ? Math.min(nodes[i].limitSpeed, V) : V;
            nodes[i].limitSpeed = nodes[i].V > terminalVel ? terminalVel : nodes[i].V;
        }

        //actual lap simulation
        nodes[0].V = simulationStartVelocity ? simulationStartVelocity/3.6 : car.tyre.longFrC*trackGrip * g / nodes[0].d;
        nodes[0].lateralG = 0;
        nodes[0].longitudinalG = car.tyre.longFrC*trackGrip;
        nodes[0].throttle = 100;
        nodes[0].brake = 0;
        nodes[0].wheelsAngle = 0;
        nodes[0].P = car.Power;
        nodes[0].energyOnPowerKJ = 0;
        nodes[0].energyOnBrakeKJ = 0;

        let m = car.mass;
        let latFrC = car.tyre.latFrC*trackGrip;
        let longFrC = car.tyre.longFrC*trackGrip;
        let Cd = car.Cd;
        let Cl = car.Cl;
        let p = airDens;
        let A = car.A;

        for(let i=1; i < nodes.length-1; i++){
            let V = nodes[i-1].V;
            let t = nodes[i-1].d/V;
            nodes[i-1].t = t;

            let roll = nodes[i].roll * getDirection(nodes[i-1].x, nodes[i-1].z, nodes[i].x, nodes[i].z, nodes[i+1].x, nodes[i+1].z);
            let pitch = Math.asin((nodes[i+1].y - nodes[i].y)/nodes[i].d);
            let P = calculatePowerCurveValue(car.gearBox.gears, V, car.Power, 550/car.Power);
            let Fl = calculateLiftForce(p, V, Cl, A, constantLoad);
            let Fc = calculateCentripetalForce(m, V, nodes[i].r);
            let N = calculateNormalForce(m, g, Fl, Fc, pitch, roll);
            let Fd = calculateDragForce(p, V, Cd, A);
            let realLatFrC = calculateFrictionCoefficientOnLoad(m, g, N, latFrC, car.tyre.latTls);
            let realLongFrC = calculateFrictionCoefficientOnLoad(m, g, N, longFrC, car.tyre.longTls);
            let latFr = calculateFrictionForce(realLatFrC, N);
            let longFr = calculateFrictionForce(realLongFrC, N);
            let aFL = calculateAccelerationFL(m, longFr);
            let aPL = calculateAccelerationPL(m, g, pitch, P, Fd, latFr, Math.cos(roll)*Fc, car.tyre.slipAngleLimit, V);
            let a = calculateAccelerationForR(aFL, aPL, latFr, Math.cos(roll)*Fc + calculateWeightVectorComponents(m, g, pitch, roll).lateral);
            let newVel = V+a*nodes[i-1].t;
            let FLat = Math.cos(roll)*Fc < latFr ? Math.cos(roll)*Fc : latFr;

            nodes[i].longitudinalG =a/g;
            nodes[i].lateralG =(FLat/m)/g;

            nodes[i].brake = 0;
            nodes[i].throttle = calculatePedalInput(m, Fd, aPL, a);

            nodes[i].P = P;
            nodes[i].energyOnPowerKJ = P*(nodes[i].throttle/100)*t;
            nodes[i].energyOnBrakeKJ = 0;

            if(!newVel){
                newVel = V;
            }

            nodes[i].wheelsAngle = wheelsAngleFromR(nodes[i].r, nodes[i-1].x, nodes[i-1].z, nodes[i].x, nodes[i].z, nodes[i+1].x, nodes[i+1].z, latFr, Math.cos(roll)*Fc, car.tyre.slipAngleLimit);

            if (newVel <= nodes[i].V){
                nodes[i].V = newVel;
            }else if(newVel > nodes[i].V){
                calculateDeceleration(car, nodes, i);
            }
        }
        return nodes;
    }


    //line length
    let totalDistance = 0;
    for(let i=0; i < data.length-1; i++){
        if(data[i].d) totalDistance += data[i].d;
    }


    let simulatedLap = { 
        nodes: deepCopyOf(data),
        car: deepCopyOf(SimCar),
        airDensity: airDens,
        trackGrip: trackGrip,
        simulationStartVelocity: simulationStartVelocity,
        lengthInMeters: totalDistance,
        g: g
    }

    if(simulatedLap.car.gearBox.gears[simulatedLap.car.gearBox.gears.length-1]/3.6 < terminalVel) terminalVel = simulatedLap.car.gearBox.gears[simulatedLap.car.gearBox.gears.length-1]/3.6;

    simulatedLap.nodes = simulateLap(simulatedLap.nodes, simulatedLap.car);

    //gear and rpm calculation
    for(let i=0; i < simulatedLap.nodes.length-1; i++){
        let j = 0;
        while(simulatedLap.car.gearBox.gears[j] < simulatedLap.nodes[i].V*3.6 && j < simulatedLap.car.gearBox.gears.length-1){
            j++;
        }
        simulatedLap.nodes[i].gear = j;

        let sV = simulatedLap.car.gearBox.gears[j-1];
        let eV = simulatedLap.car.gearBox.gears[j];

        let minRPM = j <= 1 ? simulatedLap.car.gearBox.RPM.idle : simulatedLap.car.gearBox.RPM.min;
        let maxRPM = j >= simulatedLap.car.gearBox.gears.length-1 ? simulatedLap.car.gearBox.RPM.max : simulatedLap.car.gearBox.RPM.shift;

        let deltRPM = maxRPM - minRPM;

        let deltV = eV - sV;

        let Vp = 100*(simulatedLap.nodes[i].V*3.6 - sV)/deltV;

        simulatedLap.nodes[i].RPM = (deltRPM)/100 * Vp + minRPM + getRandomInt(-simulatedLap.car.gearBox.RPM.variation, simulatedLap.car.gearBox.RPM.variation);
    }


    //telemetry cleaning and smoothing

    function bezierCurveSmoothing3(p1, p2, p3, tValue){
        return (1-tValue)**2*p1 + 2*(1-tValue)*tValue*p2 + tValue**2*p3;
    }


    let tValue = 0.1;  //value between 1- & 0+ (the lower it is the smoother it gets)
    for(let i=2; i < simulatedLap.nodes.length-1; i++){

        //steering inputs cleaning and smoothing
        if(simulatedLap.nodes[i-1].wheelsAngle == -simulatedLap.nodes[i-2].wheelsAngle && simulatedLap.nodes[i-1].wheelsAngle == -simulatedLap.nodes[i].wheelsAngle){
            simulatedLap.nodes[i-1].wheelsAngle = simulatedLap.nodes[i].wheelsAngle;
        }

        simulatedLap.nodes[i-1].wheelsAngle = bezierCurveSmoothing3(simulatedLap.nodes[i-2].wheelsAngle, simulatedLap.nodes[i-1].wheelsAngle, simulatedLap.nodes[i].wheelsAngle, tValue);

        //Throttle and brake smoothing
        if(simulatedLap.nodes[i].brake == 0) simulatedLap.nodes[i-1].throttle = bezierCurveSmoothing3(simulatedLap.nodes[i-2].throttle, simulatedLap.nodes[i-1].throttle, simulatedLap.nodes[i].throttle, 0.2);
        if(simulatedLap.nodes[i].throttle == 0) simulatedLap.nodes[i-1].brake = bezierCurveSmoothing3(simulatedLap.nodes[i-2].brake, simulatedLap.nodes[i-1].brake, simulatedLap.nodes[i].brake, tValue);
    }

    //Lateral G force direction
    for(let i=0; i < simulatedLap.nodes.length-1; i++){
        simulatedLap.nodes[i].lateralG *= simulatedLap.nodes[i].wheelsAngle <= 0 ? 1 : -1;
    }

    //G smoothing
    for(let i=2; i < simulatedLap.nodes.length-1; i++){
        simulatedLap.nodes[i-1].longitudinalG = bezierCurveSmoothing3(simulatedLap.nodes[i-2].longitudinalG, simulatedLap.nodes[i-1].longitudinalG, simulatedLap.nodes[i].longitudinalG, tValue);
        simulatedLap.nodes[i-1].lateralG = bezierCurveSmoothing3(simulatedLap.nodes[i-2].lateralG, simulatedLap.nodes[i-1].lateralG, simulatedLap.nodes[i].lateralG, tValue);
    }

    simulatedLap.totalTime = 0;

    for(let i=0; i < simulatedLap.nodes.length-2; i++){
        simulatedLap.totalTime += simulatedLap.nodes[i].t;
    }

    return simulatedLap;
}