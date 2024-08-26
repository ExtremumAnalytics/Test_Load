function closeWindow(){
    self.close();
}

// File Manager data fetch code
document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();

    socket.on('connect', () => {
        // console.log('Connected to server');
        fetchPDFFiles();
    });

    socket.on('pdf_files', (data) => {
        // console.log(data); // Check the data received
        displayPDFFiles(data.pdf_files);
    });

    function fetchPDFFiles() {
        socket.emit('fetch_pdf_files');
    }
});

function pdfPopupopen() {
    // Fetch PDF files from folder
    fetchPDFFiles();
}

function fetchPDFFiles() {
    var socket = io(); // Initialize Socket.IO connection

    // Emit the 'fetch_pdf_files' event to the server
    socket.emit('fetch_pdf_files');

    // Listen for the 'pdf_files' event from the server
    socket.on('pdf_files', function(data) {
        // console.log(data); // Check the data received
        displayPDFFiles(data.pdf_files); // Pass the received data to displayPDFFiles
        socket.disconnect(); // Disconnect Socket.IO connection after receiving data
    });

    // Handle any errors
    socket.on('connect_error', function(error) {
        // console.error('Error connecting to server:', error);
    });
}

// Display PDF files in the table
function displayPDFFiles(pdfFiles) {
    const tableBody = document.querySelector('#pdfTable tbody');

    // Display PDF file details in table
    pdfFiles.forEach(pdfFile => {
        const row = document.createElement('tr');
        const checkboxCell = document.createElement('td');
        const nameCell = document.createElement('td');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.onclick = function() {
            updateCrawlCheckbox();
        };
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

        row.appendChild(nameCell);

        tableBody.appendChild(row);
    });

    // Display count of PDF files
    displayStats(pdfFiles.length);
}

// Displays statistics including total scraped files and count of PDF files
function displayStats(totalScrapedFiles) {
    const statsContainer = document.getElementById('statsContainer');

    // Clear existing content in the container
    statsContainer.innerHTML = '';

    // Display total scraped files
    const scrapedFilesElement = document.createElement('p');
    scrapedFilesElement.textContent = `Total Scraped Files: ${totalScrapedFiles}`;
    statsContainer.appendChild(scrapedFilesElement);
}

// Selects  all checkboxes as the "Select All" checkbox
function toggleAllCheckboxes(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('#pdfTable tbody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        if (checkbox.checked) {
            checkbox.parentNode.parentNode.classList.add('selected');
        } else {
            checkbox.parentNode.parentNode.classList.remove('selected');
        }
    });
}

function uploadSelectedFiles() {
    const selectedRows = document.querySelectorAll('#pdfTable tbody tr.selected');
    selectedRows.forEach(row => {
        const fileName = row.dataset.fileName;
        row.remove();

        // console.log('File name:', fileName);

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
            // console.log(data.message);
        });
    });
}

function deletefilelocal() {
    const deletePopup = document.getElementsByName('deletepopupn3')[0].getAttribute('name');
    // console.log(deletePopup);
    const selectedRows = document.querySelectorAll('#pdfTable tbody tr.selected');
    selectedRows.forEach(row => {
        const fileName = row.dataset.fileName; // Get the file name from the row's data attribute
        row.remove();

        // Print the file name before sending the request
        // console.log('File name:', fileName);

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
        // console.log(data.message);
    });

}

// Function to update the header checkbox state based on individual checkbox states
function updateHeaderCheckbox() {
    const headerCheckbox = document.getElementById('select-checkbox');
    const checkboxes = document.querySelectorAll('#pdfTable tbody input[type="checkbox"]');
    headerCheckbox.checked = Array.from(checkboxes).every(checkbox => checkbox.checked);
}

// Add event listener to individual checkboxes to update header checkbox state
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('#pdfTable tbody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (!checkbox.checked) {
                document.getElementById('select-checkbox').checked = false;
            }
            updateHeaderCheckbox();
        });
    });
});

// Function to update the header checkbox state based on individual checkbox states
function updateCrawlCheckbox() {
    const headerCheckbox = document.getElementById('select-checkbox');
    const checkboxes = document.querySelectorAll('#pdfTable tbody input[type="checkbox"]');
    headerCheckbox.checked = Array.from(checkboxes).every(checkbox => checkbox.checked);
}

// Add event listener to individual checkboxes to update header checkbox state
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('#pdfTable tbody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (!checkbox.checked) {
                document.getElementById('select-checkbox').checked = false;
            }
            updateCrawlCheckbox();
        });
    });
});