import { rooms } from "./rooms.js";
export interface Booking {
    id: number,
    roomId: number,
    date: string,
    startTime: string,
    endTime: string,
    title: string,
    description: string
}

export interface Room {
    id: number,
    name: string,
    capacity: number,
    cleaningStartTime: string,
    cleaningEndTime: string,
}

export interface Overlap{
    roomId: number,
    date: string,
    startTime: string,
    endTime: string,
}

export interface Clean{
    bookingStart : string,
    bookingEnd : string ,
    cleanStart:string,
    cleanEnd:string

}

export let bookings: Booking[] = JSON.parse(localStorage.getItem('bookingData') ?? '[]') || [];

export function saveBookingStorage() {
    localStorage.setItem('bookingData', JSON.stringify(bookings));
}

export function saveRoomStorage() {
    localStorage.setItem('roomData', JSON.stringify(rooms));
}