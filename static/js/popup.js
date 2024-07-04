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
function submitForm(input_prm) {
    var webCrawlingForm = document.getElementById('Web_Crawling');

    if (webCrawlingForm.style.display === 'block') {
        // Execute Web Crawling program
        executeNewProgram();
    } else {
        // Execute default program
        runDefaultProgram(input_prm);
    }
}

function stop_all() {
    let stop_flag = true;
    socket.emit('stop_process', { login_pin:pin, stop_flag: stop_flag });
    console.log(' stop button is  pressed')

    socket.on('stop_process_flag', function(data){
        if(data.pin==pin){
            console.log('Flag value received:',data.flag)
        }
    });
}

function pdfclosePopup() {
    var doc_template = document.getElementById('fileForm');
    var mp3_template = document.getElementById('audio_file');
    var webCrawl_template = document.getElementById('Web_Crawling');
    var source_URL_template = document.getElementById('SourceURL');
    var database_template = document.getElementById('databaseForm');
    var image_template = document.getElementById('image_file');
    var defaultMsg = document.getElementById('defaultMsg');
    var close = document.getElementById('close');
    var load = document.getElementById('loadData');

    defaultMsg.style.display = 'block';
    doc_template.style.display= 'none';
    mp3_template.style.display= 'none';
    webCrawl_template.style.display= 'none';
    source_URL_template.style.display= 'none';
    database_template.style.display= 'none';
    image_template.style.display= 'none';
    close.style.display= 'none';
    load.style.display= 'none';
}

function linkDataPopup() {
    var doc_template = document.getElementById('fileForm');
    var mp3_template = document.getElementById('audio_file');
    var image_template = document.getElementById('image_file');
    var webCrawl_template = document.getElementById('Web_Crawling');
    var source_URL_template = document.getElementById('SourceURL');
    var database_template = document.getElementById('databaseForm');
    var defaultMsg = document.getElementById('defaultMsg');
    var close = document.getElementById('close');
    var load = document.getElementById('loadData');

    defaultMsg.style.display = 'none';
    doc_template.style.display= 'none';
    mp3_template.style.display= 'none';
    image_template.style.display= 'none';
    webCrawl_template.style.display= 'none';
    source_URL_template.style.display= 'none';
    database_template.style.display= 'none';
    close.style.display= 'block';
    load.style.display= 'none';
}

function dataLoadUpdate() {
    var doc_template = document.getElementById('fileForm');
    var mp3_template = document.getElementById('audio_file');
    var webCrawl_template = document.getElementById('Web_Crawling');
    var source_URL_template = document.getElementById('SourceURL');
    var database_template = document.getElementById('databaseForm');
    var image_template = document.getElementById('image_file');
    var defaultMsg = document.getElementById('defaultMsg');
    var close = document.getElementById('close');
    var load = document.getElementById('loadData');

    close.style.display = 'none';
    doc_template.style.display= 'none';
    mp3_template.style.display= 'none';
    webCrawl_template.style.display= 'none';
    source_URL_template.style.display= 'none';
    database_template.style.display= 'none';
    image_template.style.display= 'none';
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



function uploadSelectedFiles() {
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
function runDefaultProgram(called_from) {
    var fileInput = document.getElementById('fileInput');
    var mp3Input = document.getElementById('mp3Input');
    var Image_input = document.getElementById('input_image');
    var lang = document.getElementById('lang').value;
    var files;

    if (fileInput && fileInput.files.length > 0) {
        files = fileInput.files;
    } else if (mp3Input && mp3Input.files.length > 0) {
        files = mp3Input.files;
    } else if (Image_input && Image_input.files.length > 0) {
        files = Image_input.files;
    } else {
        files = []; // Placeholder action
    }

    var formData = new FormData();

    for (var i = 0; i < files.length; i++) {
        formData.append('myFile', files[i]);
    }
    if(called_from=='image_file'){
        formData.append('selected_language', lang);
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
            linkDataPopup();
            updateTable();
            // Reset the input fields
            // fileInput.value = '';
            // mp3Input.value = '';
            // Image_input.value = '';
            // lang.value = '';
            document.getElementsByName('Source_URL')[0].value = '';
            // document.getElementById('popupForm').reset();
        } else {
            document.getElementById('message').innerHTML = '<p>Failed to upload files. Please try again later.</p>';
            setTimeout(function () {
                document.getElementById('message').innerHTML = '';
            }, 8000);
            updateTable();
            $("#waitImg").hide(); // Hide the loading image on success
        }
    };

    xhr.send(formData);
    document.getElementById('fileInput').value='';
    document.getElementById('mp3Input').value = '';
    document.getElementById('input_image').value = '';
    // closePopup();
}

// Progress Updation Start
socket.on('pending', function(data){
    console.log('Pending',data);
});

socket.on('failed', function(data){
    console.log('Failed',data);
});

socket.on('success', function(data){
    console.log('Success',data);
});
// Progress Updation End

function updateProgressBar(percentage) {
    $("#waitImg1").css("width", percentage + "%");
    $("#waitImg1").attr("aria-valuenow", percentage);
    $("#waitImg1").text(percentage + "%");
}

//Load CogniLink Button Press
$(document).ready(function () {
    var socket = io();

    $("#loadCogniLink").click(function () {
        $(".progress").show(); //Show the progress bar
        $("#waitImg1").show(); // Show the loading image
        socket.on('progress', function(data){
            if(data.pin==pin){
                console.log('Percentage:',data.percentage);
                updateProgressBar(data.percentage);
            }
        });
        $.ajax({
            url: '/Cogni_button',
            type: 'GET',
            success: function (data) {
                updateTable();
                $("#waitImg1").hide(); // Hide the loading image on success
                $(".progress").hide(); //Hide the progress bar
                $('#message').text(data.message);
                setTimeout(function() {
                    $('#message').text('');
                }, 8000);
                console.log('Data is Loaded:', data);
                dataLoadUpdate();
            },
            error: function (error) {
                console.error('Error in Loading CogniLink data:', error);
                $("#waitImg1").hide(); // Hide the loading image on success
                $(".progress").hide(); //Hide the progress bar
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

// Open a new window
function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

// Open source url in new tab 
function openFileInNewTab(url) {
    var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
    var win = window.open(googleDocsUrl, '_blank');
    win.focus();
}

// Checking and returning the different file types START
function isPDF(filename) {
    return filename.toLowerCase().endsWith('.pdf');
}

function isExcel(filename) {
    return filename.toLowerCase().endsWith('.xls') || filename.toLowerCase().endsWith('.xlsx');
}

function isWord(filename) {
    return (
        filename.toLowerCase().endsWith('.doc') ||
        filename.toLowerCase().endsWith('.docx') ||
        filename.toLowerCase().endsWith('.rtf')
    );
}

function isPowerPoint(filename) {
    return (
        filename.toLowerCase().endsWith('.ppt') ||
        filename.toLowerCase().endsWith('.pptx')
    );
}


function isImage(filename) {
    return filename.toLowerCase().endsWith('.jpeg') ||
           filename.toLowerCase().endsWith('.jpg') ||
           filename.toLowerCase().endsWith('.png');
}


// function updateTable(searchTerm) {
//     $.ajax({
//         url: '/table_update',
//         method: 'GET',
//         dataType: 'json',
//         success: function(response) {
//             // Clear existing table rows
//             $('#table-body').empty();
            
//             // Populate the table with new data
//             response.forEach(function(blob) {
//                 // Extract the name from the URL
//                 var url_blob = blob.source_url;
//                 var name = blob.name.split('/').pop();
                
//                 // If search term is provided and the filename doesn't match, skip
//                 if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
//                     return;
//                 }

//                 // Construct the row with customized column headers
//                 var checkboxValue, nameDisplay;

//                 if (url_blob) {
//                     checkboxValue = url_blob;
//                     nameDisplay = url_blob.replace("https://", "");
//                 } else {
//                     checkboxValue = blob.name;
//                     nameDisplay = blob.name;
//                 }
//                 var row = '<tr>' +
//                           '<td><input type="checkbox" id="select-checkbox" name="selected_blob" onclick="updateHeaderCheckbox()" value="' + checkboxValue + '"></td>' +
//                           '<td>' + nameDisplay + '</td>' +
//                           '<td>';

//                 if (isExcel(name)) {
//                     // If it's an Excel file, open it in a new tab
//                     row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Excel</a>';
//                 } else if (isPDF(name)) {
//                     // If it's a PDF, open it in a new tab
//                     row += '<a href="javascript:void(0);" onclick="openInNewTab(\'' + blob.url + '\')">View PDF</a>';
//                 } else if (isWord(name)) {
//                     // If it's a Word document, open it in a new tab
//                     row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Word</a>';
//                 } else if (isImage(name)) {
//                     // If it's an image, open it directly in the browser
//                     row += '<a href="' + blob.url + '" target="_blank">View Image</a>';
//                 } else if (isPowerPoint(name)) {
//                     // If it's a PowerPoint presentation, open it in a new tab
//                     row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View PowerPoint</a>';
//                 } else if (url_blob) {
//                     row += '<a href="' + url_blob + '" target="_blank">View Website</a>';
//                 } else {
//                     // If it's none of the above, open it directly in the browser
//                     row += '<a href="' + blob.url + '" target="_blank">View</a>';
//                 }

//                 row += '</td><td class="action-links">';
                
//                 if (url_blob) {
//                     row += 'N/A';
//                 } else {
//                     row += '<a href="' + blob.url + '" download="' + name + '">Download</a>';
//                 }

//                 row += '</td><td>' + blob.status + '</td></tr>';
//                 $('#table-body').append(row);
//             });
//         },
//         error: function(xhr, status, error) {
//             console.error('Error updating table:', error);
//         }
//     });
// }

function updateTable(searchTerm) {
    $.ajax({
        url: '/table_update',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            // Clear existing table rows
            $('#table-body').empty();
            
            // Populate the table with new data
            response.forEach(function(blob) {
                // Extract the name from the URL
                var url_blob = blob.source_url;
                var name = blob.name.split('/').pop();
                
                // If search term is provided and the filename doesn't match, skip
                if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
                    return;
                }

                // Construct the row with customized column headers
                var checkboxValue, nameDisplay;

                if (blob.name === "https:") {
                    // Split the URL by slashes
                    const parts = url_blob.split('/');
                    
                    // Extract the specific parts
                    const domain = parts[2]; // "flask-socketio.readthedocs.io"
                    lastPart = parts[parts.length - 1]; // "flask_socketio.SocketIOTestClient.get_received"
                    
                    checkboxValue = url_blob;
                    nameDisplay = domain +'/' + lastPart; // Extracted domain
                } else {
                    checkboxValue = blob.name;
                    nameDisplay = blob.name;
                    lastPart = ""; // No last part to display when blob.name is not "https:"
                }

                var row = '<tr>' +
                          '<td><input type="checkbox" id="select-checkbox" name="selected_blob" onclick="updateHeaderCheckbox()" value="' + checkboxValue + '"></td>' +
                          '<td>' + nameDisplay + '</td>' +
                          '<td>';

                if (isExcel(name)) {
                    // If it's an Excel file, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Excel</a>';
                } else if (isPDF(name)) {
                    // If it's a PDF, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openInNewTab(\'' + blob.url + '\')">View PDF</a>';
                } else if (isWord(name)) {
                    // If it's a Word document, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Word</a>';
                } else if (isImage(name)) {
                    // If it's an image, open it directly in the browser
                    row += '<a href="' + blob.url + '" target="_blank">View Image</a>';
                } else if (isPowerPoint(name)) {
                    // If it's a PowerPoint presentation, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View PowerPoint</a>';
                } else if (blob.name === "https:") {
                    row += '<a href="' + url_blob + '" target="_blank">View Website</a>';
                } else {
                    // If it's none of the above, open it directly in the browser
                    row += '<a href="' + blob.url + '" target="_blank">View</a>';
                }

                row += '</td><td class="action-links">';
                
                if (blob.name === "https:") {
                    row += 'N/A';  // Display 'N/A' if url_blob exists
                } else {
                    row += '<a href="' + blob.url + '" download="' + name + '">Download</a>';  // Provide download link if url_blob doesn't exist
                }

                row += '</td><td>' + blob.status + '</td></tr>';
                $('#table-body').append(row);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error updating table:', error);
        }
    });
}





// Set interval to check session status
// setInterval(updateTable, 15000); // Check every 2 seconds

// Function to set all checkboxes to the same state as the "Select All" checkbox
function toggleSelectAll(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('#data-table tbody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        if (checkbox.checked) {
            checkbox.parentNode.parentNode.classList.add('selected');
        } else {
            checkbox.parentNode.parentNode.classList.remove('selected');
        }
    });
}

// Function to update the header checkbox state based on individual checkbox states
function updateHeaderCheckbox() {
    const headerCheckbox = document.getElementById('select-checkbox');
    const checkboxes = document.querySelectorAll('#data-table tbody input[type="checkbox"]');
    headerCheckbox.checked = Array.from(checkboxes).every(checkbox => checkbox.checked);
}

// Add event listener to individual checkboxes to update header checkbox state
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('#data-table tbody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (!checkbox.checked) {
                document.getElementById('select-checkbox').checked = false;
            }
            updateHeaderCheckbox();
        });
    });
});

// Function to handle search
function handleSearch() {
    var searchTerm = $('#searchInput').val();
    updateTable(searchTerm);
}

// Call updateTable function every 5 seconds
$(document).ready(function() {
    // Initial call
    updateTable();

    // Set interval to update every 10 seconds
    // setInterval(updateTable, 10000); // 5000 milliseconds = 5 seconds

    // Bind search button click event
    $('#searchButton').click(handleSearch);
});

// Function to delete selected files
function deleteSelectedFiles() {
    const selectedFiles = [];
    const checkboxes = document.querySelectorAll('#data-table tbody input[type="checkbox"]:checked');
    const selectAllCheckbox = document.querySelector('#data-table thead input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        selectedFiles.push(checkbox.value);
    });

    // Uncheck the main header checkbox
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    if (selectedFiles.length > 0) {
        deleteFile(selectedFiles);
        updateTable(); // Refresh the table after deletion
    } else {
        alert('No files selected');
    }
}

socket.on('delete_selected_file_response', function(msg){
    console.log('Received delete_selected_file_response event:', msg);
    updateTable();
    // setTimeout(function() {
    //     console.log('5 seconds passed. Updating table now...');
    //     updateTable();
    //     console.log('Table updated.');
    //     console.log('Message:', msg);
    // }, 5000); // 5000 milliseconds = 5 seconds
});

socket.on('update_table_vault', function(msg){
    console.log('Received delete_selected_file_response event:', msg);
    updateTable();
});


// Delete files from Vault
function deleteFile(fileNames) {
    $("#waitImg_del").show(); // Show the loading image
    $.ajax({
        url: '/delete',
        method: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({ file_names: fileNames }),
        dataType: 'json',
        success: function(response) {
            console.log(response.message) // Log success message
            // Optionally, update UI or do something else after successful deletion
            updateTable(); // Refresh the table after deletion
            $("#waitImg_del").hide(); // Hide the loading image on success
        },
        error: function(xhr, status, error) {
            console.error('Error deleting files:', error);
            $("#waitImg_del").hide(); // Hide the loading image on success
        }
    });
}



// // Delete files from Vault
// function deleteFile(fileNames) {
//     // Send a DELETE request to the Flask route
//     $.ajax({
//         url: '/delete',
//         method: 'DELETE',
//         contentType: 'application/json',
//         data: JSON.stringify({ file_names: fileNames }),
//         dataType: 'json',
//         success: function(response) {
//             console.log(response.message) // Log success message
//             // Optionally, update UI or do something else after successful deletion
//             updateTable(); // Refresh the table after deletion
//         },
//         error: function(xhr, status, error) {
//             console.error('Error deleting files:', error);
//         }
//     });
// }

// Data Base Connection Form
document.getElementById('dbForm').onsubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Initialize Socket.IO client
    const socket = io();

    socket.emit('run_query', Object.fromEntries(formData));

    socket.on('query_success', (data) => {
        document.getElementById('message').innerText = data.message || 'Query executed successfully.';
        setTimeout(() => {
            document.getElementById('message').innerText = '';
        }, 8000); // Clear message after 8 seconds
        updateTable();
    });

    socket.on('query_error', (data) => {
        document.getElementById('message').innerText = JSON.stringify(data);
        setTimeout(() => {
            document.getElementById('message').innerText = '';
        }, 8000); // Clear message after 8 seconds
        updateTable();
    });
};

// // Delete file from Vault
// function deleteFile(fileName) {
//     // Send a DELETE request to the Flask route
//     $.ajax({
//         url: '/delete/' + fileName,
//         method: 'DELETE',
//         dataType: 'json',
//         success: function(response) {
//             console.log(response.message); // Log success message
//             // Optionally, update UI or do something else after successful deletion
//             updateTable(); // Refresh the table after deletion
//         },
//         error: function(xhr, status, error) {
//             console.error('Error deleting file:', error);
//         }
//     });
// }
