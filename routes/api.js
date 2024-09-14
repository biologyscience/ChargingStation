const express = require('express');

const { toggleSSR } = require('../hardware/SSR');
const getData = require('../hardware/getData');

const api = express.Router();

api.put('/onoff', (request, response) =>
{
    const toDo = request.body.do;

    toggleSSR((toDo === 'on') * 1);

    response.sendStatus(200);
});

api.get('/getData', (request, response) =>
{
    /*
    const slaveID = 5;

    const
        voltageAD = 43927,
        currentAD = 43929,
        powerAD = 43919,
        energyAD = 43961;

    getData(slaveID, [voltageAD, currentAD, powerAD, energyAD])
    .then((data) =>
    {
        console.log(data);

        const values =
        {
            voltage: data[voltageAD],
            current: data[currentAD],
            power: data[powerAD],
            energy: data[energyAD]
        };

        response.json(values);
    })
    .catch(console.log);
    */

    const voltage = Math.random() * 30;
    const current = Math.random() * 30;
    const power = voltage * current;
    const energy = power * 1.21;

    response.json({voltage, current, power, energy});
});

module.exports = api;