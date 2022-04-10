const Base = require('./base')
const { wsHandlers } = require('../helpers/utils')

class Trade extends Base {
    constructor(httpClient, wsClient, logger, symbol) {
        super(httpClient, wsClient, logger)
        this.symbol = symbol
    }

    async openStream() {
        const callbacks = {
            "message": (data) => {
                data = JSON.parse(data.toString())
                this.latencies.push(Date.now() - parseInt(data["E"]))
            },
            "error": (err) => {
                this.logger.error(err)
            }
        }

        await this.wsClient
            .open(`${this.symbol.toLowerCase()}@trade`, `${this.symbol} stream`)
            .then(ws => wsHandlers(ws, callbacks))
    }

    closeStream() {
        this.logger.info(`The ws connection for the ${this.symbol} is going to be closed`)
        this.wsClient.close()
    }

    showLatencies() {
        this.logger.info(`---- Latencies for ${this.symbol} Websocket ----`)
        super.showLatencies()
        this.logger.info("---- End of Latencies ----")
    }

}

module.exports = Trade