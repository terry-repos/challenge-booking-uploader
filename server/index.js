const express = require('express')
const cors = require('cors')
const fs = require('fs')
const bodyParser = require('body-parser');


const app = express()
app.use(cors()) // so that app can access
app.use( bodyParser.json() );       // to support JSON-encoded bodies


const bookings = JSON.parse(fs.readFileSync('./server/bookings.json')).map(
  (bookingRecord) => ({
    time: Date.parse(bookingRecord.time),
    duration: bookingRecord.duration * 60 * 1000, // mins into ms
    userId: bookingRecord.user_id,
  }),
)

app.get('/bookings', (_, res) => {
  res.json(bookings)
})

app.post('/bookings', (req, res) => {
  res.json(req.body);
})

app.listen(3001)
