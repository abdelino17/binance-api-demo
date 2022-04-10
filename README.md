# Binance Client API in Nodejs

This project is a demonstration of how to use the Binance API (both HTTP and Websocket) for gathering data from your SPOT account.

### Features of this project:

1. Get the balances of your SPOT account
2. Get the pairs with thee highest volume in the last 24hr
3. Open trade websockets
4. Measure websocket event time

### Usage

Install the dependencies

```bash
npm install
```

Set your apiKey, secretKey and the URLs of the endpoint into the [configuration file](src/config.js) and run the project

```bash
npm run demo
```
