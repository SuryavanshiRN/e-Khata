const WebSocket = require('ws');


let socket;


const startStockSocket = (io) => {
socket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);


socket.on('open', () => {
console.log('Finnhub WebSocket connected');
});


socket.on('message', (data) => {
const parsed = JSON.parse(data);
if (parsed.type === 'trade') {
io.emit('stock-update', parsed.data);
}
});
};


const subscribeStock = (symbol) => {
socket.send(JSON.stringify({ type: 'subscribe', symbol }));
};


module.exports = { startStockSocket, subscribeStock };