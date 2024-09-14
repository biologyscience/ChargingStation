const express = require('express');
const os = require('os');

const
    port = 3000,
    ip = os.networkInterfaces()['wlan0'].filter(x => x.family === 'IPv4')[0].address;
    // windows = 'Wi-Fi'
    // linux = 'wlan0'

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/assets'));
app.use(express.json());
app.use('/api', require('./routes/api'));

app.get('/', (request, response) =>
{
    response.render('main');
});

app.once('ready', () =>
{
    require('./hardware/SSR').resetGPIO();

    console.log(`Serving at: ${ip}:${port}`);
});

app.listen(port, ip, () => app.emit('ready'));