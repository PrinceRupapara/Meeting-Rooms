import { editBooking, renderBooking } from "./bookings.js";
import { bookingFilterDropdown, renderTodayBooking, selectRoom } from "./filter.js";
import { type Booking, type Room, bookings, saveBookingStorage, saveRoomStorage } from "./store.js";
// import { type Rooms } from "./types";
// import { isOverlapBooking } from "./utils";



export let rooms: Room[] = JSON.parse(localStorage.getItem('roomData') ?? '[]') || [];
let nextId: number = rooms.length ? Math.max(...rooms.map(r => r.id)) + 1 : 1;

let editingId: number | null = null;

const forms = document.querySelector<HTMLFormElement>("form");
const roomList = document.getElementById('roomList') as HTMLDivElement || null;
const roomName = document.getElementById('roomName') as HTMLInputElement || null;
const roomCap = document.getElementById('roomCap') as HTMLInputElement || null;
const resetRoom = document.getElementById('resetRoom') as HTMLButtonElement || null;
const cleaningStartTime = document.getElementById("cleaningStartTime") as HTMLInputElement || null;
const cleaningEndTime = document.getElementById("cleaningEndTime") as HTMLInputElement || null;

export const dropdown = document.getElementById("bookRoom") as HTMLSelectElement || null;
const filterCapacity = document.getElementById("filterCapacity") as HTMLSelectElement || null;
const searchRooms = document.getElementById("searchRoom") as HTMLInputElement || null;

// Save to localStorage
export function saveToLocalstorage() {
    saveRoomStorage();
    saveBookingStorage();
}

// Render rooms
export function renderRooms() {
    if (!roomList) {
        return;
    }
    roomList.innerHTML = '';
    if (!rooms.length) {
        roomList.innerHTML = 'No Rooms Available';
        loadDropDown();
        return;
    }

    rooms.forEach(room => {
        const div = document.createElement('div');
        div.className = 'card p-2 mb-2 d-flex justify-content-between';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${room.name}</strong><br/>
                    <span class="text-muted"> - Capacity: ${room.capacity}</span> 
                    
                    <p class="fs-6">- Cleaning Time: ${room.cleaningStartTime} - ${room.cleaningEndTime}</p>   
                </div>
                <div>
                    <button type="button" class="btn btn-outline-success me-2 edit-room" data-id=${room.id}><i class="bi bi-pencil-square"></i></button>
                    <button type="button" class="btn btn-outline-danger delete-room" data-id=${room.id}><i class="bi bi-trash"></i></button>
                </div>
            </div>`;
        roomList.appendChild(div);
    });
    capacityFilter();
    loadDropDown();
    bookingFilterDropdown();
    addRoomEventListeners();
}

// Event listeners for editing and deleting rooms
function addRoomEventListeners() {
    if (!roomList) {
        return;
    }
    const btnEdit = roomList.querySelectorAll<HTMLButtonElement>('.edit-room');
    btnEdit.forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
            const target = e.currentTarget as HTMLButtonElement;
            const dataId = target.dataset.id;
            if (!dataId) return;
            const id = parseInt(dataId, 10);
            editRooms(id);
        });
    });

    const btnDelete = roomList.querySelectorAll<HTMLButtonElement>('.delete-room');
    btnDelete.forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
            const target = e.currentTarget as HTMLButtonElement;
            const dataId = target.dataset.id;
            if (!dataId) return;
            const id = parseInt(dataId, 10);
            deleteRooms(id);
        });
    });
}

// Add a new room
function addNewRoom(name, capacity, cleaningStartTime, cleaningEndTime) {

    const nameTrimmed = name.trim();
    const capNum = Number(capacity);
    const cleanStart = String(cleaningStartTime);
    const cleanEnd = String(cleaningEndTime);
    const existingRoom = rooms.find(room => room.name.toLowerCase() === name.toLowerCase());

    if (existingRoom) {
        // If the room name already exists, show an alert and prevent adding the new room
        alert(`'${name}' already exists. Please choose a different name.`);
        return;
    }
    const newRoom: Room = {
        id: nextId++,
        name: nameTrimmed,
        capacity: capNum,
        cleaningStartTime: cleanStart,
        cleaningEndTime: cleanEnd,
    };

    rooms.push(newRoom);
    console.log('Added room:', newRoom);
    renderRooms();

    if (forms) forms.reset();
    updateFormMode();
    saveToLocalstorage();

}


// Edit an existing room
function editRooms(id: number) {
    const room = rooms.find(r => r.id === id);
    if (!room) {
        return;
    }
    editingId = id;
    if (roomName) {
        roomName.value = room.name;
    }
    if (roomCap) {
        roomCap.value = String(room.capacity);
    } if (cleaningStartTime) {
        cleaningStartTime.value = String(room.cleaningStartTime);
    }
    if (cleaningEndTime) {
        cleaningEndTime.value = String(room.cleaningEndTime);
    }
    updateFormMode();


}

function saveRooms(id: number, name: string, capacity: number, cleaningStartTime: string, cleaningEndTime: string) {

    const room = rooms.find(r => r.id === id);
    if (!room) {

        return;
    }
    // if (room === -1) return;
    console.log(rooms);
    console.log('room - ', room);
    // console.log('id ', id);
    const nameTrimmed = name.trim();
    const capNum = Number(capacity);
    const cleanStart = String(cleaningStartTime);
    const cleanEnd = String(cleaningEndTime);

    room.name = nameTrimmed;
    room.capacity = capNum;
    room.cleaningStartTime = cleanStart ?? "";
    room.cleaningEndTime = cleanEnd ?? "";


    console.log('Updated rooms : ', rooms);
    renderRooms();

    if (forms) forms.reset();
    editingId = null;
    updateFormMode();
    saveToLocalstorage();
}

// Delete a room

function deleteRooms(id: number) {
    const room = rooms.find(r => r.id === id);
    if (!room) return;

    const roomBookings = bookings.filter(b => b.roomId === id);

    if (roomBookings.length > 0) {
        const confirmEdit = confirm(`This room is booked. Do you want to either "Edit" booking or "Transfer" the room instead of deleting the room?`);
        if (confirmEdit) {
            const userChoice = prompt(`Enter "edit" to modify bookings or "transfer" to move bookings to another room.`) ?? ''.toLowerCase();

            const firstBooking = roomBookings[0];
            if (!firstBooking) {
                alert('no booking found');
                return;
            }
            if (userChoice === "edit") {
                editBooking(firstBooking.id);
                return;
            } else if (userChoice === "transfer") {
                transferBookingToRoom(roomBookings, id);
                return;
            } else {
                alert("Invalid choice. Please select 'edit' or 'transfer'");
                return;
            }
        } else {
            return;
        }
    }

    const ok = confirm(`Are you sure? you want to Delete "${room.name}" ?`);
    if (!ok) return;

    rooms = rooms.filter(r => r.id !== id);
    console.log(room);
    // Delete all bookings of this room
    const booking = bookings.filter(b => b.roomId !== id);
    console.log(booking);
    // Re-render UI
    renderRooms();
    renderBooking();
    renderTodayBooking();  // update booking list
    selectRoom(id); // filter room list 
    console.log('Delete room id:', id);
    saveToLocalstorage();
}


function transferBookingToRoom(roomBookings: Booking[], id: number) {
    const room = rooms.find(r => r.id === id);
    if (!room) {
        alert('Source room not found.');
        return false;
    }

    const availableRooms = rooms.filter(r => r.id !== id && r.capacity >= room.capacity);
    if (availableRooms.length === 0) {
        alert('No rooms with equal or larger capacity available for transfer.\n you can not delete a room');
        return false;
    }

    const roomOptions = availableRooms.map(room => `${room.name}`).join("\n");
    const selectedRoomName = prompt(`Select a room to transfer bookings to:\n${roomOptions}`);
    if (!selectedRoomName) {
        alert('No room selected. Transfer cancelled.');
        return false;
    }

    const selectedRoom = availableRooms.find(room => room.name.toLowerCase() === selectedRoomName.toLowerCase());

    if (!selectedRoom) {
        alert('Invalid room selection. Please enter a valid room name.');
        return;
    }

    // Transfer each booking to the new room
    roomBookings.forEach(booking => {
        const bookingIndex = bookings.findIndex(b => b.id === booking.id) || '';

        if (bookingIndex !== -1) {
            bookings[bookingIndex].roomId = selectedRoom.id;  // Update the roomId to the selected room
        }
    });

    alert("Bookings transferred successfully!");

    saveToLocalstorage();
    renderRooms();
    renderBooking();
    renderTodayBooking();

    return true;
}

export function updateFormMode() {
    if (!forms) return;
    const submitBtn = forms.querySelector<HTMLDivElement>('button[type="submit"]');
    if (!submitBtn) return;
    if (editingId === null) {
        submitBtn.textContent = 'Save';
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-primary');
    } else {
        submitBtn.textContent = 'Update';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-warning');
    }
}

export function capacityFilter() {
    if (!filterCapacity) {
        return;
    }

    const uniqueCapacities = Array.from(new Set(rooms.map(room => room.capacity)))
        .sort((a, b) => a - b);
    filterCapacity.innerHTML = '';


    const allRoomsOption = document.createElement('option');
    allRoomsOption.value = '';
    allRoomsOption.textContent = 'All Rooms';
    filterCapacity.appendChild(allRoomsOption);

    uniqueCapacities.forEach(capacity => {
        const option = document.createElement('option');
        option.value = String(capacity);
        option.textContent = `Capacity: ${capacity}`;
        filterCapacity.appendChild(option);
    });
}

function selectCapacity(selectedCap: string | null) {
    if (!roomList) return;
    if (!selectedCap) {
        renderRooms();
        return;
    }

    const capNum = Number(selectedCap);
    const roomCap = rooms.filter(r => r.capacity == capNum);
    roomList.innerHTML = '';

    if (!roomCap.length) {
        roomList.innerHTML = '<div class="muted">No room.</div>';
        return;
    }

    roomCap.forEach(c => {
        // const room = rooms.find(r => r.id === c.roomId);
        const d = document.createElement('div');
        d.className = 'card card p-2 mb-2';
        d.innerHTML = `<div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${c.name}</strong>
                        <br/>
                        <span class="text-muted"> - Capacity: ${c.capacity}</span>     
                    </div>
                    <div>
                        <button type="button" class="btn btn-outline-success me-2 edit-room" data-id=${c.id}><i class="bi bi-pencil-square"></i></button>
                        <button type="button" class="btn btn-outline-danger delete-room" data-id=${c.id}><i class="bi bi-trash"></i></button>
                    </div>          
                 </div>`;

        roomList.appendChild(d);
    });

    addRoomEventListeners();

}

filterCapacity.addEventListener('change', () => {
    const val = filterCapacity.value;

    if (val) {
        selectCapacity(val);
    } else {
        renderRooms();
    }
});

export function loadDropDown() {
    if (!dropdown) return;
    dropdown.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- Select Room --';
    opt.disabled = true;
    dropdown.appendChild(opt);
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = String(room.id);
        option.textContent = `${room.name} (Capacity: ${room.capacity})`;
        dropdown.appendChild(option);
    });
}

// Submit the room form
if (forms) {
    forms.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = roomName?.value ?? '';
        const capVal = roomCap?.value ?? '';
        const cleaningStart = cleaningStartTime?.value ?? '';
        const cleaningEnd = cleaningEndTime?.value ?? '';

        if (editingId === null) {
            addNewRoom(nameVal, Number(capVal), cleaningStart, cleaningEnd);


        } else {
            saveRooms(editingId, nameVal, Number(capVal), cleaningStart, cleaningEnd);
        }
    });
}

export function searchRoom(query: string) {
    if (!roomList) return;
    if (!query) {
        renderRooms();
        return;
    }

    const q = query.trim().toLowerCase();

    const RoomSearch = rooms.filter(s => s.name.toLowerCase().includes(q));
    roomList.innerHTML = '';

    if (!RoomSearch.length) {
        roomList.innerHTML = '<div class="muted">No room.</div>';
        return;
    }

    RoomSearch.forEach(search => {
        const div = document.createElement('div');
        div.className = 'card p-2 mb-2 d-flex justify-content-between ';
        div.innerHTML =
            `<div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${search.name}</strong>
                        <br/>
                        <span class="text-muted"> - Capacity: ${search.capacity}</span>     
                    </div>
                    <div>
                        <button type="button" class="btn btn-outline-success me-2 edit-room " data-id=${search.id}><i class="bi bi-pencil-square"></i></button>
                        <button type="button" class="btn btn-outline-danger delete-room" data-id=${search.id}><i class="bi bi-trash"></i></button>
                    </div>          
                 </div>`;
        roomList.appendChild(div);
    });

    addRoomEventListeners();
}

searchRooms.addEventListener("input", (e: Event) => {
    const val = e.target as HTMLInputElement;
    searchRoom(val.value);
});

resetRoom.addEventListener("click", () => forms?.reset());