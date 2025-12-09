import { bookingMode, renderBooking } from "./bookings.js";
import { bookingFilterDropdown, expiredBookingRemove, renderTodayBooking } from "./filter.js";
import { capacityFilter, renderRooms, loadDropDown, updateFormMode, searchRoom } from "./rooms.js";
document.addEventListener('DOMContentLoaded', () => {
    renderRooms();
    capacityFilter();
    // searchRoom();
    renderTodayBooking();
    const updateBooking = expiredBookingRemove();
    console.log("expired : ", updateBooking);
    renderBooking();
    updateFormMode();
    bookingFilterDropdown();
    loadDropDown();
    bookingMode(false);
});
//# sourceMappingURL=main.js.map