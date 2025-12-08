import { rooms } from "./rooms.js";
export let bookings = JSON.parse(localStorage.getItem('bookingData') ?? '[]') || [];
export function saveBookingStorage() {
    localStorage.setItem('bookingData', JSON.stringify(bookings));
}
export function saveRoomStorage() {
    localStorage.setItem('roomData', JSON.stringify(rooms));
}
//# sourceMappingURL=store.js.map