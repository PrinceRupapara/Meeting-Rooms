export interface Booking {
    id: number;
    roomId: number;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    description?: string;
}
export interface Room {
    id: number;
    name: string;
    capacity: number;
    cleaningStartTime: string;
    cleaningEndTime: string;
}
export declare let bookings: Booking[];
export declare function saveBookingStorage(): void;
export declare function saveRoomStorage(): void;
//# sourceMappingURL=store.d.ts.map