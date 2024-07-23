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
    // console.log(' stop button is  pressed')

    socket.on('stop_process_flag', function(data){
        if(data.pin==pin){
            // console.log('Flag value received:',data.flag)
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
    // console.log("URL to crawl:", url);

    // Sending the URL to the server using Socket.IO
    socket.emit('webcrawler_start', { url: url, login_pin:pin });

    // Update status event
    socket.on('update_status', function(data) {
        if(data.pin==pin){
            // console.log("Status Update:", data.status);
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
            // console.log("Progress Update:", data);
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


// this is default program
function runDefaultProgram(called_from) {
    var fileInput = document.getElementById('fileInput');
    var mp3Input = document.getElementById('mp3Input');
    var Image_input = document.getElementById('input_image');
    var lang = document.getElementById('lang').value;
    const slider = document.getElementById("mySlider");
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
    formData.append('sizeValue',slider.value);
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
            document.getElementsByName('Source_URL')[0].value = '';
        } else {
            var response = JSON.parse(xhr.responseText);
            document.getElementById('message').innerHTML = '<p>' + response.message + '</p>';
            setTimeout(function () {
                document.getElementById('message').innerHTML = '';
            }, 8000);
            updateTable();
            $("#waitImg").hide(); // Hide the loading image on failure
            document.getElementsByName('Source_URL')[0].value = '';
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
    // console.log('Pending',data);
});

socket.on('failed', function(data){
    // console.log('Failed',data);
});

socket.on('success', function(data){
    // console.log('Success',data);
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
                // console.log('Percentage:',data.percentage);
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
                // console.log('Data is Loaded:', data);
                dataLoadUpdate();
                socket.emit('table_update');

                updateTable();
            },
            error: function (error) {
                console.error('Error in loading CogniLink data:', error);
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
    // console.log('Data load update function called');
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


async function downloadImage(blobUrl, filename) {
    try {
        // Fetch the blob from the URL with no-cors mode
        const response = await fetch(blobUrl, { mode: 'no-cors' });

        // Create a temporary URL for the blob
        const url = URL.createObjectURL(new Blob([response.body], { type: 'image/jpeg' }));

        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;

        // Append the anchor to the document
        document.body.appendChild(a);

        // Simulate a click on the anchor
        a.click();

        // Clean up by revoking the object URL and removing the anchor
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading the image:', error);
    }
}

// Function to download PDF from a blob URL
async function downloadPDF(blobUrl, filename) {
    try {
        // Fetch the blob from the URL with no-cors mode
        const response = await fetch(blobUrl, { mode: 'no-cors' });

        // Create a temporary URL for the blob
        const url = URL.createObjectURL(new Blob([response.body], { type: 'application/pdf' }));

        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;

        // Append the anchor to the document
        document.body.appendChild(a);

        // Simulate a click on the anchor
        a.click();

        // Clean up by revoking the object URL and removing the anchor
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading the PDF:', error);
    }
}


socket.emit('table_update');
function updateTable(searchTerm) {
    socket.emit('table_update', searchTerm);
    socket.on('update_vault_table', function(response) {
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

            // Extract the last modified date and format it as needed
            // var lastModifiedDate = new Date(blob.last_modified).toLocaleDateString();
            // Replace 'T' with a space and remove the timezone part
            var Date = blob.date.replace("T", " ").split("+")[0];

            // Construct the row with customized column headers
            var checkboxValue, nameDisplay;

            if (blob.name === "https:") {
                // Split the URL by slashes
                const parts = url_blob.split('/');

                // Extract the specific parts
                const domain = parts[2]; // "flask-socketio.readthedocs.io"
                lastPart = parts[parts.length - 1]; // "flask_socketio.SocketIOTestClient.get_received"

                checkboxValue = url_blob;
                nameDisplay = domain + '/' + lastPart; // Extracted domain
            } else {
                checkboxValue = blob.name;
                nameDisplay = blob.name;
                lastPart = ""; // No last part to display when blob.name is not "https:"
            }

            var row = '<tr>' +
                        '<td style="text-align: center;"><input type="checkbox" id="select-checkbox" name="selected_blob" onclick="updateHeaderCheckbox()" value="' + checkboxValue + '"></td>' +
                        '<td style="text-align: center;">' + nameDisplay + '</td>' +
                        '<td style="text-align: center;">';

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

            row += '</td><td style="text-align: center;" class="action-links">';

            if (isPDF(name)) {
                // Provide download link specifically for PDFs
                row += '<a href="javascript:void(0);" onclick="downloadPDF(\'' + blob.url + '\', \'' + name + '\')">Download</a>';
            } else if (isImage(name)) {
                // Provide download link specifically for Images
                row += '<a href="javascript:void(0);" onclick="downloadImage(\'' + blob.url + '\', \'' + name + '\')">Download</a>';
            } else if (blob.name === "https:") {
                row += 'N/A';  // Display 'N/A' if url_blob exists
            } else {
                row += '<a href="' + blob.url + '" download="' + name + '">Download</a>';  // Provide download link for other types
            }

            row += '</td><td style="text-align: center;">' + blob.status + '</td>' +
                    '<td style="text-align: center;">' + Date + '</td>' + // Add the date column
                    '</tr>';
            $('#table-body').append(row);
        });
    });
}



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
    // console.log('Received delete_selected_file_response event:', msg);
    updateTable();
});

socket.on('update_table_vault', function(msg){
    // console.log('Received delete_selected_file_response event:', msg);
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
            // console.log(response.message) // Log success message
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