const Base = require('./base')
const { EVENT_ACCOUNT_POSITION } = require('../helpers/constants')
const { wsHandlers } = require('../helpers/utils')

class Account extends Base {
    balances = {}
    listenKey = ""

    constructor(httpClient, wsClient, logger) {
        super(httpClient, wsClient, logger)
        this.latencies = []
    }

    async fetchInitialBalance() {
        let parameters = {
            "timestamp": Date.now()
        }

        const options = this.httpClient.privateRequest(
            "GET",
            "/api/v3/account",
            parameters
        )

        await this.httpClient.executeRequest(options).then((data) => {
            this.setBalances(JSON.parse(data).balances)
        }).catch((err) => this.logger.error(err))
    }

    setBalances(balances) {
        for (let balance of balances.sort((b1, b2) => b2.free - b1.free)) {
            this.balances[balance.asset] = balance.free
        }
    }

    showBalances() {
        this.logger.info("---- Spot Account Balances ----")
        for (const [asset, free] of Object.entries(this.balances)) {
            if (free > 0)
                this.logger.info(`${asset.padStart(10, " ")} = ${free}`)
        }
        this.logger.info("---- End of Spot Account ----")
    }

    async fetchListenKey() {
        const options = this.httpClient.privateRequest(
            "POST",
            "/api/v3/userDataStream",
            {},
            false
        )

        await this.httpClient.executeRequest(options).then((data) => {
            this.listenKey = JSON.parse(data).listenKey
        }).catch((err) => this.logger.error(err))
    }

    showListenKey() {
        this.logger.info(`ListenKey -- ${this.listenKey}`)
    }

    async openUserDataStream() {
        const callbacks = {
            "message": (data, isBinary) => {
                if (isBinary) {
                    data = data.toString()
                }
                let response = JSON.parse(data)
                if (response['e'] === EVENT_ACCOUNT_POSITION) {
                    this.latencies.push(Date.now() - parseInt(response["E"]))
                    this.logger.info("There was an update of your spot balances. Below, the new status of your account:")

                    let balances = response['B']
                    this.setBalances(balances.map(balance => ({ asset: balance.a, free: balance.f })))
                    this.displayBalances()
                }
            },
            "error": (err) => {
                this.logger.error(err)
            }
        }

        await this.wsClient
            .open(this.listenKey, "user data stream")
            .then(ws => wsHandlers(ws, callbacks))
    }

    showLatencies() {
        this.logger.info(`---- Latencies for the User Account ----`)
        super.showLatencies()
        this.logger.info("---- End of Latencies ----")
    }
}

module.exports = Account