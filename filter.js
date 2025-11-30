const filterBooking = document.getElementById("filterBooking");
const selectedRoomTitle = document.getElementById('selectedRoomTitle');
const selectedRoomBookings = document.getElementById('selectedRoomBookings');
const todayBookedRoom = document.getElementById("todayBookedRoom");
const viewBookingDateBtn = document.getElementById("viewBookingDateBtn");
const datePicker = document.getElementById("datePicker");
const bookingsList = document.getElementById("bookingsList");

function bookingFilterDropdown() {
    if (!filterBooking) return;

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

function selectRoom(id) {
    if (!id) {
        selectedRoomTitle.textContent = 'Choose a room to view its bookings';
        selectedRoomBookings.innerHTML = '';
        return;
    }

    const roomBookings = bookings.filter(b => b.roomId == id).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
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
                    <div><strong>${b.title}</strong> <small class="text-muted">(${room.name})</small> </div>
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
    });
}

filterBooking.addEventListener('change', () => {
    const val = filterBooking.value;
    // renderBooking(val);
    if (val) {
        selectRoom(val);
    }
    else {
        selectedRoomTitle.textContent = 'Choose a room to view its bookings';
        selectedRoomBookings.innerHTML = '';
    }
});

function renderTodayBooking() {
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
                    <div><strong>${td.title}</strong> <small class="text-muted">(${room.name})</small></div>
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

function expiredBookingRemove() {

    const today = new Date().toISOString().split("T")[0];

    const validBooking = bookings.filter(t => t.date >= today);

    return validBooking;
}

bookings = expiredBookingRemove(bookings);
console.log(bookings);


viewBookingDateBtn.addEventListener("click",()=>{
    datePicker.style.display = 'inline-block';
    datePicker.focus();
});

function viewBookingForDate(date) {
    const bookingsDate = bookings.filter(d => d.date === date);
    
    // todayBookedRoom.innerHTML = '';
    bookingsList.innerHTML='';

    if (bookingsDate === 0) {
        // bookingsList.innerHTML = '<div class = "text-muted"> No Bookings for this date.</div>';
        bookingsList.innerHTM = 'No Bookings for this date.'; 
    }else{
        bookingsDate.forEach(booknig => {
            const room = rooms.find(d => d.id === booknig.roomId);
            const card = document.createElement('div');
            card.className = 'card p-2 mb-2';
            card.innerHTML =  `<div class = "d-flex justify-content-between align-items-start">
                <div>
                    <div><strong>${booknig.title}</strong> <small class="text-muted">(${room.name})</small></div>
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
        const selectedDate = e.target.value;
        if (selectedDate) {
            viewBookingForDate(selectedDate);
        }
        datePicker.style.display = 'none';  // Hide the date picker after selection
    });