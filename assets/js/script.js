const
    VOLTAGE = document.getElementById('voltage'),
    CURRENT = document.getElementById('current'),
    POWER = document.getElementById('power'),
    ENERGY = document.getElementById('energy'),

    input = document.querySelector('input'),
    SET = document.getElementById('set'),
    RESET = document.getElementById('reset');

let energyLimit = 0;

input.value = energyLimit;

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
    fetch('/api/getData', { method: 'GET' }).then(x => x.json()).then((data) =>
    {
        const { voltage, current, power, energy } = data;

        VOLTAGE.innerHTML = voltage.toFixed(2);
        CURRENT.innerHTML = current.toFixed(2);
        POWER.innerHTML = power.toFixed(2);
        ENERGY.innerHTML = energy.toFixed(2);

        if ((energy >= energyLimit) && (energyLimit !== 0)) document.getElementById('off').click();
        
    }).catch(console.error);
};

getData();
setInterval(getData, 1000);

SET.addEventListener('click', () =>
{
    energyLimit = parseInt(input.value);
    document.getElementById('on').click();
});