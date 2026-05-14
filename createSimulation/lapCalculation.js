function calculateLap(SimCar, data, simulationStartVelocity, airDens, trackGrip){

    const initialCarGrip = SimCar.FrC;
    SimCar.FrC *= trackGrip;


    //FORMULAS

    //Src Mdn
    function getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
    }


    const timeError = 9/100;

    //Lift Force
    function calculateLiftForce(p, V, Cl, A){
        return p/2 * (V**2) *(Cl * -1) * A;
    }


    //Normal Force
    function calculateNormalForce(m, g, Fl, FrC, roll){
        return (m*g+Fl)/(Math.cos(roll) - FrC * Math.sin(roll));
    }


    //Centripetal Force
    function calculateCentripetalForce(m, V, r){
        return (m*(V**2))/r;
    }


    //Friction Force
    function calculateFrictionForce(FrC, roll, N){
        return N*(Math.sin(roll) + FrC * Math.cos(roll));
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
        return f < 0 ? (P/(m*V)) : f;
    }

    //Maximum acceleration trought a turn of radius r
    function calculateAccelerationForR(m, aFL, aPL, Fr, Fc){
        let a = aFL < aPL ? aFL : aPL;
        let FLat = Fc < Fr ? Fc : Fr;
        let FLatNorm = FLat/Fr;
        return Math.sin(Math.cos(FLatNorm))*a;
    }

    //terminal velocity
    function calculateTerminalVel(P, p, Cd, A){
        return Math.cbrt(
                        (2*(P*1000))/   //*1000 to convert from Kw to W
                        (p*Cd*A));
    }

    //Maximum Velocity trought a turn af radius r
    function maxVelforR(m, g, r, FrC, Cl, A, p, roll, AltSpeed){

        Cl *= -1;
        
        let den = (2*m*(Math.cos(roll) - FrC * Math.sin(roll)) - p*Cl*A*r*(Math.sin(roll) + FrC * Math.cos(roll)));

        if(den == 0 || (2*r*m*g*(Math.sin(roll) + FrC * Math.cos(roll)))/den < 0){
            return AltSpeed;
        }else{
            let res = Math.sqrt(
                            (2*r*m*g*(Math.sin(roll) + FrC * Math.cos(roll)))/den
                        );
            return res < terminalVel ? res : terminalVel;
            }
    }

    //radius from Velocity
    function radiusFromVelocity(m, Fl, V, FrC, roll){
        return (2*(V**2)*m*(Math.cos(roll)-FrC*Math.sin(roll)))/
                ((2*m*g+2*Fl)*(Math.sin(roll)+FrC*Math.cos(roll)));
    }

    //wheels angle from radius
    function wheelsAngleFromR(r, rV, x0, y0, x1, y1, x2, y2){  //x and y in 2d space from top view
        let slipAngleMultiplier = 3;

        let xA = Math.abs(x1) - Math.abs(x0);
        let yA = Math.abs(y1) - Math.abs(y0);
        let aA = Math.atan(yA/xA);

        let xB = Math.abs(x2) - Math.abs(x1);
        let yB = Math.abs(y2) - Math.abs(y1);
        let aB = Math.atan(yB/xB);

        let dir = aB < aA ? -1 : 1;

        let rFinal = rV < r ? rV : r;

        return Math.atan(2/rFinal)*dir * slipAngleMultiplier;
    }

    //throttle/brake percentage
    function calculatePedalInput(m, Fd, aPL, a){
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

        while (list[i].V >= list[i+1].V) {
            let V = list[i+1].V;
            let Fl = calculateLiftForce(airDens, V, Cl, A);
            let N = calculateNormalForce(m, g, Fl, FrC, 0);
            let Fr = calculateFrictionForce(FrC, 0, N);
            let Fc = calculateCentripetalForce(m, V, list[i].r);
            let Fd = calculateDragForce(airDens, V, Cd, A);
            let aFL = N*FrC/m;
            let aBL = calculateAccelerationPL(m, Bp, -Fd, V);
            let a = calculateAccelerationForR(m, aFL, aBL, Fr, Fc);
            let FLat = Fc < Fr ? Fc : Fr;

            simulatedLap.nodes[i].longitudinalG =-a/g;
            simulatedLap.nodes[i].lateralG =(FLat/m)/g;

            if(simulatedLap.nodes[i].V == simulatedLap.nodes[i-1].V && simulatedLap.nodes[i-1].brake != 100){
                simulatedLap.nodes[i].brake = 0;
                simulatedLap.nodes[i].throttle = calculatePedalInput(m, Fd, aBL, a);
            }else{
                simulatedLap.nodes[i].throttle = 0;
                simulatedLap.nodes[i].brake = calculatePedalInput(m, Fd, aBL, a);
            }

            let t = list[i].d/V;
            t = t-t*timeError; //to account for the time error
            let newSpeed = list[i+1].V + a*t;
            if (newSpeed < list[i].V) {
                list[i].V = newSpeed;
                list[i].t = t;
            }

            simulatedLap.nodes[i].wheelsAngle = wheelsAngleFromR(simulatedLap.nodes[i].r, radiusFromVelocity(m, Fl, simulatedLap.nodes[i].V, FrC, 0), simulatedLap.nodes[i-1].x, simulatedLap.nodes[i-1].z, simulatedLap.nodes[i].x, simulatedLap.nodes[i].z, simulatedLap.nodes[i+1].x, simulatedLap.nodes[i+1].z);

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
        simulatedLap.nodes[i].V = maxVelforR(simulatedLap.car.mass, g, data[i].r, simulatedLap.car.FrC, simulatedLap.car.Cl, simulatedLap.car.A, airDens, 0, terminalVel);
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
        let Fl = calculateLiftForce(p, V, Cl, A);

        let N = calculateNormalForce(m, g, Fl, FrC, roll);

        let Fd = calculateDragForce(p, V, Cd, A);

        let Fr = calculateFrictionForce(FrC, roll, N);

        let aFL = calculateAccelerationFL(m, Fr);

        let Fc = calculateCentripetalForce(m, V, simulatedLap.nodes[i].r);

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

        simulatedLap.nodes[i].wheelsAngle = wheelsAngleFromR(simulatedLap.nodes[i].r, radiusFromVelocity(m, Fl, simulatedLap.nodes[i].V, FrC, 0), simulatedLap.nodes[i-1].x, simulatedLap.nodes[i-1].z, simulatedLap.nodes[i].x, simulatedLap.nodes[i].z, simulatedLap.nodes[i+1].x, simulatedLap.nodes[i+1].z);

        if (newVel <= simulatedLap.nodes[i].V){ 
            simulatedLap.nodes[i].V = newVel
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


    let tValue = 0.11;  //value between 1- & 0+ (the lower it is the smoother it gets)
    for(let i=2; i < simulatedLap.nodes.length-1; i++){

        //steering inputs cleaning and smoothing
        if(simulatedLap.nodes[i-1].wheelsAngle == -simulatedLap.nodes[i-2].wheelsAngle && simulatedLap.nodes[i-1].wheelsAngle == -simulatedLap.nodes[i].wheelsAngle){
            simulatedLap.nodes[i-1].wheelsAngle = simulatedLap.nodes[i].wheelsAngle;
        }

        simulatedLap.nodes[i-1].wheelsAngle = bezierCurveSmoothing3(simulatedLap.nodes[i-2].wheelsAngle, simulatedLap.nodes[i-1].wheelsAngle, simulatedLap.nodes[i].wheelsAngle, tValue);
    }

    //Lateral G force direction
    for(let i=0; i < simulatedLap.nodes.length-1; i++){
        simulatedLap.nodes[i].lateralG *= simulatedLap.nodes[i].wheelsAngle <= 0 ? 1 : -1;
    }

    simulatedLap.totalTime = 0;

    for(let i=0; i < simulatedLap.nodes.length-2; i++){
        simulatedLap.totalTime += simulatedLap.nodes[i].t;
    }

    //console.log("Time: "+simulatedLap.totalTime);

    SimCar.FrC = initialCarGrip;
    return simulatedLap;
}