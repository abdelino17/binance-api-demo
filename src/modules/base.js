const { maxValueInArray, minValueInArray, avgValueInArray } = require("../helpers/utils")

class Base {
    constructor(httpClient, wsClient, logger) {
        this.httpClient = httpClient
        this.wsClient = wsClient
        this.logger = logger
        this.latencies = []
    }

    showLatencies() {
        if (this.latencies.length > 0) {
            this.logger.info(`${"Min".padStart(10, " ")} = ${minValueInArray(this.latencies)} ms`)
            this.logger.info(`${"Max".padStart(10, " ")} = ${maxValueInArray(this.latencies)} ms`)
            this.logger.info(`${"Mean".padStart(10, " ")} = ${avgValueInArray(this.latencies)} ms`)

            // Reset latencies
            this.latencies = []
        } else {
            this.logger.info("No values yet!")
        }
    }
}

module.exports = Base