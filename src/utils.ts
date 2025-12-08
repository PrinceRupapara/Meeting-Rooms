// Utility Functions
import { bookings, type Booking } from "./store.js";


export function timeToMinutes(t: string): number {
    // const [hh, mm] = t.split(':').map(Number);
    // return hh * 60 + mm;
    const [hhStr, mmStr] = t.split(":");
    const hh = Number(hhStr);
    const mm = Number(mmStr);

    return hh * 60 + mm;
}

export function localTodayISO(): string {
    const now = new Date();
    const tzOffsetMs = now.getTimezoneOffset() * 60000;
    const local: any = new Date(now.getTime() - tzOffsetMs);
    return local.toISOString().slice(0, 10);
}

export function isOverlapBooking(roomId: number | string, date: string, start: string, end: string, ignoreBookingId: number | null): boolean {
    return bookings.some(b => {
        if (Number(b.roomId) !== Number(roomId)) return false;
        if (b.date !== date) return false;
        if (ignoreBookingId !== null && b.id === ignoreBookingId) return false;
        const s1 = timeToMinutes(start);
        const e1 = timeToMinutes(end);
        const s2 = timeToMinutes(b.startTime);
        const e2 = timeToMinutes(b.endTime);
        return (s1 < e2 && e1 > s2);
    });
}

