// Utility Functions
import { bookings, type Booking, type Clean, type Overlap } from "./store.js";


export function timeToMinutes(t: string) {
    // const [hh, mm] = t.split(':').map(Number);
    // return hh * 60 + mm;
    const [hhStr, mmStr] = t.split(":");
    const hh = Number(hhStr);
    const mm = Number(mmStr);

    return hh * 60 + mm;
}

export function localTodayISO(){
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - tzOffsetMs);
    return local.toISOString().slice(0, 10);
}

export function isOverlapBooking(overlap : Overlap, ignoreBookingId: number | null): boolean {
    return bookings.some(b => {
        if (Number(b.roomId) !== overlap.roomId) return false;
        if (b.date !== overlap.date) return false;
        if (ignoreBookingId !== null && b.id === ignoreBookingId) return false;
        const s1 = timeToMinutes(overlap.startTime);
        const e1 = timeToMinutes(overlap.endTime);
        const s2 = timeToMinutes(b.startTime);
        const e2 = timeToMinutes(b.endTime);
        
        return (s1 < e2 && e1 > s2 );
    });
}

export function isCleaning(clean : Clean): boolean {
     const bStart = timeToMinutes(clean.bookingStart);
    const bEnd = timeToMinutes(clean.bookingEnd);
    const cStart = timeToMinutes(clean.cleanStart);
    const cEnd = timeToMinutes(clean.cleanEnd);

    return bStart < cEnd && bEnd > cStart;
}



