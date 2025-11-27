
document.addEventListener('DOMContentLoaded', () => {

    const dummyRooms = [
        { id: 1, name: "Conference Room A", capacity: 10 },
        { id: 2, name: "Board Room", capacity: 20 },
    ];

    const dummyBookings = [
        {
            id: 1,
            roomId: 1,
            date: "2025-11-07",
            startTime: "09:00",
            endTime: "10:00",
            title: "Team Sync",
            description: "Weekly status meeting"
        }
    ];

    // let rooms = [...dummyRooms];
    let rooms = JSON.parse(localStorage.getItem('roomData')) || [...dummyRooms];
    // let bookings = [...dummyBookings];
    let bookings = JSON.parse(localStorage.getItem('bookingData')) || [...dummyBookings];
    let nextId = rooms.length ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
    let nextBookingId = bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
    let editingId = null;
    let bookingEditId = null;

    const forms = document.querySelector("form");
    const roomList = document.getElementById("roomList");
    const roomName = document.getElementById("roomName");
    const roomCap = document.getElementById("roomCap");
    const resetRoom = document.getElementById("resetRoom");

    const dropdown = document.getElementById("bookRoom");
    const bookingForm = document.getElementById("bookingForm");
    const bookDate = document.getElementById("bookDate");
    const startTime = document.getElementById("startTime");
    const endTime = document.getElementById("endTime");
    const bookingTitle = document.getElementById("title");
    const bookingDesc = document.getElementById("desc");
    const resetBooking = document.getElementById("resetBooking");
    const filterBooking = document.getElementById("filterBooking");
    const selectedRoomTitle = document.getElementById('selectedRoomTitle');
    const selectedRoomBookings = document.getElementById('selectedRoomBookings');
    const filterCapacity = document.getElementById("filterCapacity");
    const todayBookedRoom = document.getElementById("todayBookedRoom");
    const searchRooms = document.getElementById("searchRoom");

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

    function saveToLocalstorage() {
        localStorage.setItem('roomData', JSON.stringify(rooms));
        localStorage.setItem('bookingData', JSON.stringify(bookings));
    }

    function renderRooms() {
        roomList.innerHTML = '';

        if (!rooms.length) {
            roomList.innerHTML = 'No Rooms Available';
            loadDropDown();
            return;
        }


        rooms.forEach(room => {
            const div = document.createElement('div');
            div.className = 'card p-2 mb-2 d-flex justify-content-between ';
            div.innerHTML =
                `<div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${room.name}</strong>
                        <br/>
                        <span class="text-muted"> - Capacity: ${room.capacity}</span>     
                    </div>
                    <div>
                        <button type="button" class="btn btn-outline-success me-2 edit-room " data-id=${room.id}><i class="bi bi-pencil-square"></i></button>
                        <button type="button" class="btn btn-outline-danger delete-room" data-id=${room.id}><i class="bi bi-trash"></i></button>
                    </div>          
                 </div>`;
            roomList.appendChild(div);
        });

        const btnEdit = roomList.querySelectorAll(".edit-room");
        btnEdit.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                editRooms(id);
            });
        });

        const btnDelete = roomList.querySelectorAll(".delete-room");
        btnDelete.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                deleteRooms(id);
            })
        });

        capacityFilter();
        loadDropDown();
        bookingFilterDropdown();
    }

    function addNewRooms(name, capacity) {

        const existingRoom = rooms.find(room => room.name.toLowerCase() === name.toLowerCase());

        if (existingRoom) {
            // If the room name already exists, show an alert and prevent adding the new room
            alert(`'${name}' already exists. Please choose a different name.`);
            return;
        }
        const newRoom = { id: nextId++, name: name.trim(), capacity: Number(capacity) };
        rooms.push(newRoom);
        console.log('Added room:', newRoom);
        renderRooms();
        forms.reset();
        updateFormMode();
        saveToLocalstorage();

    }

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
        }
        updateFormMode();


    }

    function saveRooms(id, name, capacity) {
        const existingRoom = rooms.find(room => room.name.toLowerCase() === name.toLowerCase());

        if (existingRoom) {
            // If the room name already exists, show an alert and prevent adding the new room
            alert(`'${name}' already exists. Please choose a different name.`);
            return;
        }
        const idx = rooms.findIndex(r => r.id === id);
        if (idx === -1) return;
        rooms[idx].name = name.trim();
        rooms[idx].capacity = Number(capacity);
        console.log('Updated rooms : ', rooms[idx]);
        renderRooms();
        forms.reset();
        editingId = null;
        updateFormMode();
        saveToLocalstorage();
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

    function deleteRooms(id) {
        const room = rooms.find(r => r.id === id);
        if (!room) return;

        const roomBookings = bookings.filter(b => b.roomId === id);

        if (roomBookings.length > 0) {
            const confirmEdit = confirm(`This room is booked. Do you want to edit the bookings instead of deleting the room?`);
            if (confirmEdit) {
                const userChoice = prompt(`Enter "edit" to modify bookings or "transfer" to move bookings to another room.`).toLowerCase();

                if (userChoice === "edit") {
                    editBooking(roomBookings[0].id);
                    return;
                } else if (userChoice === "transfer") {
                    transferBookingToRoom(roomBookings);
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

    function transferBookingToRoom(roomBookings) {
        const availableRooms = rooms.filter(room => !bookings.some(b => b.roomId === room.id));

        if (availableRooms.length === 0) {
            alert('No empty rooms available for transfer.');
            return;
        }

        // const roomOptions = availableRooms.map(room => `${room.id}: ${room.name}`).join("\n");
        const roomOptions = availableRooms.map(room => `${room.name}`).join("\n");

        const selectedRoomName = prompt(`Select a room to transfer bookings to:\n${roomOptions}`);

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

        // Re-render the UI after the transfer
        renderRooms();
        renderBooking();
        renderTodayBooking(); // Update booking list
        saveToLocalstorage(); // Save updated state
    }

    forms.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameVal = roomName ? roomName.value.trim() : '';
        const capVal = roomCap ? roomCap.value : '';
        console.log('Form submit:', { nameVal, capVal });


        if (editingId == null) {
            addNewRooms(nameVal, capVal);
        } else {
            saveRooms(editingId, nameVal, capVal);
        }
    });

    resetRoom.addEventListener("click", () => forms.reset());

    //Bookings
    function loadDropDown() {
        // const prev = dropdown.value;

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
        // if (prev) {
        //     const stillThere = Array.from(dropdown.options).some(o => o.value === prev);
        //     if (stillThere) dropdown.value = prev;
        // }

    }

    function timeToMinutes(t) {
        const [hh, mm] = t.split(':').map(Number);
        return hh * 60 + mm;
    }

    function localTodayISO() {
        const now = new Date();
        const tzOffsetMs = now.getTimezoneOffset() * 60000;
        const local = new Date(now - tzOffsetMs);
        return local.toISOString().slice(0, 10);
    }

    function isOverlapBooking(roomId, date, start, end, ignoreBookingId = null) {
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


    function renderBooking(roomId = '') {
        bookingsContainer.innerHTML = `<h5 class="mb-2">Bookings</h5>`;
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

    function editBooking(id) {

        const booking = bookings.find(b => b.id === id);
        if (!booking) {
            return;
        }
        bookingEditId = id;
        loadDropDown();
        const roomExists = rooms.some(r => r.id === booking.roomId);
        dropdown.value = roomExists ? String(booking.roomId) : dropdown.options[0]?.value || '';

        bookDate.value = booking.date;
        startTime.value = booking.startTime;
        endTime.value = booking.endTime;
        bookingTitle.value = booking.title;
        bookingDesc.value = booking.description || '';
        bookingMode(true);
        // saveToLocalstorage();
    }

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
        renderTodayBooking();
        saveToLocalstorage();
    }

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
            alert('You can not book a past date');
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
            return alert("Minimun  time is 30 minutes.");
        }

        if (duration > maxinumTime) {
            return alert("Maximum time is 4 hours.");
        }

        if (bookingEditId === null) {
            if (isOverlapBooking(roomId, date, s_Time, e_Time, null)) {
                alert('This rooms is already booked!');
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
            dropdown.value = roomId;
            renderBooking();
            renderTodayBooking();
            bookingMode(false);
            saveToLocalstorage();
        } else {
            if (isOverlapBooking(roomId, date, s_Time, e_Time, bookingEditId)) {
                return;
            }
            const idx = bookings.findIndex(b => b.id === bookingEditId);
            if (idx === -1) {
                return;
            }

            bookings[idx].roomId = Number(roomId);
            bookings[idx].date = date;
            bookings[idx].startTime = s_Time;
            bookings[idx].endTime = e_Time;
            bookings[idx].title = title;
            bookings[idx].description = desc;

            bookingEditId = null;
            bookingForm.reset();
            dropdown.value = roomId;
            bookingMode(false);
            renderBooking();
            renderTodayBooking();
            saveToLocalstorage();
        }
    });

    resetBooking.addEventListener("click", () => bookingForm.reset());

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
            const d = document.createElement('div');
            d.className = 'card card p-2 mb-2';
            d.innerHTML = `<div class = "d-flex justify-content-between align-items-start">
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

            selectedRoomBookings.appendChild(d);
        });

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

    function capacityFilter() {
        if (!filterCapacity) {

            return;
        }

        const cap = Array.from(new Set(rooms.map(c => c.capacity))).sort((a, b) => a - b);
        filterCapacity.innerHTML = '';

        const opts = document.createElement('option');
        opts.value = '';
        opts.textContent = 'All Rooms';
        filterCapacity.appendChild(opts);

        cap.forEach(c => {
            const opt = document.createElement('option');
            opt.value = String(c);
            opt.textContent = `Capacity: ${c}`;
            filterCapacity.appendChild(opt);
        })
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

        const btnEdit = roomList.querySelectorAll(".edit-room");
        btnEdit.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                editRooms(id);
            });
        });

        const btnDelete = roomList.querySelectorAll(".delete-room");
        btnDelete.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                deleteRooms(id);
            })
        });
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

        const btnEdit = roomList.querySelectorAll(".edit-room");
        btnEdit.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                editRooms(id);
            });
        });

        const btnDelete = roomList.querySelectorAll(".delete-room");
        btnDelete.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                deleteRooms(id);
            })
        });
    }

    searchRooms.addEventListener("input", (e) => {
        const val = e.target.value;
        searchRoom(val);
    });

    function renderTodayBooking() {
        if (!todayBookedRoom) {
            return;
        }

        const today = localTodayISO();
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

    function expiredBookingRemove() {

        const today = new Date().toISOString().split("T")[0];

        const validBooking = bookings.filter(t => t.date >= today);

        return validBooking;
    }

    bookings = expiredBookingRemove(bookings);
    console.log(bookings);

    renderRooms();
    capacityFilter();
    searchRoom();
    renderTodayBooking();
    // expiredBookingRemove();
    renderBooking();
    updateFormMode();
    bookingFilterDropdown();
    loadDropDown();
    bookingMode(false);

});


