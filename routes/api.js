const express = require('express');

const { toggleSSR } = require('../hardware/SSR');
const { Modbusv2 } = require('../hardware/modbus/Modbusv2');

Modbusv2.init({ path: '/dev/ttyAMA0', baudRate: 9600, timeout: 50 });

const api = express.Router();

api.put('/onoff', (request, response) =>
{
    const toDo = request.body.do;

    toggleSSR((toDo === 'on') * 1);

    response.sendStatus(200);
});

api.get('/getData', (request, response) =>
{
    const { requestDataArray } = request.body;

    Modbusv2.getResponses(requestDataArray).then((responses) =>
    {
        const result = {};

        responses.forEach((x) =>
        {
            if (result[`slave${x.request.slaveID}`] === undefined) result[`slave${x.request.slaveID}`] = {};

            result[`slave${x.request.slaveID}`][x.request.rawAddress] = x.response;
        });

        response.json(result);
    });
});

module.exports = api;