const { SerialPort } = require('serialport');

const { crc16modbus } = require('crc');

class Modbus
{
    #requests = [];
    #responses = [];
    #recieved = false;
    #requestToSend = undefined;

    constructor(path, baudRate, slaveID, timeout)
    {
        this.slaveID = slaveID;
        this.timeout = timeout;

        this.serialPort = new SerialPort({ path, baudRate, autoOpen: false });

        this.serialPort.on('open', () => console.log('opened'));
        this.serialPort.on('close', () => console.log('closed'));
        this.serialPort.on('error', console.log);

        this.serialPort.on('data', (responseBuffer) =>
        {
            if (this.#requestToSend.equals(responseBuffer)) return;
            
            this.#recieved = true;

            const response = this.#decodeResponse(responseBuffer);

            const toPush = { request: this.#requestToSend, response };

            if (response.crc !== response.crcCalculated) toPush.reason = 'CRC Error';

            this.#responses.push(toPush);
        });
    }

    // FC 03 ONLY - READ HOLDING REGISTERS
    setRequest(rawAddress, quantity)
    {
        const buffs =
        {
            slave: Buffer.from([this.slaveID], 'HEX'),
            fc: Buffer.from([3], 'HEX'),
            address: Buffer.from((rawAddress - 40001).toString(16).padStart(4, '0'), 'HEX'),
            quantity: Buffer.from((quantity).toString(16).padStart(4, '0'), 'HEX')
        };
    
        const info = Buffer.concat([buffs.slave, buffs.fc, buffs.address, buffs.quantity]);
    
        const crc = Buffer.from(crc16modbus(info).toString(16), 'HEX').reverse();
    
        const request = Buffer.concat([info, crc]);

        this.#requests.push(request);

        return this;
    };

    setRequests(array)
    {
        array.forEach(x => this.setRequest(x[0], x[1]));

        return this;
    };

    async getResponses()
    {
        if (this.#requests.length === 0) return console.error('No requests are set');

        this.serialPort.open();

        await this.#portOpened();

        while (this.#requests.length !== 0)
        {
            this.#requestToSend = this.#requests.reverse().pop();
        
            this.serialPort.write(this.#requestToSend, 'HEX');
        
            this.#requests.reverse();
        
            await wait(this.timeout);
        
            if (this.#recieved) this.#recieved = false;
            else this.#responses.push({request: this.#requestToSend, response: null, reason: 'Device did not reply'});
        };
        
        const copyResponses = [...this.#responses];
        
        this.#cleanup();
        
        return copyResponses; 
    };

    #decodeResponse(bufferData)
    {
        const
            slaveID = bufferData.subarray(0, 1).readUInt8(),
            fc = bufferData.subarray(1, 2).readUInt8(),
            totalDataBytes = bufferData.subarray(2, 3).readUInt8();
    
        let i = 3 + totalDataBytes;

        const reorder = [];

        while (i > 3)
        {
            reorder.push(bufferData.subarray(i - 2, i));

            i -= 2;
        }

        let data = Buffer.from([]);

        reorder.forEach(x => data = Buffer.concat([data, x]));

        const value = data.readFloatBE();

        const
            crcOffset = 3 + totalDataBytes,
            crc = bufferData.subarray(crcOffset, crcOffset + 2).readUInt16LE(),
            crcCalculated = crc16modbus(bufferData.subarray(0, -2));

        return { slaveID, fc, totalDataBytes, value, crc, crcCalculated }; 
    };

    #portOpened()
    {
        return new Promise((resolve) =>
        {
            let int = setInterval(() =>
            {
                if (this.serialPort.isOpen)
                {
                    resolve(true);

                    clearInterval(int);
                }
            });
        });
    };

    #cleanup()
    {
        this.#requests = [];
        this.#responses = [];
        this.#recieved = false;
        this.#requestToSend = undefined;

        this.serialPort.close();
    };
};

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

module.exports = { Modbus, wait };