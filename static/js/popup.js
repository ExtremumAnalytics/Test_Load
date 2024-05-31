var socket = io(); // Assuming Socket.IO is initialized correctly
var pin = localStorage.getItem('pin');

function validateForm() {
    var form = document.getElementById('optionsForm');
    var selectedOption = form.querySelector('input[name="option"]:checked');

    if (selectedOption) {
        openPopup(selectedOption.value);
        document.getElementById('warning').style.display = 'none';
    } else {
        document.getElementById('warning').style.display = 'block';
    }
}


// web crawling code with files and all source with if conditions without select deselect features.
function submitForm() {
    var webCrawlingForm = document.getElementById('Web_Crawling');

    if (webCrawlingForm.style.display === 'block') {
        // Execute Web Crawling program
        executeNewProgram();
        // pdfclosePopup();
    } else {
        // Execute default program
        runDefaultProgram();
        // pdfclosePopup();
    }
}

function pdfclosePopup() {
    var doc_template = document.getElementById('fileForm');
    var mp3_template = document.getElementById('audio_file');
    var webCrawl_template = document.getElementById('Web_Crawling');
    var source_URL_template = document.getElementById('SourceURL');
    var database_template = document.getElementById('databaseForm');
    var defaultMsg = document.getElementById('defaultMsg');
    var close = document.getElementById('close');
    var load = document.getElementById('loadData');

    close.style.display = 'block';
    doc_template.style.display= 'none';
    mp3_template.style.display= 'none';
    webCrawl_template.style.display= 'none';
    source_URL_template.style.display= 'none';
    database_template.style.display= 'none';
    defaultMsg.style.display= 'none';
    load.style.display= 'none';
}

function dataLoadUpdate() {
    var doc_template = document.getElementById('fileForm');
    var mp3_template = document.getElementById('audio_file');
    var webCrawl_template = document.getElementById('Web_Crawling');
    var source_URL_template = document.getElementById('SourceURL');
    var database_template = document.getElementById('databaseForm');
    var defaultMsg = document.getElementById('defaultMsg');
    var close = document.getElementById('close');
    var load = document.getElementById('loadData');

    close.style.display = 'none';
    doc_template.style.display= 'none';
    mp3_template.style.display= 'none';
    webCrawl_template.style.display= 'none';
    source_URL_template.style.display= 'none';
    database_template.style.display= 'none';
    defaultMsg.style.display= 'none';
    load.style.display= 'block';
}

// Function to execute new web crawling program
function executeNewProgram() {
    var url = document.getElementById('webCrawlingInput').value;
    console.log("URL to crawl:", url);

    // Sending the URL to the server using Socket.IO
    socket.emit('webcrawler_start', { url: url, login_pin:pin });

    // Update status event
    socket.on('update_status', function(data) {
        if(data.pin==pin){
            console.log("Status Update:", data.status);
            // Update UI with the new status, if needed
            $('#message').text(data.status);
            setTimeout(function() {
                $('#message').text('');
            }, 8000); // 8 seconds later, clear the message
        }
    });

    // Update progress event
    socket.on('update_progress', function(data) {
        if(data.pin==pin){
            console.log("Progress Update:", data);
            // Update UI with the new progress, if needed
            document.getElementById("progress").innerHTML = `
                <label>Current Status: ${data.current_status}</label>
                <label>Total Files:  ${data.total_files}</label>
                <label>Files Downloaded:  ${data.files_downloaded}</label>
                <label>Download Percentage:  ${data.progress_percentage}%</label>
                <label>Current File Name:  ${data.current_file}</label>
            `;
        }
    });
}


function pdfPopupopen() {
    // Show the popup
    // document.getElementById('popupweb').style.display = 'block';

    // Fetch PDF files from folder
    fetchPDFFiles();
}

function fetchPDFFiles() {
    var socket = io(); // Initialize Socket.IO connection

    // Emit the 'fetch_pdf_files' event to the server
    socket.emit('fetch_pdf_files');

    // Listen for the 'pdf_files' event from the server
    socket.on('pdf_files', function(data) {
        console.log(data); // Check the data received
        displayPDFFiles(data.pdf_files); // Pass the received data to displayPDFFiles
        socket.disconnect(); // Disconnect Socket.IO connection after receiving data
    });

    // Handle any errors
    socket.on('connect_error', function(error) {
        console.error('Error connecting to server:', error);
    });
}


// Display PDF files in the table
function displayPDFFiles(pdfFiles) {
    const tableBody = document.querySelector('#pdfTable tbody');

    // Clear existing table rows
    // tableBody.innerHTML = '';

    // Display PDF file details in table
    pdfFiles.forEach(pdfFile => {
        const row = document.createElement('tr');
        const checkboxCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const sizeCell = document.createElement('td');
        const dateCell = document.createElement('td');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        });

        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        // Set the file name in the data-file-name attribute
        row.dataset.fileName = pdfFile;

        nameCell.textContent = pdfFile;
        sizeCell.textContent = 'Size'; // You may replace 'Size' with actual file size if available
        dateCell.textContent = 'Date'; // You may replace 'Date' with actual last modified date if available

        row.appendChild(nameCell);
        row.appendChild(sizeCell);
        row.appendChild(dateCell);

        tableBody.appendChild(row);
    });

    // Display count of PDF files
    displayStats(pdfFiles.length);
}

// Function to display statistics including total scraped files and count of PDF files
function displayStats(totalScrapedFiles) {
    const statsContainer = document.getElementById('statsContainer');

    // Clear existing content in the container
    statsContainer.innerHTML = '';

    // Display total scraped files
    const scrapedFilesElement = document.createElement('p');
    scrapedFilesElement.textContent = `Total Scraped Files: ${totalScrapedFiles}`;
    statsContainer.appendChild(scrapedFilesElement);
}



function deleteSelectedFiles() {
    const selectedRows = document.querySelectorAll('#pdfTable tbody tr.selected');
    selectedRows.forEach(row => {
        const fileName = row.dataset.fileName;
        row.remove();
        
        console.log('File name:', fileName);

        // Send a request to the Flask Socket.IO endpoint
        socket.emit('delete_pdf_file', {
            fileName: fileName,
            login_pin: pin
        });

        socket.on('delete_response', function(data) {
            $('#messagedelopload').text(data.message);
            setTimeout(function() {
                $('#messagedelopload').text('');
            }, 8000);
            console.log(data.message);
        });
    });
}


function deletefilelocal() {
    const deletePopup = document.getElementsByName('deletepopupn3')[0].getAttribute('name');
    console.log(deletePopup);
    const selectedRows = document.querySelectorAll('#pdfTable tbody tr.selected');
    selectedRows.forEach(row => {
        const fileName = row.dataset.fileName; // Get the file name from the row's data attribute
        row.remove();
        
        // Print the file name before sending the request
        console.log('File name:', fileName);

        // Send a request to Flask route
        socket.emit('delete_pdf_file', {
            fileName: fileName,
            deletePopup: deletePopup,
            login_pin: pin // provide the login pin here
        });
    });
    socket.on('delete_response', function(data) {
        $('#messagedelopload').text(data.message);
        setTimeout(function() {
            $('#messagedelopload').text('');
        }, 8000); // Clear the message after 8 seconds
        console.log(data.message);
    });

}


// Function to toggle all checkboxes (select/deselect)
function toggleAllCheckboxes() {
    const checkboxes = document.querySelectorAll('#pdfTable tbody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = !checkbox.checked; // Toggle the checked state
        if (checkbox.checked) {
            checkbox.parentNode.parentNode.classList.add('selected');
        } else {
            checkbox.parentNode.parentNode.classList.remove('selected');
        }
    });
}


// this is default program
function runDefaultProgram() {
    var fileInput = document.getElementById('fileInput');
    var mp3Input = document.getElementById('mp3Input');
    var files;

    if (fileInput && fileInput.files.length > 0) {
        files = fileInput.files;
    } else if (mp3Input && mp3Input.files.length > 0) {
        files = mp3Input.files;
    } else {
        files = []; // Placeholder action
    }

    var formData = new FormData();

    for (var i = 0; i < files.length; i++) {
        formData.append('myFile', files[i]);
    }
    
    var Source_URL = document.getElementsByName('Source_URL')[0].value;
    
    $("#waitImg").show(); // Show the loading image
    formData.append('Source_URL', Source_URL);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/popup_form');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            document.getElementById('message').innerHTML = '<p>' + response.message + '</p>';
            setTimeout(function () {
                document.getElementById('message').innerHTML = '';
            }, 8000);
            $("#waitImg").hide(); // Hide the loading image on success
            pdfclosePopup();
            document.getElementById('popupForm').reset();
        } else {
            document.getElementById('message').innerHTML = '<p>Failed to upload files. Please try again later.</p>';
            setTimeout(function () {
                document.getElementById('message').innerHTML = '';
            }, 8000);
            $("#waitImg").hide(); // Hide the loading image on success
        }
    };

    xhr.send(formData);
    // closePopup();
}

//Load CogniLink Button Press
$(document).ready(function () {
    var socket = io();

    $("#loadCogniLink").click(function () {
        $("#waitImg").show(); // Show the loading image
        $.ajax({
            url: '/Cogni_button',
            type: 'GET',
            success: function (data) {
                $("#waitImg").hide(); // Hide the loading image on success
                $('#message').text(data.message);
                setTimeout(function() {
                    $('#message').text('');
                }, 8000);
                console.log('Data is Loaded:', data);
                dataLoadUpdate();
            },
            error: function (error) {
                console.error('Error in Loading CogniLink data:', error);
                $("#waitImg").hide(); // Hide the loading image on error
            }
        });
    });

    socket.on('button_response', function(msg) {
        if(msg.pin==pin){
            $('#message').text(msg.message);
            setTimeout(function() {
                $('#message').text('');
            }, 8000);
        }
    });
});

function dataLoadUpdate() {
    // Add your logic here to handle data load update
    console.log('Data load update function called');
}