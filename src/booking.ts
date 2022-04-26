type TimeStamp = string;
type Seconds = number;
type Categories = 'Existing' | 'Viable' | 'Clashing' | undefined;
export interface RawBooking {
  time: TimeStamp;
  duration: Seconds;
  userId: string;
  category?: Categories;
}

export interface InflatedBooking {
  time: TimeStamp;
  date: Date;
  dayOfWeek: string;
  day: number;
  hour: number;
  mins: number;
  yyyymmdd : number;
  minsInDay: number;
  duration: number;
  userId: string
  category?: Categories;
}

export interface DaysBookings {
  yyyymmdd: number;
  date: Date;
  dayOfWeek : string;
  day : number;
  bookings: InflatedBooking[];
}