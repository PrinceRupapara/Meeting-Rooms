import { bookingMode, renderBooking } from "./bookings.js";
import { bookingFilterDropdown, expiredBookingRemove, renderTodayBooking } from "./filter.js";
import { capacityFilter, renderRooms ,loadDropDown, updateFormMode, searchRoom } from "./rooms.js";

document.addEventListener('DOMContentLoaded', () => {

    bookingFilterDropdown();
    renderRooms();
    capacityFilter();
    // searchRoom();
    renderTodayBooking();
    renderBooking();
    updateFormMode();
    
    loadDropDown();
    bookingMode(false);

    const valid = expiredBookingRemove();
    console.log(valid);

});


