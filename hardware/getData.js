const { default: ModbusRTU } = require('modbus-serial');

const slave = new ModbusRTU();

slave.setTimeout(2000);

function getData(slaveID, addresses)
{
    return new Promise((resolve, reject) =>
    {
        slave.connectRTUBuffered('/dev/ttyAMA0', { baudRate: 9600, parity: 'even' })
        .then(() =>
        {
            slave.setID(slaveID);

            const toResolve = [];
    
            addresses.forEach(x => toResolve.push(slave.readHoldingRegisters(x - 40001)));
    
            Promise.all(toResolve)
            .then((values) =>
            {
                const toSend = { slaveID };
    
                for (let i = 0; i < addresses.length; i++)
                {
                    toSend[addresses[i]] = values[i].data.join('');
                }
    
                resolve(toSend);

            }).catch(reject);

        }).catch(reject);
    });
};

module.exports = getData;