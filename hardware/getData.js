const { Modbusv2 } = require('./modbus/Modbusv2');

Modbusv2.init({ path: '/dev/ttyAMA0', baudRate: 9600, timeout: 50 });

/**
 * @param {Array<[slaveID, rawAddress, quantity]>} xyz 
 * quantity defaults to 2, if given undefined
 * @returns 
 */
function getData(xyz)
{
    return new Promise((resolve, reject) =>
    {
        const data = [];

        Modbusv2.getResponses(xyz).then(x => data.push(x.response.value));

        resolve(data);
    });
};

module.exports = getData;