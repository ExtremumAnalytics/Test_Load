// fetchPDFFiles();

// // Fetch PDF files from the server
// function fetchPDFFiles() {
//     fetch("/fetch_pdf_files")
//     .then(response => response.json()) // Parse response as JSON
//     .then(data => {
//         console.log(data); // Check the data received

//         // Pass the received data directly to displayPDFFiles
//         displayPDFFiles(data.pdf_files);
//     })
//     .catch(error => console.error('Error fetching PDF files:', error));
// }

function closeWindow(){
    self.close();
}



document.addEventListener('DOMContentLoaded', (event) => {
    // const socket = io();
    const socket = io("wss://ea-resource.azurewebsites.net");

    socket.on('connect', () => {
        console.log('Connected to server');
        fetchPDFFiles();
    });

    socket.on('pdf_files', (data) => {
        console.log(data); // Check the data received
        displayPDFFiles(data.pdf_files);
    });

    function fetchPDFFiles() {
        socket.emit('fetch_pdf_files');
    }
    // Pass the received data directly to displayPDFFiles
    displayPDFFiles(data.pdf_files);

    // function closeWindow() {
    //     self.close();
    // }
});

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
        const fileName = row.dataset.fileName; // Get the file name from the row's data attribute
        row.remove();
        
        // Print the file name before sending the request
        console.log('File name:', fileName);

        // Send a request to Flask route
        fetch('/select_pdf_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: fileName,
            })
        })
        .then(response => {
            if (response.ok) {
                // Parse the JSON response to extract the message
                return response.json();
            } else {
                // If the response is not OK, throw an error
                throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            // Now, data should contain the parsed JSON response
            $('#messagedelopload').text(data.message);
            setTimeout(function() {
                $('#messagedelopload').text('');
            }, 8000); // Clear the message after 8 seconds
            console.log(data.message);
        })
        .catch(error => console.error('Error:', error));
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
        fetch('/select_pdf_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: fileName,
                deletePopup: deletePopup
            })
        })
        .then(response => {
            if (response.ok) {
                // Parse the JSON response to extract the message
                return response.json();
            } else {
                // If the response is not OK, throw an error
                throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            // Now, data should contain the parsed JSON response
            $('#messagedelopload').text(data.message);
            setTimeout(function() {
                $('#messagedelopload').text('');
            }, 8000); // Clear the message after 8 seconds
            console.log(data.message);
        })
        .catch(error => console.error('Error:', error));
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
