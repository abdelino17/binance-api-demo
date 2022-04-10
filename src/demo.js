const Logger = require('./helpers/logger')
const { Account, Market, Trade } = require('./modules')
const { generateColor } = require('./helpers/utils')
const { HttpClient, WsClient } = require('./clients')
const { INTERVAL_TRADE_WS_CHECK, INTERVAL_WS_LATENCY_CHECK, NUMBER_TICKERS } = require('./helpers/constants')
const { apiBaseUrl, apiKey, secretKey, wsBaseEndpoint } = require('./config2')

// --- Clients Init
const httpClient = new HttpClient(apiBaseUrl, apiKey, secretKey)
const wsClient = new WsClient(wsBaseEndpoint)
const color = generateColor()

const Demo = async function () {

    // --- Account Init
    accountLogger = new Logger("Account", color.next().value)
    const account = new Account(httpClient, wsClient, accountLogger)
    await account.fetchInitialBalance()
    account.showBalances()
    await account.fetchListenKey()
    // account.showListenKey()
    await account.openUserDataStream()

    // --- Market Init
    marketLogger = new Logger("Market", color.next().value)
    const market = new Market(httpClient, wsClient, marketLogger)
    await market.fetchLast24HrsTickers()
    market.showMarket()
    await market.open24HrsStream()

    // --- Trade Init
    let trades = {}
    setInterval(async () => {
        let tickers = market.sortTickers()
        let topTenSymbols = new Set(tickers.slice(0, NUMBER_TICKERS).map(([symbol, value]) => symbol))
        let tempTrades = {}
        let changes = 0

        topTenSymbols.forEach(async (symbol) => {
            if (!trades[symbol]) {
                changes += 1
                let tradeLogger = new Logger(`Trade ${symbol}`, color.next().value)
                let trade = new Trade(httpClient, wsClient, tradeLogger, symbol)
                await trade.openStream()

                tempTrades[symbol] = trade
            } else {
                tempTrades[symbol] = trades[symbol]
            }
        })

        // Clean up
        if (changes > 0) {
            Object.keys(trades).filter(symbol => !topTenSymbols.has(symbol)).forEach((symbol) => {
                trades[symbol].closeStream()
            });
        }

        trades = tempTrades
    }, INTERVAL_TRADE_WS_CHECK)

    // --- Latencies
    setInterval(() => {
        account.showLatencies()

        Object.keys(trades).forEach((symbol) => {
            trades[symbol].showLatencies()
        })
    }, INTERVAL_WS_LATENCY_CHECK)
}

module.exports = Demo