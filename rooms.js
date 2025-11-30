
document.addEventListener('DOMContentLoaded', () => {

    renderRooms();
    capacityFilter();
    searchRoom();
    renderTodayBooking();    
    renderBooking();
    updateFormMode(); 
    bookingFilterDropdown();
    loadDropDown();
    bookingMode(false);

});

let rooms = JSON.parse(localStorage.getItem('roomData')) || [];
let bookings = JSON.parse(localStorage.getItem('bookingData')) || [];
let nextId = rooms.length ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
let nextBookingId = bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
let editingId = null;

const forms = document.querySelector("form");
const roomList = document.getElementById('roomList');
const roomName = document.getElementById('roomName');
const roomCap = document.getElementById('roomCap');
const resetRoom = document.getElementById('resetRoom');
const cleaningTime = document.getElementById("cleaningTime");

const dropdown = document.getElementById("bookRoom");
const filterCapacity = document.getElementById("filterCapacity");
const searchRooms = document.getElementById("searchRoom");

// Save to localStorage
function saveToLocalstorage() {
    localStorage.setItem('roomData', JSON.stringify(rooms));
    localStorage.setItem('bookingData', JSON.stringify(bookings));
}

// Render rooms
function renderRooms() {
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
                    
                    <p>- Cleaning Time: ${room.cleaningTime || "None"}</p>   
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
    const btnEdit = roomList.querySelectorAll('.edit-room');
    btnEdit.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            editRooms(id);
        });
    });

    const btnDelete = roomList.querySelectorAll('.delete-room');
    btnDelete.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            deleteRooms(id);
        });
    });
}

// Add a new room
function addNewRoom(name, capacity,cleaningTimeVal) {
    const existingRoom = rooms.find(room => room.name.toLowerCase() === name.toLowerCase());

        if (existingRoom) {
            // If the room name already exists, show an alert and prevent adding the new room
            alert(`'${name}' already exists. Please choose a different name.`);
            return;
        }
        const newRoom = { 
            id: nextId++, 
            name: name.trim(), 
            capacity: Number(capacity),
            cleaningTime : (cleaningTimeVal || "").trim()
         };

        rooms.push(newRoom);
        console.log('Added room:', newRoom);
        renderRooms();
        forms.reset();
        updateFormMode();
        saveToLocalstorage();
        
}

// Edit an existing room
function editRooms(id) {
    const room = rooms.find(r => r.id === id);
    if (!room) {
        return;
    }
    editingId = id;
    if (roomName) {
        roomName.value = room.name;
    }
    if (roomCap) {
        roomCap.value = room.capacity;
    }if (cleaningTime) {
        cleaningTime.value = room.cleaningTimeVal || "";
    }
    updateFormMode(rooms);


}

function saveRooms(id, name, capacity,cleaningTimeVal) {
     
    const idx = rooms.findIndex(r => r.id === id);
    if (idx === -1) return;
    rooms[idx].name = name.trim();
    rooms[idx].capacity = Number(capacity);
    rooms[idx].cleaningTime = (cleaningTimeVal || "").trim();
    console.log('Updated rooms : ', rooms[idx]);
    renderRooms();
    forms.reset();
    editingId = null;
    updateFormMode(rooms);
    saveToLocalstorage();
}

// Delete a room

function deleteRooms(id) {
        const room = rooms.find(r => r.id === id);
        if (!room) return;

        const roomBookings = bookings.filter(b => b.roomId === id);

        if (roomBookings.length > 0) {
            const confirmEdit = confirm(`This room is booked. Do you want to either "Edit" booking or "Transfer" the room instead of deleting the room?`);
            if (confirmEdit) {
                const userChoice = prompt(`Enter "edit" to modify bookings or "transfer" to move bookings to another room.`).toLowerCase();

                if (userChoice === "edit") {
                    editBooking(roomBookings[0].id);
                    return;
                } else if (userChoice === "transfer") {
                    transferBookingToRoom(roomBookings,id);
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
        // Delete all bookings of this room
        bookings = bookings.filter(b => b.roomId !== id);
        // Re-render UI
        renderRooms();
        renderBooking();
        renderTodayBooking();  // update booking list
        selectRoom(); // filter room list 
        console.log('Delete room id:', id);
        saveToLocalstorage();
    }
// function transferBookingToRoom(roomBookings) {
//     const availableRooms = rooms.filter(room => !bookings.some(b => b.roomId === room.id));

//     if (availableRooms.length === 0) {
//         alert('No empty rooms available for transfer.');
//         return;
//     }

   
//     const roomOptions = availableRooms.map(room => `${room.name}`).join("\n");

//     const selectedRoomName = prompt(`Select a room to transfer bookings to:\n${roomOptions}`);

//     const selectedRoom = availableRooms.find(room => room.name.toLowerCase() === selectedRoomName.toLowerCase());

//     if (!selectedRoom) {
//         alert('Invalid room selection. Please enter a valid room name.');
//         return;
//     }

//     // Transfer each booking to the new room
//     roomBookings.forEach(booking => {
//         const bookingIndex = bookings.findIndex(b => b.id === booking.id);

//         if (bookingIndex !== -1) {
//             bookings[bookingIndex].roomId = selectedRoom.id;  // Update the roomId to the selected room
//         }
//     });

//     alert("Bookings transferred successfully!");

//     // Re-render the UI after the transfer
//     renderRooms();
//     renderBooking();
//     renderTodayBooking(); // Update booking list
//     saveToLocalstorage(); // Save updated state
// }

function transferBookingToRoom(roomBookings,id) {
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
        const bookingIndex = bookings.findIndex(b => b.id === booking.id);

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

function updateFormMode() {
    const submitBtn = forms.querySelector('button[type="submit"]');
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



function capacityFilter() {
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

function selectCapacity(selectedCap) {
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

        // roomList.innerHTML = '';
        renderRooms();
    }
});

function loadDropDown() {
    if (!dropdown) return;
    dropdown.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- Select Room --';
    opt.disabled = true;
    dropdown.appendChild(opt);
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.name} (Capacity: ${room.capacity})`;
        dropdown.appendChild(option);
    });
}

// Submit the room form
forms.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = roomName.value.trim();
    const capVal = roomCap.value;
    const cleaningTimeVal = cleaningTime.value.trim();
    if (editingId === null) {
        addNewRoom(nameVal, capVal,cleaningTimeVal);
    } else {
        saveRooms(editingId,nameVal,capVal,cleaningTimeVal);
    }
});

function searchRoom(query) {
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

searchRooms.addEventListener("input", (e) => {
    const val = e.target.value;
    searchRoom(val);
});

resetRoom.addEventListener("click", () => forms.reset());