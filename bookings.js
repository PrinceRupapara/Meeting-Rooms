
let bookingEditId = null;

const bookingForm = document.getElementById('bookingForm');

const bookDate = document.getElementById('bookDate');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const bookingTitle = document.getElementById('title');
const bookingDesc = document.getElementById('desc');
const resetBooking = document.getElementById('resetBooking');


const maxinumTime = 4 * 60;
const minimumTime = 30;
const business_start = '08:00';
const business_end = '18:00';

// create bookings container under booking form if not present
let bookingsContainer = document.getElementById('bookingsList');
if (!bookingsContainer) {
    bookingsContainer = document.createElement('div');
    bookingsContainer.id = 'bookingsList';
    bookingsContainer.style.marginTop = '12px';
    bookingForm.parentNode.appendChild(bookingsContainer);
}

function renderBooking(roomId = '') {
    bookingsContainer.innerHTML = ' ';
    if (!bookings.length) {
        bookingsContainer.innerHTML += '<div class="text-muted">No bookings yet.</div>';
        loadDropDown();
        return;
    }

    // const
    let list = [...bookings].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    if (roomId) {
        const rid = Number(roomId);
        list = list.filter(b => Number(b.roomId) === rid);
    }

    if (!list.length) {
        bookingsContainer.innerHTML += '<div class="text-muted">No bookings found for selected room.</div>';
        return;
    }


    list.forEach(b => {
        const room = rooms.find(r => r.id === b.roomId);
        const card = document.createElement('div');
        card.className = 'card p-2 mb-2';
        card.innerHTML =
            `<div class = "d-flex justify-content-between align-items-start">
                <div>
                    <div><strong>${b.title}</strong> <small class="text-muted">(${room.name})</small></div>
                    <div class="text-muted">Date : ${b.date} <br/> Time :  ${b.startTime} - ${b.endTime}</div>
                     <div>${b.description || ''}</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-success edit-booking" data-id="${b.id}"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-booking" data-id="${b.id}"><i class="bi bi-trash"></i></button>
                </div>
            </div>`
        bookingsContainer.appendChild(card);
    });

    addBookingEventListners();
}

function addBookingEventListners() {
    const btnDelete = document.querySelectorAll(".delete-booking");
    btnDelete.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            deleteBooking(id);
        });
    });

    const btnEdit = document.querySelectorAll(".edit-booking");
    btnEdit.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            editBooking(id);
        });
    })
}

// Function to update booking form button and mode (editing or creating)
function bookingMode(isEditing) {
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    if (isEditing) {
        submitBtn.textContent = 'Update';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-warning');
    } else {
        submitBtn.textContent = 'Save';
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-primary');
    }
}

// Function to edit a booking
function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    bookingEditId = id;
    loadDropDown();
    dropdown.value = booking.roomId;
    bookDate.value = booking.date;
    startTime.value = booking.startTime;
    endTime.value = booking.endTime;
    bookingTitle.value = booking.title;
    bookingDesc.value = booking.description || '';
    bookingMode(true);
}

// Function to delete a booking
function deleteBooking(id) {
    const booking = bookings.find(r => r.id === id);
        if (!booking) return;

        const ok = confirm(`Delete Booking ${booking.title}?`);
        if (!ok) {
            return;
        }

        const idx = bookings.findIndex(x => x.id === id);
        bookings.splice(idx, 1);
        renderBooking();
        bookingFilterDropdown();
        selectRoom();
        renderTodayBooking();
        saveToLocalstorage();
}

// Event listener for booking form submission
bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roomId = dropdown.value;
    const date = bookDate.value;
    const s_Time = startTime.value;
    const e_Time = endTime.value;
    const title = bookingTitle.value.trim() || 'untitled';
    const desc = bookingDesc.value.trim();

    const st = timeToMinutes(s_Time);
    const et = timeToMinutes(e_Time);
    const today = localTodayISO();
    if (date < today) {
        alert('You cannot book a past date');
        return;
    }

     const now = new Date().toTimeString().slice(0, 5);
        if (date === today && s_Time < now) {
            return alert('Enter Valid Time!');
        }

    if (st >= et) {
        return alert('End time must be after start time.');
    }

    if (st < timeToMinutes(business_start) || et > timeToMinutes(business_end)) {
        return alert("Booking allowed between 8:00 AM to 6:00 PM.");
    }

    const duration = et - st;
    if (duration < minimumTime) {
        return alert("Minimum booking time is 30 minutes.");
    }

    if (duration > maxinumTime) {
        return alert("Maximum booking time is 4 hours.");
    }

    if (bookingEditId === null) {
        if (isOverlapBooking(roomId, date, s_Time, e_Time, null)) {
            alert('This room is already booked!');
            return;
        }
        const newBooking = {
            id: nextBookingId++,
            roomId: Number(roomId),
            date,
            startTime: s_Time,
            endTime: e_Time,
            title,
            description: desc
        };
        bookings.push(newBooking);
        bookingForm.reset();
        loadDropDown();
        renderBooking();
        bookingFilterDropdown();
        selectRoom();// backup
        bookingMode(false);
        renderTodayBooking();
        saveToLocalstorage();
    } else {
        if (isOverlapBooking(roomId, date, s_Time, e_Time, bookingEditId)) {
            return;
        }
        const idx = bookings.findIndex(b => b.id === bookingEditId);
        if (idx === -1) return;

        bookings[idx].roomId = Number(roomId);
        bookings[idx].date = date;
        bookings[idx].startTime = s_Time;
        bookings[idx].endTime = e_Time;
        bookings[idx].title = title;
        bookings[idx].description = desc;

        bookingEditId = null;
        bookingForm.reset();
        loadDropDown();
        bookingMode(false);
        renderBooking();
        renderTodayBooking();
        saveToLocalstorage();
    }
});

// Reset booking form
resetBooking.addEventListener("click", () => bookingForm.reset());