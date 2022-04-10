const crypto = require('crypto');
const https = require('https')
const { buildQueryString } = require('../helpers/utils')

class HttpClient {

    headers = {
        'Content-Type': 'application/json'
    }

    constructor(baseUrl, apiKey, secretKey) {
        this.baseUrl = baseUrl
        this.apiKey = apiKey
        this.secretKey = secretKey
    }

    privateRequest(method, path, parameters = {}, signed = true) {
        let queryString = buildQueryString(parameters)

        if (queryString !== '') {
            path = `${path}?${queryString}`
        }

        if (signed) {
            const signature = crypto
                .createHmac('sha256', this.secretKey)
                .update(queryString)
                .digest('hex')
            path = `${path}&signature=${signature}`
        }

        const options = {
            method,
            hostname: this.baseUrl,
            path,
            headers: { ...this.headers, 'X-MBX-APIKEY': this.apiKey }
        };

        return options
    }

    publicRequest(method, path, parameters) {
        let queryString = buildQueryString(parameters)

        if (queryString !== '') {
            path = `${path}?${queryString}`
        }

        const options = {
            method,
            hostname: this.baseUrl,
            path,
            headers: { ...this.headers }
        };

        return options
    }

    executeRequest(options) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                if (res.statusCode < 200 || res.statusCode > 299) {
                    reject(new Error('Request failed: ' + res.statusCode));
                }

                const body = [];
                res.on('data', (chunk) => body.push(chunk));
                res.on('end', () => resolve(body.join('')));
            })
            req.on('error', (err) => reject(err))
            req.end()
        })
    }
}

module.exports = HttpClient