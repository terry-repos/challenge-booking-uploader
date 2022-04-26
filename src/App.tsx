import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import './App.css'

const apiUrl = 'http://localhost:3001'

type TimeStamp = string;
type Seconds = number;
type Booking = {
  time: TimeStamp;
  duration: Seconds;
  userId: string;
}

export const App = () => {
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then(setBookings)
  }, [])

  const onDrop = (files: File[]) => {
    console.log(files)
  }

  return (
    <div className='App'>
      <div className='App-header'>
        <Dropzone accept='.csv' onDrop={onDrop}>
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drop some files here, or click to select files</p>
            </div>
          </section>
        )}
        </Dropzone>
      </div>
      <div className='App-main'>
        <p>Existing bookings:</p>
        {bookings.map((booking, i) => {
          const date = new Date(booking.time)
          const duration = booking.duration / (60 * 1000)
          return (
            <p key={i} className='App-booking'>
              <span className='App-booking-time'>{date.toString()}</span>
              <span className='App-booking-duration'>
                {duration.toFixed(1)}
              </span>
              <span className='App-booking-user'>{booking.userId}</span>
            </p>
          )
        })}
      </div>
    </div>
  )
}
