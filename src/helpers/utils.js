function* generateColor() {
    let i = 31
    while (i <= 37) {
        yield `\x1b[${i}m`
        i = (i == 37) ? 31 : ++i
    }
}

const buildQueryString = (parameters) => {
    if (!parameters) return ''
    return Object.entries(parameters)
        .map(stringifyKeyValuePair)
        .join('&')
}

const stringifyKeyValuePair = ([key, value]) => {
    const toString = Array.isArray(value) ? `["${value.join('","')}"]` : value
    return `${key}=${encodeURIComponent(toString)}`
}

const wsHandlers = ((ws, callbacks) => {
    const defaultCallbacks = {
        "ping": () => {
            ws.pong()
        },
        "pong": () => {
            ws.ping()
        },
        "close": () => {
            ws.terminate()
        }
    }

    for (const [event, cb] of Object.entries({ ...defaultCallbacks, ...callbacks })) {
        ws.on(event, cb)
    }
})

const maxValueInArray = (array) => Math.max(...array)

const minValueInArray = (array) => Math.min(...array)

const avgValueInArray = (array) => array.reduce((x, y) => x + y, 0) / array.length

module.exports = { generateColor, buildQueryString, wsHandlers, maxValueInArray, minValueInArray, avgValueInArray }