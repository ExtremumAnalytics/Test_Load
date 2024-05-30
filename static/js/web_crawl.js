function closeWindow(){
    self.close();
}

// File Manager data fetch code
document.addEventListener('DOMContentLoaded', (event) => {
    // const socket = io("wss://ea-resource.azurewebsites.net");
    const socket = io();

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

// Delete seleted file from file manager
function deleteSelectedFiles() {
    const socket = io();
    const selectedRows = document.querySelectorAll('#pdfTable tbody tr.selected');
    selectedRows.forEach(row => {
        const fileName = row.dataset.fileName; // Get the file name from the row's data attribute

        // Send a request to Flask route via Socket.IO
        socket.emit('delete_pdf_file', {
            fileName: fileName
        });
        row.remove();
        // Print the file name before sending the request
        console.log('File name:', fileName);
    });

    // Define the event listener for delete_response outside the deleteSelectedFiles function
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
