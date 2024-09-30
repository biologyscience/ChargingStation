const
    VOLTAGE = document.getElementById('voltage'),
    CURRENT = document.getElementById('current'),
    POWER = document.getElementById('power'),
    ENERGY = document.getElementById('energy'),

    input = document.querySelector('input'),
    SET = document.getElementById('set'),
    RESET = document.getElementById('reset');

let energyLimit = 0;

let energy = 0;

input.value = energyLimit;

let state = false;

function ONOFF({target})
{
    const ID = target.id;

    target.classList.toggle('clicked');

    fetch('/api/onoff', { method: 'PUT', body: JSON.stringify({do: ID}), headers: {'content-type': 'application/json'} })
    .then((response) =>
    {
        if (!response.ok) return;

        target.classList.toggle('clicked'); 
    });
};

['on', 'off'].forEach((x) => document.getElementById(x).addEventListener('click', ONOFF));

function getData()
{
    const
        slaveID = 6,
        voltageAD = 40143,
        currentAD = 40151,
        powerAD = 40103,
        energyAD = 40159;

    // const requestDataArray = [];
    const requestDataArray = [ [slaveID, voltageAD], [slaveID, currentAD], [slaveID, powerAD], [slaveID, energyAD] ];

    fetch('/api/getData', { method: 'POST', body: JSON.stringify({requestDataArray}), headers: {'content-type': 'application/json'} })
    .then(x => x.json()).then((data) =>
    {
        if (data.error !== null) return console.log(data.error);

        const slave = data[`slave${slaveID}`];

        VOLTAGE.innerHTML = slave[voltageAD].toFixed(2);
        CURRENT.innerHTML = slave[currentAD].toFixed(2);
        POWER.innerHTML = slave[powerAD].toFixed(2);
        ENERGY.innerHTML = slave[energyAD].toFixed(2);

        energy = slave[energyAD].toFixed(2);

        if ((energy >= energyLimit) && (energyLimit !== 0) && (state === true))
        {
            document.getElementById('off').click();
            state = false;
        }
    });
};

setInterval(getData, 2000);

SET.addEventListener('click', () =>
{
    energyLimit = parseInt(input.value);
    document.getElementById('on').click();
    state = true;

    const message = document.getElementById('message');

    message.innerHTML = `Supply will cut-off after reaching ${energyLimit} kWh`;

    message.classList.add('visible');
    setTimeout(() => { message.classList.remove('visible') }, 3000);
});