import { rooms, saveToLocalstorage } from "./rooms.js";
import { editBooking, deleteBooking, renderBooking } from "./bookings.js";
import { localTodayISO, timeToMinutes } from "./utils.js";
import { bookings } from "./store.js";
const filterBooking = document.getElementById("filterBooking") || null;
const selectedRoomTitle = document.getElementById('selectedRoomTitle') || null;
const selectedRoomBookings = document.getElementById('selectedRoomBookings') || null;
const todayBookedRoom = document.getElementById("todayBookedRoom") || null;
const viewBookingDateBtn = document.getElementById("viewBookingDateBtn") || null;
const datePicker = document.getElementById("datePicker") || null;
const bookingsList = document.getElementById("bookingsList") || null;
export function bookingFilterDropdown() {
    if (!filterBooking)
        return;
    filterBooking.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = '-- Select Room --';
    filterBooking.appendChild(allOpt);
    rooms.forEach(r => {
        const opt = document.createElement('option');
        opt.value = String(r.id);
        opt.textContent = `${r.name} (Capacity: ${r.capacity})`;
        filterBooking.appendChild(opt);
    });
}
export function selectRoom(id) {
    if (!id) {
        selectedRoomTitle.textContent = 'Choose a room to view its bookings';
        selectedRoomBookings.innerHTML = '';
        // selectedRoomTitle.innerHTML = '';
        return;
    }
    const roomBookings = bookings.filter(b => b.roomId === id).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    selectedRoomBookings.innerHTML = '';
    if (!roomBookings.length) {
        selectedRoomBookings.innerHTML = '<div class="muted">No bookings for this room.</div>';
        return;
    }
    roomBookings.forEach(b => {
        const room = rooms.find(r => r.id === b.roomId);
        const card = document.createElement('div');
        card.className = 'card card p-2 mb-2';
        card.innerHTML = `<div class = "d-flex justify-content-between align-items-start">
                <div>
                    <div><strong>${b.title}</strong> <small class="text-muted">(${room?.name})</small> </div>
                    <div class="text-muted">Date : ${b.date} <br/> Time :  ${b.startTime} - ${b.endTime}</div>
                     <div>${b.description || ''}</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-success edit-booking" data-id="${b.id}"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-booking" data-id="${b.id}"><i class="bi bi-trash"></i></button>
                </div>
            </div>`;
        selectedRoomBookings.appendChild(card);
    });
    addFilterEventListners();
}
function addFilterEventListners() {
    const btnEdit = document.querySelectorAll(".edit-booking");
    btnEdit.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const target = e.currentTarget;
            const dataId = target.dataset.id;
            if (!dataId)
                return;
            const id = parseInt(dataId, 10);
            editBooking(id);
        });
    });
    const btnDelete = document.querySelectorAll(".delete-booking");
    btnDelete.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const target = e.currentTarget;
            const dataId = target.dataset.id;
            if (!dataId)
                return;
            const id = parseInt(dataId, 10);
            deleteBooking(id);
        });
    });
}
filterBooking.addEventListener('change', () => {
    const val = filterBooking.value;
    // console.log("filter booking : ", val);
    // renderBooking(val); 
    if (val === 'all') {
        return;
    }
    if (val) {
        selectRoom(Number(val));
    }
    else {
        selectedRoomTitle.textContent = 'Choose a room to view its booking';
        selectedRoomBookings.innerHTML = '';
        // renderBooking();
    }
});
export function renderTodayBooking() {
    if (!todayBookedRoom) {
        return;
    }
    const today = localTodayISO();
    // todayBookedRoom.innerHTML = '';
    todayBookedRoom.innerHTML = '';
    const list = bookings.filter(t => t.date === today).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    if (!list.length) {
        todayBookedRoom.innerHTML = 'No Room Book Today';
        return;
    }
    list.forEach(td => {
        const room = rooms.find(r => r.id === td.roomId);
        const card = document.createElement('div');
        card.className = 'card p-2 mb-2';
        card.innerHTML =
            `<div class = "d-flex justify-content-between align-items-start">
                <div>
                    <div><strong>${td.title}</strong> <small class="text-muted">(${room?.name})</small></div>
                    <div class="text-muted">Date : ${td.date} <br/> Time :  ${td.startTime} - ${td.endTime}</div>
                     <div>${td.description || ''}</div>
                </div>
                <div>
                    <button type="button" class="btn btn-outline-success me-2 edit-booking" data-id=${td.id}><i class="bi bi-pencil-square"></i></button>
                    <button type="button" class="btn btn-outline-danger delete-booking" data-id=${td.id}><i class="bi bi-trash"></i></button>
                </div> 
             </div>`;
        todayBookedRoom.appendChild(card);
    });
    addFilterEventListners();
}
export function expiredBookingRemove() {
    // console.log("Booking :", bookings.map(b => b.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const booking = bookings.filter(t => {
        const bookingDate = new Date(t.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
    });
    bookings.splice(0, bookings.length, ...booking);
    renderBooking();
    saveToLocalstorage();
    return bookings;
}
viewBookingDateBtn.addEventListener("click", () => {
    datePicker.style.display = 'inline-block';
    datePicker.focus();
});
export function viewBookingForDate(date) {
    const bookingsDate = bookings.filter(d => d.date === date);
    if (!bookingsList)
        return;
    // todayBookedRoom.innerHTML = '';
    bookingsList.innerHTML = '';
    if (!bookingsDate.length) {
        bookingsList.innerHTML = 'No Bookings for this date.';
    }
    else {
        bookingsDate.forEach(booknig => {
            const room = rooms.find(d => d.id === booknig.roomId);
            const card = document.createElement('div');
            card.className = 'card p-2 mb-2';
            card.innerHTML = `<div class = "d-flex justify-content-between align-items-start">
                <div>
                    <div><strong>${booknig.title}</strong> <small class="text-muted">(${room?.name})</small></div>
                    <div class="text-muted">Date : ${booknig.date} <br/> Time :  ${booknig.startTime} - ${booknig.endTime}</div>
                     <div>${booknig.description || ''}</div>
                </div>
                <div>
                    <button type="button" class="btn btn-outline-success me-2 edit-booking" data-id=${booknig.id}><i class="bi bi-pencil-square"></i></button>
                    <button type="button" class="btn btn-outline-danger delete-booking" data-id=${booknig.id}><i class="bi bi-trash"></i></button>
                </div> 
             </div>`;
            bookingsList.appendChild(card);
        });
        addFilterEventListners();
    }
}
datePicker.addEventListener('change', (e) => {
    const selectedDate = e.target;
    if (selectedDate) {
        viewBookingForDate(selectedDate.value);
    }
    datePicker.style.display = 'none'; // Hide the date picker after selection
});
//# sourceMappingURL=filter.js.map