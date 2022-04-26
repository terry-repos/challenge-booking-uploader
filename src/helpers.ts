import { RawBooking, InflatedBooking, DaysBookings } from './booking';

const getNumericDate = (date: Date):number => {

  const yyyyStr = String(date.getFullYear());
  let mm: number = date.getMonth() + 1; // Months start at 0!
  let dd: number = date.getDate();

  const ddStr = (dd < 10) ? ('0' + dd) : String(dd);
  const mmStr = (mm < 10) ? ('0' + mm) : String(mm);

  return Number(yyyyStr + mmStr + ddStr);
}



const getViableNewBookings = ( daysBookings: DaysBookings[] ): InflatedBooking[] => {
  let viableBookings:InflatedBooking[] = [];
  const category = 'Existing';

  daysBookings.forEach((dayBooking, i)=>{
    let validBookings = dayBooking.bookings.filter(booking=>booking.category!=='Clashing');
    let updatedBookings: InflatedBooking[] = validBookings.map((ub)=>{
      const newDuration = ub.duration * 60 * 1000;
      return {
        ...ub,
        category,
        duration: newDuration
      }
    })
    viableBookings = [...viableBookings].concat(updatedBookings);
  });

  return viableBookings;
} 



const rawToInflatedBookings = ( rawBookings: RawBooking[] ) : InflatedBooking[] => {
  let inflatedBookings:InflatedBooking[] = rawBookings.map((rawBooking):InflatedBooking=>{
    const date = new Date(rawBooking.time);
    const day = date.getDate();
    const hour = date.getHours();
    const mins = date.getMinutes();
    const minsInDay = 60 * hour + mins; 
    const yyyymmdd = getNumericDate(date);

    let { time, duration, userId, category } = rawBooking;
    duration = duration / 60 / 1000;
    category = (category===undefined) ? 'Existing' : category;

    return {
      time,
      date,
      yyyymmdd,
      dayOfWeek: date.toLocaleString('en-us', {  weekday: 'long' }),
      day,
      hour,
      mins,
      minsInDay,
      duration,
      userId,
      category
    }
  }); 
  return inflatedBookings;
};



const groupByDates = (bookings: InflatedBooking[]): DaysBookings[] => {
  let yyyymmdds = bookings.map((booking)=>booking.yyyymmdd);
  yyyymmdds = Array.from(new Set(yyyymmdds));

  const yyyymmddsSorted:number[] = yyyymmdds.sort((a,b)=>a-b);

  let groupedByDates:DaysBookings[] = [];

  yyyymmddsSorted.forEach((yyyymmdd)=>{
    const matchedBookings:InflatedBooking[] = bookings.filter((bk)=>
      bk.yyyymmdd===yyyymmdd);

    if (matchedBookings.length > 0){
      const { date, dayOfWeek, day } = matchedBookings[0];
      const bookings = matchedBookings.map( (bk, bki): InflatedBooking=>{ const {
        minsInDay, duration, userId } = bk;
        let category = bk.category;
        if (category==='Viable'){
          const bkEndMinsInDay = minsInDay + duration;
          [...matchedBookings].forEach((mbk, mbki)=> {
            if ((mbk.userId===userId && minsInDay===mbk.minsInDay &&
              duration===mbk.duration && category===mbk.category) || mbki===bki) return;

            const mbkEndMinsInDay:number = mbk.minsInDay + mbk.duration;
            const startTimeWithin = (mbk.minsInDay >= bk.minsInDay) &&
              (mbk.minsInDay <= bkEndMinsInDay);
            const endTimeWithin = (mbk.minsInDay <= bk.minsInDay) && (mbkEndMinsInDay >= bk.minsInDay) && 
              (mbkEndMinsInDay <= bkEndMinsInDay);
            const startTimeEarlierAndEndTimeLater = (mbk.minsInDay <= bk.minsInDay) && (
              mbkEndMinsInDay >= bkEndMinsInDay);
          
            if (startTimeWithin  || endTimeWithin || startTimeEarlierAndEndTimeLater){
              bk.category='Clashing';
            }
          });
        }
    
        return bk;
      });

      
      const groupedByDate:DaysBookings = {
        yyyymmdd,
        date,
        dayOfWeek,
        day,
        bookings,
      } as DaysBookings;
      
      groupedByDates.push( groupedByDate );
    }  
  });

  return groupedByDates;
}



const checkNewViableBookings = ( daysBookings: DaysBookings[] ): boolean => {
  let hasViableBooking:boolean=false;
  daysBookings.forEach((day)=>{
    if (hasViableBooking) return true;
    day.bookings.forEach((booking)=>{
      if (booking.category==='Viable'){
        hasViableBooking = true;
      }
    });

  });
  return hasViableBooking;
} 



const generateHoursAxis = ():string[] => {
  const bumpHours = 0;
  const nHours = 24 - bumpHours;

  let hoursAxis:string[] = [...Array(nHours).keys()].map( (hour: number) => {
    const bumpedHour:number = hour + bumpHours;
    let time:string = (bumpedHour < 10) ? `0${bumpedHour}` : String(bumpedHour);
    time += ':00'
    return time;
  });

  return hoursAxis;
}


export { getNumericDate, groupByDates, rawToInflatedBookings, 
  generateHoursAxis, checkNewViableBookings, getViableNewBookings }; 
