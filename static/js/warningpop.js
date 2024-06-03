// Session expiry warning
var sessionTimeout = 3600; // 60 seconds = 1 minute 5 min
var warningTimeout = 300; // 10 seconds before session expiry
var lastActivity = new Date().getTime();

// Function to check session status
function checkSession() {
    var currentTime = new Date().getTime();
    var timeElapsed = (currentTime - lastActivity) / 1000; // Time elapsed since last activity in seconds

    if (timeElapsed >= sessionTimeout) {
        // Session expired
        window.location.replace("/logout");
    } else if (timeElapsed >= sessionTimeout - warningTimeout) {
        // Show warning popup
        displayWarning();
    }
}

// Set interval to check session status
setInterval(checkSession, 1000); // Check every 2 seconds

// // Logout button
// document.getElementById("logout").addEventListener("click", function() {
//     window.location.replace("/logout");
// });

// Function to display warning popup
function displayWarning() {
    var popup = document.getElementById("warningpopup");
    popup.style.display = "block";
}

// Function to hide warning popup
function hideWarning() {
    var popup = document.getElementById("warningpopup");
    popup.style.display = "none";

    // Reset last activity time
    lastActivity = new Date().getTime();
}

/// Define the logout function
function logout() {
    // Redirect to logout endpoint
    window.location.replace("/logout");
}

// Function to check session status with the backend
function checkSessionWithBackend() {
    fetch('/checksession', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (!data.sessionValid) {
            logout(); // Call the logout function
        }
    })
    .catch(error => {
        console.error('There was an error checking the session status:', error);
        // Check if the error is due to a 401 response
        if (error.message.includes('401')) {
            // Redirect to the logout page
            logout();
        }
    });
}
checkSessionWithBackend();
// Set interval to check session status with the backend
setInterval(checkSessionWithBackend, 600000); // Check every 10 minutes
