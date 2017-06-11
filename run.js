
const {createServer} = require('http')
const {createServerFrom} = require('wss')

const http = createServer(requestListener)
const wss = createServerFrom(http, connectionListener)

if (!module.parent) {
  const {npm_package_config_http_port} = process.env
  http.listen(npm_package_config_http_port, function () {
    console.info('[web] listening', this.address())
  })
}

function requestListener ({url, headers}, res) {
  const {createReadStream} = require('fs')
  const path = url.length === 1 ? '/index.html' : url
  res.statusCode = 200
  console.time(`[web] ${path}`)
  createReadStream(`www${path}`)
    .on('error', (err) => {
      console.timeEnd(`[web] ${path}`)
      console.error(`[web] %s`, err)
      res.statusCode = 404
      res.end()
    })
    .on('end', () => {
      console.timeEnd(`[web] ${path}`)
    })
    .pipe(res)
  function onError (err) {
  }
}

const {createReadStream} = require('fs')

const byline = require('byline')
const file = createReadStream('coinbaseEUR.csv', {encoding: 'utf8'})

const lbl = byline(file)
  .on('data', function (line) {
    for (let client of wss.clients) {
      const [ts, price, transfer] = line.split(',')
      const message = JSON.stringify({
        at: ts * 1000,
        time: new Date(ts * 1000).toISOString(),
        value: price,
        amount: price
      })
      console.log('[wss] >> ', message)
      client.send(message)
    }
    lbl.pause()
    setTimeout(() => lbl.resume(), 5)
  })

function connectionListener (ws) {
  console.log('[wss] connected: %d', this.clients.size)
}
