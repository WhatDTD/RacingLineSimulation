const uiElements = {
    buttonsUiHtml: document.querySelector("#buttonsUi"),
    uiElementsMenuHtml: document.querySelector("#uiElementsMenu"),
    visible: true
};

window.addEventListener("keydown", (e) => {
  if (e.key == "1") {
    if(uiElements.visible){
        uiElements.buttonsUiHtml.style.display = 'none';
        uiElements.uiElementsMenuHtml.style.display = 'none';
        uiElements.visible = false;
    }else{
        uiElements.buttonsUiHtml.style.display = 'flex';
        uiElements.uiElementsMenuHtml.style.display = 'flex';
        uiElements.visible = true;
    }
  }
});



const hideMapBtn = {html: document.querySelector("#hideMap"), visible: true};
const hidePlayerBtn = {html: document.querySelector("#hidePlayer"), visible: true};
const hideStatsBtn = {html: document.querySelector("#hideStats"), visible: true};
const hideGmeterBtn = {html: document.querySelector("#hideGmeter"), visible: true};
const hideTelemetryBtn = {html: document.querySelector("#hideTelemetry"), visible: true};

hideMapBtn.html.addEventListener("click", (e)=>{
    hideShowTrackMap();
    showHideButton(hideMapBtn);
});

hidePlayerBtn.html.addEventListener("click", (e)=>{
    hideShowAnimationUiPlayer();
    showHideButton(hidePlayerBtn);
});

hideStatsBtn.html.addEventListener("click", (e)=>{
    hideShowStats();
    showHideButton(hideStatsBtn);
});

hideGmeterBtn.html.addEventListener("click", (e)=>{
    hideShowGmeter();
    showHideButton(hideGmeterBtn);
});

hideTelemetryBtn.html.addEventListener("click", (e)=>{
    hideShowTelemetry();
    showHideButton(hideTelemetryBtn);
});


function showHideButton(button){
    if(button.visible){
        button.html.style.background = "rgba(20, 22, 26, 0.3)";
        button.visible = false;
    }else{
        button.html.style.background = "rgba(20, 22, 26, 1)";
        button.visible = true;
    }
}