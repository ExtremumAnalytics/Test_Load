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

// function openPopup(option) {
//     var popup = document.getElementById('popup');
//     popup.style.display = 'block';

//     var databaseForm = document.getElementById('databaseForm');
//     var fileForm = document.getElementById('fileForm');
//     var sourceForm = document.getElementById('SourceURL');
//     var audioForm = document.getElementById('audio_file');
//     var Web_Crawling = document.getElementById('Web_Crawling');

//     if (option === 'database') {
//         databaseForm.style.display = 'block';
//         fileForm.style.display = 'none';
//         sourceForm.style.display = 'none';
//         audioForm.style.display = 'none';
//         Web_Crawling.style.display = 'none';
//     } else if (option === 'file') {
//         fileForm.style.display = 'block';
//         databaseForm.style.display = 'none';
//         sourceForm.style.display = 'none';
//         audioForm.style.display = 'none';
//         Web_Crawling.style.display = 'none';
//     }else if (option === 'Source_URL') {
//         sourceForm.style.display = 'block';
//         databaseForm.style.display = 'none';
//         fileForm.style.display = 'none';
//         audioForm.style.display = 'none';
//         Web_Crawling.style.display = 'none';
//     }else if (option === 'audio_file') {
//         audioForm.style.display = 'block';
//         databaseForm.style.display = 'none';
//         fileForm.style.display = 'none';
//         sourceForm.style.display = 'none';
//         Web_Crawling.style.display = 'none';
//     }else if (option === 'Web_Crawling') {
//         Web_Crawling.style.display = 'block';
//         databaseForm.style.display = 'none';
//         fileForm.style.display = 'none';
//         sourceForm.style.display = 'none';
//         audioForm.style.display = 'none';
//     }
// }

// function closePopup() {
//     console.log('Popup Close');
//     var popup = document.getElementById('popup');
//     popup.style.display = 'none';

//     // Clear form fields
//     var form = document.getElementById('popupForm');
//     form.reset();
// }


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


function executeNewProgram() {
    var url = document.getElementById('webCrawlingInput').value;
    console.log("URL to crawl:", url);

    // Sending the URL to the server using Fetch API
    fetch('/webcrawler', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Assuming response is JSON
        }
        if (response.status === 404) {
            throw new Error('URL Not Found');
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log(data); // Response from the server
        // Display data or update UI based on the response
        $('#messageweb').text(data.message);
        setTimeout(function() {
            $('#messageweb').text('');
        }, 8000); // 8 seconds later, clear the message
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        // Update UI to display error message
        $('#messageweb').text(error.message);
        setTimeout(function() {
            $('#messageweb').text('');
        }, 8000); // 8 seconds later, clear the message
    });
}




function pdfPopupopen() {
    // Show the popup
    // document.getElementById('popupweb').style.display = 'block';

    // Fetch PDF files from folder
    fetchPDFFiles();
}








// Fetch PDF files from the server
function fetchPDFFiles() {
    fetch("/fetch_pdf_files")
    .then(response => response.json()) // Parse response as JSON
    .then(data => {
        console.log(data); // Check the data received

        // Pass the received data directly to displayPDFFiles
        displayPDFFiles(data.pdf_files);
    })
    .catch(error => console.error('Error fetching PDF files:', error));
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


// //table fetch data for web crawling.

var socket = io();

socket.on('progress', function(data) {
    console.log(data);
    document.getElementById('status').innerText = `Current Status: ${data.current_status}`;
    document.getElementById('totalFiles').innerText = `Total Files: ${data.total_files}`;
    document.getElementById('filesDownloaded').innerText = `Files Downloaded: ${data.files_downloaded}`;
    document.getElementById('progressPercentage').innerText = `Progress Percentage: ${data.progress_percentage}%`;
    document.getElementById('currentFileName').innerText = `Current File Name: ${data.current_file}`;
});



// var socket = io();

// socket.on('progress', function(data) {
//     console.log(data);
//     // Update progress display
//     document.getElementById("progress").innerHTML = `
//         <label style="font-size: 14px;">Current Status: ${data.current_status}</label>
//         <label style="font-size: 14px;">Total Files: ${data.total_files}</label>
//         <label style="font-size: 14px;">Files Downloaded: ${data.files_downloaded}</label>
//         <label style="font-size: 14px;">Progress Percentage: ${data.progress_percentage}%</label>
//         <label style="font-size: 14px;">Current File Name: ${data.current_file}</label>
//     `;
// });


// function fetchProgress() {
//     fetch("/download_progress")
//       .then(response => response.json())
//       .then(data => {
//         console.log("Total Files:", data.total_files);
//         console.log("Files Downloaded:", data.files_downloaded);
//         console.log("Progress Percentage:", data.progress_percentage + "%");
//         console.log("Current File:", data.current_file);
        
    //     // Update progress display
    //     document.getElementById("progress").innerHTML = `
    //       <label>Current Status: ${data.current_status}</label>
    //       <label>Total Files:  ${data.total_files}</label>
    //       <label>Files Downloaded:  ${data.files_downloaded}</label>
    //       <label>Progress Percentage:  ${data.progress_percentage}%</label>
    //       <label>Current File Name:  ${data.current_file}</label>
    //     `;
    //   })
//       .catch(error => console.error("Error fetching progress:", error));
//     }

//   // Fetch progress every second
// setInterval(fetchProgress, 1000);


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
    

    // var dbURL = document.getElementsByName('dbURL')[0].value;
    // var username = document.getElementsByName('username')[0].value;
    // var password = document.getElementsByName('password')[0].value;
    // var Source_URL = document.getElementsByName('Source_URL')[0].value;

    var dbType = document.getElementsByName('dbType')[0].value;
    var hostname = document.getElementsByName('hostname')[0].value;
    var port = document.getElementsByName('port')[0].value;
    var username = document.getElementsByName('username')[0].value;
    var password = document.getElementsByName('password')[0].value;
    var query = document.getElementsByName('query')[0].value;
    var Source_URL = document.getElementsByName('Source_URL')[0].value;
    
    //$("#myDiv").html('<img src="/static/images/wait.gif" alt="Wait" />');
    $("#waitImg").show(); // Show the loading image
    // // Append additional fields
    // formData.append('dbURL', dbURL);
    // formData.append('username', username);
    // formData.append('password', password);
    // formData.append('Source_URL', Source_URL);
      // Append additional fields
    formData.append('dbType', dbType);
    formData.append('hostname', hostname);
    formData.append('port', port);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('query', query);
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





// // load cognilink button


// $(document).ready(function () {
//     $("#loadCogniLink").click(function () {
//         //$("#myDiv").html('');
//         $("#waitImg").show(); // Show the loading image
//         $.ajax({
//             url: '/Cogni_button',
//             type: 'GET',
//             success: function (data) {
//                 $("#waitImg").hide(); // Hide the loading image on success
//                 $('#message').text(data.message);
//                 setTimeout(function() {
//                     $('#message').text('');
//                 }, 8000);
//                 console.log('Data is Loaded:', data);
//                 dataLoadUpdate();
//             },
//             error: function (error) {
//                 console.error('Error in Loading CogniLink data:', error);
//                 $("#waitImg").hide(); // Hide the loading image on error
//             }
//         });
//     });
// });


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
        $('#message').text(msg.message);
        setTimeout(function() {
            $('#message').text('');
        }, 8000);
    });
});

function dataLoadUpdate() {
    // Add your logic here to handle data load update
    console.log('Data load update function called');
}