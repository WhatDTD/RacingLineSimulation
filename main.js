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
        location.href = 'createLine';
    });

    const viewSimulationButton = document.querySelector('#viewSimulationButton');
    viewSimulationButton.addEventListener('click', () => {
        location.href = 'viewSimulation';
    });
});