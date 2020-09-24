const Alpaca = require('@alpacahq/alpaca-trade-api');
const MeanReversion = require('./strategies/mean-reversion');
const fs = require('fs');

const alpacaConfig = {
    keyId: process.env.ALPACA_KEY_ID,
    secretKey: process.env.ALPACA_SECRET_KEY,
    paper: true,
    usePolygon: false
}

let stocks = fs.readFileSync('stocks.txt').toString().replace('\r', '');
let stocksString = stocks.replace('\n', ', ');
stocks = stocks.split("\n");
console.log(`Using stocks: ${stocksString}`);

const alpaca = new Alpaca(alpacaConfig);
const client = alpaca.data_ws;

alpaca.getAccount().then((account) => {
    console.log('Current Account:', account)
})

client.onConnect(function() {
    console.log("Connected")
    client.subscribe(['SPY']) // when using alpaca ws
    let mr = new MeanReversion(alpaca, 'SPY');
    mr.run();
})
client.onDisconnect(() => {
    console.log("Disconnected")
})
client.onStateChange(newState => {
    console.log(`State changed to ${newState}`)
})
client.onStockTrades(function(subject, data) {
    console.log(`Stock trades: ${subject}, price: ${data.price}`)
})
client.onStockQuotes(function(subject, data) {
    console.log(`Stock quotes: ${subject}, bid: ${data.bidprice}, ask: ${data.askprice}`)
})
client.onStockAggSec(function(subject, data) {
    console.log(`Stock agg sec: ${subject}, ${data}`)
})
client.onStockAggMin(function(subject, data) {
    console.log(`Stock agg min: ${subject}, ${data}`)
})
client.connect()