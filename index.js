// createSeriesFrom('wss://currency.realtime')
createSeriesFrom('series.json')
  .pipe(probeFor())
  .on('data', (spike) => {
    console.log('yoooooooooooooooooo!', spike)
  })
  .on('error', (err) => {
    console.error(err)
  })
  .on('end', () => {
    console.info('end.')
  })

function createSeriesFrom (path) {
  const {createReadStream} = require('fs')
  const {Transform} = require('stream')

  return createReadStream(path)
    .pipe(new Transform({
      transform (chunk, enc, push) {
        try {
          JSON.parse(chunk.toString('utf8')).forEach(item => {
            console.error('[log] createSeriesFrom:transform item', item)
            this.emit('data', item)
          })
        } catch (err) {
          console.error('[err] createSeriesFrom:transform', err)
        }
      },
      flush () {
      }
    }), {end: false})
}

function probeFor (options = {}) {
  const slayer = require('slayer')
  return slayer({
    minPeakDistance: 30,
    minPeakHeight: 0
  }).x(function (item) {
    console.log('probe:item [date]', item.at)
    return item.at
  }).y(function (item) {
    console.log('probe:item [value]', item.amout)
    return item.amount
  }).createReadStream({
    bufferingFactor: 4,
    lookAheadFactor: 0.33
  }).on('data', spike => {
    console.log('yoooooooooooo', spike)
  }).on('error', err => {
    console.error(err)
  })
}
