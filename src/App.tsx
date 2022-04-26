import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import './App.css'
import { generateHoursAxis, groupByDates, 
  rawToInflatedBookings, checkNewViableBookings, getViableNewBookings } from './helpers';

import { RawBooking, InflatedBooking, DaysBookings } from './booking';

const hoursAxis = generateHoursAxis();
const apiUrl = 'http://localhost:3001'

export const App = () => {
  const [bookings, setBookings] = useState<InflatedBooking[]>([])

  useEffect(() => {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then(rawToInflatedBookings)
      .then(setBookings)
  }, [])

  const onDrop = async (files: File[]) => {
    const reader = new FileReader();
    reader.onload = () => {
      const txt:string  = reader.result as string;
      const parsedTxt = txt.split(/\r?\n/);

      const parsedCsv = parsedTxt.map((line, i) => 
        line.split(',').map((item, k)=> item.trim()));

      const parsedCsvCleaned = parsedCsv.filter((arr)=>arr.length>1);

      let newBookings:RawBooking[] = parsedCsvCleaned.slice(1).map((arr):RawBooking=>{
        return {
          time : arr[0],
          duration : (Number(arr[1]) * 60 * 1000 ),
          userId : String(arr[2]),
          category: 'Viable'
        }
      }); 

      let newBookingsInflated:InflatedBooking[] = rawToInflatedBookings(newBookings);
      const joinedBookings = [...bookings].concat(newBookingsInflated);
      setBookings(joinedBookings);

    };
    reader.readAsText(files[0])
  }

  const clickedBookAvailable = () => {
    const viableNewBookingsAsStr = JSON.stringify(getViableNewBookings([...groupedByDates])); 

    const postUrl = `${apiUrl}/bookings`;

    fetch(postUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: viableNewBookingsAsStr
    }).then((response) => {
      return response.json();
    }).then((body) => {
      console.log("here's our response body:", body);
      const inflatedBookings = rawToInflatedBookings(body);
      setBookings(inflatedBookings);
    });
  }


  const groupedByDates = groupByDates(bookings);
  const hasViableBooking = checkNewViableBookings([...groupedByDates]); 

  return (
    <div className='App'>
      <div className='App-header'>
        <Dropzone accept='.csv' onDrop={onDrop}>
        {({getRootProps, getInputProps}) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drop some files here,<br /> or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
      </div>
      <div className='App-main'>
        {bookings && (
          <Timeline groupedByDates={groupedByDates} />
        )}
        {hasViableBooking && (
          <div className='btnContainer'>
            <button onClick={clickedBookAvailable}>Book Available</button>
          </div>
        )}
        
      </div>
      
    </div>
  )
}



const Timeline = (props: {groupedByDates: DaysBookings[]}) => (
  <div className="Timeline">
    <div className="hoursAxis">
      {
        hoursAxis.map((time, i)=>(
          <span className="hoursAxisTick" key={i}>{time}</span>
        ))
      }
    </div>
    {
      props.groupedByDates.length > 0 &&
      props.groupedByDates.map((daysBookings: DaysBookings, i: number) =>
      {
        return (<Day daysBookings={daysBookings} i={i} key={String(i)} />)
      }
        
    )}
  </div>
);



const Day = (props: {daysBookings: DaysBookings, i:number }) => {
  const { day, dayOfWeek, bookings } = props.daysBookings;
  return (
    <div className='dayCont' key={props.i}>
      <div className='dayHeader'> 
        <span className='dayOfWeek'>{dayOfWeek.substring(0,3)}</span>
        <span className='day'>{day}</span>
      </div>
      <div className='bookings'>
      {
        bookings.length > 0 &&
        bookings.map((booking: InflatedBooking, i: number) =>
          <TimeSegment booking={booking} key={i} i={i} />
        )
      }
      </div>
    </div>
  );
}



const TimeSegment = (props: {booking: InflatedBooking, i: number}) => {
  const { minsInDay, duration, category } = props.booking;
  const nPixelsPerMinute = 22/60;
  const top = ((minsInDay+10) * nPixelsPerMinute ) + 'px';
  const height = ( duration * nPixelsPerMinute ) + 'px';  
  const styles: React.CSSProperties = {
    top,
    height
  };

  let computedClasses = 'App-timeSegment';
  if (category!==null && category!==undefined){
    computedClasses += ' ' + category;
  } 
  console.log(props.i, " styles: ", styles, " computedClasses", computedClasses);

  return (
    <div key={String(props.i)} className={computedClasses} style={styles}>
      {/* {`${hour}:${mins}`} */}
    </div>
  )  
}