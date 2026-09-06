function calculateLap(SimCar, data, simulationStartVelocity, airDens, trackGrip){

    const initialCarGrip = SimCar.FrC;
    SimCar.FrC *= trackGrip;
    let tls = SimCar.tls;
    let constantLoad = SimCar.constantLoad;


    //FORMULAS

    //Src Mdn
    function getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
    }


    const timeError = 0/100;

    //Lift Force
    function calculateLiftForce(p, V, Cl, A, constantLoad){
        return p/2 * (V**2) *(Cl * -1) * A + constantLoad;
    }


    //Normal Force
    function calculateNormalForce(m, g, Fl, Fc, roll){
        return m*g*Math.cos(roll) + Fc * Math.sin(roll) + Fl;
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


    //Power Limited Acceleration
    function calculateAccelerationPL(m, P, Fd, V){
        let f = ((P * 1000) - Fd * V)/(m * V);
        return f;
    }

    //Maximum acceleration trought a turn of radius r
    function calculateAccelerationForR(m, aFL, aPL, Fr, Fc){
        let a = aFL < aPL ? aFL : aPL; //the lowest acceleration is maximum possible
        let FLat = Fc < Fr ? Fc : Fr; //the lowest between the Friction force and the Centripetal force is the maximum possible
        let FLatNorm = FLat/Fr;
        return Math.sin(Math.acos(FLatNorm))*a; //calculation of the grip circle
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

    //wheels angle from radius
    function wheelsAngleFromR(r, x0, y0, x1, y1, x2, y2, Fr, Fc, slipAngleLimit){
    
        let xA = x1 - x0;
        let yA = y1 - y0;
        let aA = Math.atan2(yA, xA);
    
        let xB = x2 - x1;
        let yB = y2 - y1;
        let aB = Math.atan2(yB, xB);
    
        let diff = aB - aA;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
    
        let dir = diff < 0 ? 1 : -1;
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
    function calculateDeceleration(car, tyreFrC, list, endPoint) {
        let i = endPoint - 1;
        let brakingSamples = 0;
        let brakingDistance = 0;

        let m = car.mass;
        let FrC = tyreFrC;
        let Bp = car.brakingPower;
        let Cd = car.Cd;
        let Cl = car.Cl;
        let A = car.A;

        while (list[i].V > list[i+1].V) {
            let V = list[i+1].V;
            let Fl = calculateLiftForce(airDens, V, Cl, A, constantLoad);
            let Fc = calculateCentripetalForce(m, V, list[i].r);
            let N = calculateNormalForce(m, g, Fl, Fc, 0);
            let realFrC = calculateFrictionCoefficientOnLoad(m, g, N, FrC, tls);
            let Fr = calculateFrictionForce(realFrC, N);
            let Fd = calculateDragForce(airDens, V, Cd, A);
            let aFL = calculateAccelerationFL(m,Fr);
            let aBL = calculateAccelerationPL(m, Bp, -Fd, V);
            let a = calculateAccelerationForR(m, aFL, aBL, Fr, Fc);
            let FLat = Fc < Fr ? Fc : Fr;

            simulatedLap.nodes[i].longitudinalG =-a/g;
            simulatedLap.nodes[i].lateralG =(FLat/m)/g;

            simulatedLap.nodes[i].throttle = 0;
            simulatedLap.nodes[i].brake = calculatePedalInput(m, Fd, aBL, a);

            let t = list[i].d/V;
            t = t-t*timeError; //to account for the time error
            let newSpeed = list[i+1].V + a*t;
            if (newSpeed < list[i].V) {
                list[i].V = newSpeed;
                list[i].t = t;
            }

            simulatedLap.nodes[i].wheelsAngle = wheelsAngleFromR(simulatedLap.nodes[i].r, simulatedLap.nodes[i-1].x, simulatedLap.nodes[i-1].z, simulatedLap.nodes[i].x, simulatedLap.nodes[i].z, simulatedLap.nodes[i+1].x, simulatedLap.nodes[i+1].z, Fr, Fc, car.slipAngleLimit);

            i--;
            brakingSamples++;
            brakingDistance += list[i].d;
        }

        let BrakingData={maxSpeed: list[i], samples: brakingSamples, distance: brakingDistance};
        return BrakingData;
    }

    //line length test
    let totalDistance = 0;
    for(let i=0; i < data.length-1; i++){
        if(data[i].d) totalDistance += data[i].d;
    }

    //console.log("Line Length in m: "+totalDistance);


    let simulatedLap = { 
        nodes: data,
        car: JSON.parse(JSON.stringify(SimCar)),
        airDensity: airDens,
        trackGrip: trackGrip,
        simulationStartVelocity: simulationStartVelocity,
        lengthInMeters: totalDistance
    }

    if(simulatedLap.car.gearBox.gears[simulatedLap.car.gearBox.gears.length-1]/3.6 < terminalVel) terminalVel = simulatedLap.car.gearBox.gears[simulatedLap.car.gearBox.gears.length-1]/3.6;

    //limits pass
    const limitSpeed = [];
    for(let i=0; i < data.length; i++){
        simulatedLap.nodes[i].V = maxVelforR(simulatedLap.car.mass, g, data[i].r, simulatedLap.car.FrC, tls, simulatedLap.car.Cl, simulatedLap.car.A, airDens, constantLoad, 0, terminalVel);
        limitSpeed.push(simulatedLap.nodes[i].V);
        simulatedLap.nodes[i].limitSpeed = simulatedLap.nodes[i].V;
    }

    //actual lap simulation
    simulatedLap.nodes[0].V = simulationStartVelocity ? simulationStartVelocity/3.6 : simulatedLap.car.FrC * g / simulatedLap.nodes[0].d;
    simulatedLap.nodes[0].lateralG = 0;
    simulatedLap.nodes[0].longitudinalG = simulatedLap.car.FrC;
    simulatedLap.nodes[0].throttle = 100;
    simulatedLap.nodes[0].brake = 0;
    simulatedLap.nodes[0].wheelsAngle = 0;
    for(let i=1; i < simulatedLap.nodes.length-1; i++){
        let V = simulatedLap.nodes[i-1].V;
        let t = simulatedLap.nodes[i-1].d/V;
        simulatedLap.nodes[i-1].t = t-t*timeError;  //to account for the time error

        let m = simulatedLap.car.mass;
        let P = simulatedLap.car.Power;
        let FrC = simulatedLap.car.FrC;
        let roll = 0;
        let Cd = simulatedLap.car.Cd;
        let Cl = simulatedLap.car.Cl;
        let p = simulatedLap.airDensity;
        let A = simulatedLap.car.A;
        let Fl = calculateLiftForce(p, V, Cl, A, constantLoad);

        let Fc = calculateCentripetalForce(m, V, simulatedLap.nodes[i].r);

        let N = calculateNormalForce(m, g, Fl, Fc, roll);

        let Fd = calculateDragForce(p, V, Cd, A);

        let realFrC = calculateFrictionCoefficientOnLoad(m, g, N, FrC, tls);

        let Fr = calculateFrictionForce(realFrC, N);

        let aFL = calculateAccelerationFL(m, Fr);

        let aPL = calculateAccelerationPL(m, P, Fd, V);

        let a = calculateAccelerationForR(m, aFL, aPL, Fr, Fc);

        let newVel = V+a*simulatedLap.nodes[i-1].t; //to account for the time error

        let FLat = Fc < Fr ? Fc : Fr;

        simulatedLap.nodes[i].longitudinalG =a/g;
        simulatedLap.nodes[i].lateralG =(FLat/m)/g;

        simulatedLap.nodes[i].brake = 0;
        simulatedLap.nodes[i].throttle = calculatePedalInput(m, Fd, aPL, a);

        if(!newVel){
            newVel = V;
        }

        simulatedLap.nodes[i].wheelsAngle = wheelsAngleFromR(simulatedLap.nodes[i].r, simulatedLap.nodes[i-1].x, simulatedLap.nodes[i-1].z, simulatedLap.nodes[i].x, simulatedLap.nodes[i].z, simulatedLap.nodes[i+1].x, simulatedLap.nodes[i+1].z, Fr, Fc, simulatedLap.car.slipAngleLimit);

        if (newVel <= simulatedLap.nodes[i].V){
            simulatedLap.nodes[i].V = newVel;
        }else if(simulatedLap.nodes[i].V != terminalVel && newVel > simulatedLap.nodes[i].V){
            calculateDeceleration(simulatedLap.car, simulatedLap.car.FrC, simulatedLap.nodes, i);
        }
    }

    //gear and rpm calculation
    for(let i=0; i < simulatedLap.nodes.length-1; i++){
        let j = 0;
        while(simulatedLap.car.gearBox.gears[j] < simulatedLap.nodes[i].V*3.6){
            j++;
        }
        simulatedLap.nodes[i].gear = j;
        let gear = j;

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

    //console.log("Time: "+simulatedLap.totalTime);

    SimCar.FrC = initialCarGrip;
    return simulatedLap;
}