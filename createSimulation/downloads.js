function assignListenersToDownloadBtns(){
    downloadSimulationBtn = document.querySelector("#downloadSim");
    downloadCsvBtn = document.querySelector("#downloadCsv");


    downloadSimulationBtn.addEventListener("click", (e) =>{
        downloadLineJson(simulatedLap);
    });

    downloadCsvBtn.addEventListener("click", (e) => {
        console.log(simulatedLap);
        downloadFileCsv(simulationToCsv(simulatedLap));
    });
}



function allowDownloads(value){
    if(downloadSimulationBtn && downloadCsvBtn){
        if(value){
            if(downloadSimulationBtn.hasAttribute("disabled")) downloadSimulationBtn.removeAttribute("disabled");
            if(downloadCsvBtn.hasAttribute("disabled")) downloadCsvBtn.removeAttribute("disabled");
        }else{
            downloadSimulationBtn.setAttribute("disabled", true);
            downloadCsvBtn.setAttribute("disabled", true);
        }
    }
}


function simulationToCsv(simulation){
    let csv = "x;y;z;d;r;t;Distance m;Time s;LimitSpeed Km/h;Speed Km/h;Brake;Throttle;Gear;RPM;WheelsAngle Deg;latG;longG;Total Time s;Line Length m\r\n"

    let first = true;

    let distance = 0;
    let time = 0;

    let kmh = 3.6;
    let deg = 57.2958;

    for(let i=0; i < simulatedLap.nodes.length-2; i++){

        csv +=

        decStringWithComma(simulatedLap.nodes[i].x, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].y, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].z, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].d, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].r, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].t, 3)+";"+
        decStringWithComma(distance, 3)+";"+
        decStringWithComma(time, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].limitSpeed*kmh, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].V*kmh, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].brake, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].throttle, 3)+";"+
        simulatedLap.nodes[i].gear+";"+
        decStringWithComma(simulatedLap.nodes[i].RPM, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].wheelsAngle*deg, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].lateralG, 3)+";"+
        decStringWithComma(simulatedLap.nodes[i].longitudinalG, 3)+
        (first ? ";"+decStringWithComma(simulatedLap.totalTime, 3) : "")+
        (first ? ";"+decStringWithComma(simulatedLap.lengthInMeters, 3) : "");
        

        csv += "\r\n";

        first = false;

        distance += simulatedLap.nodes[i].d;
        time += simulatedLap.nodes[i].t;
    }

    return csv;
}



function decStringWithComma(num, dec){
    num = num.toFixed(dec);
    let str = "";
    
    for(let i = 0; i < num.length; i++){
        if(num[i]){
            if(num[i] === "."){
                str += ",";
            }else{
                str += num[i];
            }
        }
    }

    return str;
}


function downloadLineJson(obj){
    const json = JSON.stringify(obj, null, 2);
    const blob = new Blob(
      [json],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = car.manufacture+"_"+car.model+"_"+trackName+".RLSsim";
    a.click();
    URL.revokeObjectURL(url);
}


function downloadFileCsv(csv){
    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = car.manufacture+"_"+car.model+"_"+trackName+".csv";
      a.click();
      URL.revokeObjectURL(url);
}