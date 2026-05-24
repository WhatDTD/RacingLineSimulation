window.addEventListener('load', () => {
    const createCarButton = document.querySelector('#createCarButton');
    createCarButton.addEventListener('click', () => {
        location.href = 'createCar';
    });

    const createLineButton = document.querySelector('#createLineButton');
    createLineButton.addEventListener('click', () => {
        location.href = 'createLine';
    });

    const createSimulationButton = document.querySelector('#createSimulationButton');
    createSimulationButton.addEventListener('click', () => {
        location.href = 'createSimulation';
    });

    const viewSimulationButton = document.querySelector('#viewSimulationButton');
    viewSimulationButton.addEventListener('click', () => {
        location.href = 'viewSimulation';
    });

    const host = window.location.hostname;
    let root = "";
    if (host !== 'localhost' && host !== '127.0.0.1') {
        root = '/RacingLineSimulation';
    } 

    const whatdtdIcon = document.querySelector('#whatdtdIcon');
    whatdtdIcon.src = `${root}/assets/WhatDTDWhite.svg`

    const github = document.querySelector('#githubIcon');
    github.src = `${root}/assets/githubIcon.png`
    github.addEventListener('click', () => {
        window.open('https://github.com/WhatDTD/RacingLineSimulation/');
    });
    github.style.cursor = 'pointer';

    const downloadExample = document.querySelector('#downloadExample');
    downloadExample.addEventListener('click', () => {
        const slowSim = document.createElement('a');
        slowSim.href = `${root}/assets/example.zip`;
        slowSim.download = '';
        slowSim.click();
    });
});