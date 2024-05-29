document.getElementById("submitButton").addEventListener("click", function (event) {
    // Prevent the default form submission
    event.preventDefault();

    // Get the PIN value and group user
    var pin = document.getElementById("main_UserPin").value;
    localStorage.setItem('pin', pin);
    var guser = document.querySelector('[name="user_roles"]').value;
    var engine = document.querySelector('[name="engine_menu"]').value; // Get the selected engine


    var formData = new FormData();
    formData.append('authpin', pin);
    formData.append('Grp_usr', guser);
    formData.append('engine', engine); // Include the engine in the FormData


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

