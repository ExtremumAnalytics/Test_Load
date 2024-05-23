// document.addEventListener("DOMContentLoaded", function() {
//     const socket = io();

//     // Handle login success
//     socket.on('login_success', function(data) {
//         alert(data.message);
//         window.location.href = data.redirect;
//     });

//     // Handle login failure
//     socket.on('login_failed', function(data) {
//         alert(data.message);
//         window.location.href = data.redirect;
//     });

//     // Handle login failure
//     socket.on('logout_success', function(data) {
//         alert(data.message);
//         window.location.href = data.redirect;
//     });

//     document.getElementById("submitButton").addEventListener("click", function(event) {
//         // Prevent the default form submission
//         event.preventDefault();

//         // Get the PIN value and group user
//         var pin = document.getElementById("main_UserPin").value;
//         localStorage.setItem('pin', pin);
//         var guser = document.querySelector('[name="user_roles"]').value;

//         var formData = new FormData();
//         formData.append('authpin', pin);
//         formData.append('Grp_usr', guser);

//         // Perform an AJAX request
//         fetch('/', {
//             method: 'POST',
//             body: formData
//         })
//         .then(response => response.text()) // Handle response as text since we don't need the body
//         .then(() => {
//             socket.emit('login_success');
//             socket.emit('login_failed');
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
//     });
// });





document.getElementById("submitButton").addEventListener("click", function (event) {
    // Prevent the default form submission
    event.preventDefault();

    // Get the PIN value and group user
    var pin = document.getElementById("main_UserPin").value;
    localStorage.setItem('pin', pin);
    var guser = document.querySelector('[name="user_roles"]').value;

    var formData = new FormData();
    formData.append('authpin', pin);
    formData.append('Grp_usr', guser);

    // Perform an AJAX request
    fetch('/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())  //response is in JSON format
    .then(data => {
        // Check if the response contains a redirect URL
        if (data.redirect) {
            window.location.href = data.redirect;
        } else if (data.error) {
            // Handle the error message, e.g., show a flash message
            console.error(data.error);
            // Update the page or handle the response as needed
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});


// document.addEventListener("DOMContentLoaded", function() {
//     const socket = io();

//     // Handle the Socket.IO events
//     socket.on('login_success', function(data) {
//         alert(data.message);
//         window.location.href = data.redirect;
//     });

//     socket.on('login_failed', function(data) {
//         alert(data.message);
//     });

//     socket.on('logout_success', function(data) {
//         alert(data.message);
//         window.location.href = "/";
//     });

//     document.getElementById("submitButton").addEventListener("click", function(event) {
//         // Prevent the default form submission
//         event.preventDefault();

//         // Get the PIN value and group user
//         var pin = document.getElementById("main_UserPin").value;
//         localStorage.setItem('pin', pin);
//         var guser = document.querySelector('[name="user_roles"]').value;

//         var formData = new FormData();
//         formData.append('authpin', pin);
//         formData.append('Grp_usr', guser);

//         // Perform an AJAX request
//         fetch('/', {
//             method: 'POST',
//             body: formData
//         })
//         .then(response => response.json())  //response is in JSON format
//         .then(data => {
//             socket.on('login_success', function(data) {
//                 alert(data.message);
//                 window.location.href = data.redirect;
//             });
//             // Check if the response contains a redirect URL
//             if (data.redirect) {
//                 window.location.href = data.redirect;
//             } else if (data.error) {
//                 // Handle the error message, e.g., show a flash message
//                 console.error(data.error);
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
//     });
// });
