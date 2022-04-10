class Logger {
    constructor(name, color = "\x1b[37m") {
        this.name = name
        this.color = color
    }

    log(level, message) {
        const output = `${this.color} ${new Date().toISOString().replace('T', ' ').split('.')[0]} ${level.toUpperCase()} [${this.name}] ${message}\x1b[0m`
        console.log(output)
    }

    info(message) {
        this.log("info", message)
    }

    debug(message) {
        this.log("debug", message)
    }

    error(message) {
        this.log("error", message)
    }
}

module.exports = Logger