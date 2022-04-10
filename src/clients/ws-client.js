const { WebSocket } = require("ws");

class WsClient {


    constructor(ws_endpoint) {
        this.ws_endpoint = ws_endpoint
    }

    open(path, ctx) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`${this.ws_endpoint}/${path}`);
            ws.on(
                "open",
                () => {
                    this.ws = ws
                    console.log(`The ws connection for ${ctx} was successfuly established`);
                    resolve(ws);
                },
                (err) => {
                    reject(err);
                }
            );
        })
    }

    close() {
        this.ws.terminate()
    }
}

module.exports = WsClient