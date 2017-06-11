const WebSocket = require('ws')
const Transform = require('stream')

const maxBufferLength = 3

let walletBTC = 0
let walletEUR = 100

const socket = new WebSocket('ws://0.0.0.0')
const buffer = []

socket.on('message', function (data) {
    const message = JSON.parse(data)
    buffer.push(message)
    if (buffer.length > maxBufferLength) {
      const newBuffer = buffer.slice(-maxBufferLength)
      buffer.length = 0
      buffer.push(...newBuffer)
    }
    if (buffer.length === maxBufferLength) {
      if (buffer[0].amount > buffer[1].amount) {
        if (buffer[1].amount > buffer[2].amount) {
          console.log('IDLE: negative trend confirmed', walletBTC, walletEUR, buffer[2].amount)
        } else {
          walletBTC += walletEUR / parseFloat(buffer[2].amount)
          walletEUR = 0
          console.log('BUY: positive trend starting', walletBTC, walletEUR, buffer[2].amount)
        }
      } else if (buffer[0].amount < buffer[1].amount) {
        if (buffer[1].amount < buffer[2].amount) {
          console.log('IDLE: positive trend confirmed', walletBTC, walletEUR, buffer[2].amount)
        } else {
          walletEUR += walletBTC * parseFloat(buffer[2].amount)
          walletBTC = 0
          console.log('SELL: negative trend starting', walletBTC, walletEUR, buffer[2].amount)
        }
      }
    }
    // console.log('--> IDLE', JSON.parse(message.toString('utf8')).amount)
    // this.emit(JSON.parse(message.toString('utf8')))
  })
  // .pipe(probeFor())
  // .on('data', function (spike) {
  //   console.log('--> PEAK', spike)
  // })
  .on('error', (err) => {
    console.error(err)
  })
  .on('end', () => {
    console.info('end.')
  })

// function probeFor (options = {}) {
//   const slayer = require('slayer')
//   return slayer({
//     minPeakDistance: 5,
//     minPeakHeight: 4
//   }).x(function (item) {
//     const {at} = JSON.parse(item.toString('utf8'))
//     // console.log('probe:item x', at)
//     return at
//   }).y(function (item) {
//     const {amount} = JSON.parse(item.toString('utf8'))
//     // console.log('probe:item y ', amount)
//     return amount
//   }).createReadStream({
//     bufferingFactor: 2,
//     lookAheadFactor: 0.1
//   })
//   // .on('data', spike => {
//   //   console.log('yoooooooooooo', spike)
//   // }).on('error', err => {
//   //   console.error(err)
//   // })
// }
