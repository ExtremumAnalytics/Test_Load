document.addEventListener('DOMContentLoaded', function() {
    socket.emit('get_guest_users');

    socket.on('guest_users_data', function(data) {
        if (data.error) {
            alert(data.error);
            return;
        }

        const userDropdown = document.getElementById('selectUser');

        // Populate user dropdown
        data.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.text = `${user.first_name} ${user.last_name}`;
            userDropdown.add(option);
        });
    });

    // Join the room for real-time notifications
    var userId = localStorage.getItem('pin');
    socket.emit('join', { userID: userId });

    // // Fetch existing notices
    // socket.emit('get_notices', { userID: userId });

    // // Listen for existing notices
    // socket.on('notices_data', function(data) {
    //     if (data.error) {
    //         alert(data.error);
    //         return;
    //     }
    //     console.log('Old Notice', data);

    //     const notificationDropdown = document.getElementById('notificationDropdown');

    //     // Populate existing notices
    //     data.notices.forEach(notice => {
    //         const noticeDiv = document.createElement('div');
    //         noticeDiv.className = 'dropdown-item';
    //         noticeDiv.textContent = notice.message;
    //         notificationDropdown.appendChild(noticeDiv);
    //     });
    // });

    // Listen for new notices
    socket.on('new_notice', function(data) {
        // Add the notice to the notification dropdown
        const notificationDropdown = document.getElementById('notificationDropdown');
        const noticeDiv = document.createElement('div');
        noticeDiv.className = 'dropdown-item';
        noticeDiv.textContent = data.message;
        notificationDropdown.appendChild(noticeDiv);

        // Display a notification to the user
        alert(`New message: ${data.message}`);
    });

    // Listen for new drafts
    socket.on('new_draft', function(data) {
        const notificationDropdown = document.getElementById('notificationDropdown');
        const draftDiv = document.createElement('div');
        draftDiv.className = 'dropdown-item';
        draftDiv.textContent = data.message;
        notificationDropdown.appendChild(draftDiv);

        // Display a notification to the user
        alert(`New message: ${data.message}`);
    });
});

function sendNotice() {
    const userID = document.getElementById('selectUser').value;
    const notice = document.getElementById('noticeInput').value.trim();

    if (!notice) {
        alert('Please enter a message.');
        return;
    }

    socket.emit('send_notice', { userID, notice });

    socket.on('notice_status',function (data){
        // console.log(data.message);
        document.getElementById('message').innerHTML = data.message;
            setTimeout(function () {
                document.getElementById('message').innerHTML = '';
            }, 8000);
    })
}