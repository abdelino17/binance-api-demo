const Base = require('./base')
const { wsHandlers } = require("../helpers/utils")

class Market extends Base {
    tickers = {}

    constructor(httpClient, wsClient, logger) {
        super(httpClient, wsClient, logger)
    }

    async fetchLast24HrsTickers() {
        const options = this.httpClient.publicRequest(
            "GET",
            "/api/v3/ticker/24hr"
        )

        await this.httpClient.executeRequest(options).then((data) => {
            this.setTickers(JSON.parse(data))
        }).catch((err) => this.logger.error(err))
    }

    setTickers(tickers) {
        for (let ticker of tickers) {
            this.tickers[ticker.symbol] = ticker.volume
        }
    }

    showMarket() {
        this.logger.info("---- Pairs / Volumes ----")
        for (const [symbol, volume] of this.sortTickers()) {
            this.logger.info(`${symbol.padStart(10, " ")} = ${volume}`)
        }
        this.logger.info("---- End of Pairs / Volumes ----")
    }

    sortTickers() {
        return Object.entries(this.tickers).sort((a, b) => b[1] - a[1])
    }

    async open24HrsStream() {
        const callbacks = {
            "message": (data) => {
                data = data.toString()
                let response = JSON.parse(data)

                this.logger.info("There was an update on the market.")
                this.setTickers(response.map(ticker => ({ symbol: ticker.s, volume: ticker.v })))
                // this.showMarket()
            },
            "error": (err) => {
                this.logger.error(err)
            }
        }

        await this.wsClient
            .open("!miniTicker@arr", "24hr market stream")
            .then(ws => wsHandlers(ws, callbacks))
    }
}

module.exports = Market