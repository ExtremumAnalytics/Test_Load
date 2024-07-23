// JavaScript to handle Popup Modal and AJAX request
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
var socket = io();

// Select Files to load
socket.on('updateAnalystTable', function(data) {
    var fileList = document.getElementById("fileList");

    // Clear the fileList dropdown before adding new options
    fileList.innerHTML = '';

    // Creating a default db option
    var option1 = document.createElement("option");
    option1.text = 'Select Data';
    option1.value = 'select';
    fileList.appendChild(option1);

    const option2 = document.createElement("option");
    option2.text = 'Use Database';
    option2.value = 'database';
    fileList.appendChild(option2);


    var filteredData = data.filter(function(file) {
        var fileExtension = file.name.split('.').pop().toLowerCase();
        return fileExtension === 'xlsx' || fileExtension === 'csv';
    });

    filteredData.forEach(function(file) {
        var option = document.createElement("option");
        option.text = file.name;
        option.value = file.url;
        fileList.appendChild(option);
    });
});

function table_data_retrieve() {
    modal.style.display = "block";
    // Listen for the 'table_update' event from the server
    socket.on('table_update', function(data) {
        // Handle the data received from the server
        console.log(data); 
    });
}

// Close the modal if close button is clicked
span.onclick = function() {
  modal.style.display = "none";
}

// Close the modal if user clicks outside the modal
window.onclick = function(event) {
  var modal = document.getElementById('myModal');
  if (event.target == modal) {
    closeModal();
  }
}

// Close the select menu
function closeModal() {
  document.getElementById('myModal').style.display = 'none';
}


// Function to load data from the selected file
function loadData() {
    var selectedFileUrl = document.getElementById("fileList").value;

    // Clear the message after 8 seconds
    setTimeout(function() {
        document.getElementById('message').textContent = '';
    }, 8000);

    if(selectedFileUrl == 'select'){
        alert('Please select the data!')
    }

    else if(selectedFileUrl!='database'){
        // Emit the eda_process event with the selected file URL
        socket.emit('eda_process', { fileUrl: selectedFileUrl });

        // Handle the response from the server
        socket.on('eda_response', function(response) {
            if (response.success) {
                // Handle success response
                closeModal();
            }
            document.getElementById('message').textContent = response.message;
        });
    }
    else if(selectedFileUrl == 'database'){
        closeModal();
        document.getElementById('message').textContent = 'Database Selected';
    }
}

// Function to clear the chat content
function clearChat() {
  document.getElementById('eda_questionAnswer').innerHTML = '';
  document.getElementById('question_eda').value = '';
  $('#message').text('Chat cleared successful.');
  setTimeout(function() {
    $('#message').text('');
  }, 8000); // Delete after 8 seconds
}

// Send User Question to backend
function sendQuestion() {
    const question = document.getElementById('question_eda').value;
    var selectedFileUrl = document.getElementById("fileList").value;

    if(selectedFileUrl=='database'){
        $("#waitImg").show(); // Show the loading image

        // Emit the 'eda_db_process' event with the question data
        socket.emit('eda_db_process', {'query_input': question });

        socket.on('eda_query_success', (data) =>{
            $("#waitImg").hide(); // Hide the loading image on success
            $('#message').text(data.message);
            setTimeout(function() {
                $('#message').text('');
            }, 8000); //delete after 8 seconds
        })
        socket.on('eda_db_response', (data) =>{
            $("#waitImg").hide(); // Hide the loading image on success
            $('#message').text(data.message);
            setTimeout(function() {
                $('#message').text('');
            }, 8000); //delete after 8 seconds
            document.getElementById('eda_questionAnswer').innerHTML = `<p></p><b>Output:</b> ${data.output} <br><p></p> <b>Query:</b> ${data.query}<p></p> ${data.df_table} <p></p> <b>Results:</b> <a href="${data.url}">Download Query Results</a>`;
            updateQueryTable();
        })
        updateQueryTable();

    }

    else{
        $("#waitImg").show(); // Show the loading image

        // Emit the 'eda_process' event with the question data
        socket.emit('eda_process', { question });

        // Listen for the 'eda_response' event to handle the server response
        socket.on('eda_response', (data) => {
            $("#waitImg").hide(); // Hide the loading image on success
            $('#message').text(data.message);
            setTimeout(function() {
                $('#message').text('');
            }, 8000); //delete after 8 seconds

            // Parse JSON string to array if it's a string
            if (typeof data.output_any === 'string') {
                data.output_any = JSON.parse(data.output_any);
            }

            // Initialize the content to be displayed
            let displayContent = '';

            // Check the type of output and create appropriate content
            switch(data.output_type) {
                case 'table':
                    // Assuming data is an array of objects
                    if (Array.isArray(data.output_any)) {
                        let tableHTML = '<table style="border-collapse: collapse;"><thead><tr>';
                        Object.keys(data.output_any[0]).forEach(key => {
                            tableHTML += `<th style="border: 1px solid black; padding: 8px;">${key}</th>`;
                        });
                        tableHTML += '</tr></thead><tbody>';
                        data.output_any.forEach(row => {
                            tableHTML += '<tr>';
                            Object.values(row).forEach(value => {
                                tableHTML += `<td style="border: 1px solid black; padding: 8px;">${value}</td>`;
                            });
                            tableHTML += '</tr>';
                        });
                        tableHTML += '</tbody></table>';
                        displayContent = tableHTML;
                    } else {
                        // Handle invalid table data
                        displayContent = 'Invalid table data';
                    }
                    break;
                case 'numeric':
                case 'text':
                    // Directly display numeric and text data
                    displayContent = data.output_any;
                    break;
                default:
                    // Handle unknown type
                    displayContent = 'Unknown response type';
            }

            // Check if there's an image and add it to the content
            if (data.image) {
                const imageUrl = `data:image/png;base64,${data.image}`;
                displayContent += `<div><img src="${imageUrl}" alt="Processed Image" style="max-width: 100%; height: auto;" /></div>`;
            }

            // Display the final content
            document.getElementById('eda_questionAnswer').innerHTML = displayContent;
        });

        // Handle errors
        socket.on('connect_error', (error) => {
            // console.error('Connection Error:', error);
            $("#waitImg").hide();
            document.getElementById('eda_questionAnswer').textContent = 'Failed to send question';
        });
    }
}

function updateQueryTable(searchTerm) {
    $.ajax({
        url: '/query_table_update',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            // Clear existing table rows
            $('#table-body').empty();

            // Populate the table with new data
            response.forEach(function(blob) {
                // Extract the name from the URL
                var name = blob.name;

                // If search term is provided and the filename doesn't match, skip
                if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
                    return;
                }

                // Construct the row with customized column headers
                var row = '<tr>' +
                          '<td><input type="checkbox" id="select-checkbox" name="selected_blob" onclick="updateHeaderCheckbox()" value="' + blob.name + '"></td>' +
                           '<td>' + blob.name + '</td>';

                row +=
                    '<td class="action-links">' +
                    '<a href="' + blob.url + '" download="' + name + '">Download</a> </td>' +
                    '<td>' + blob.status + '</td>' +
                    '</tr>';
                $('#table-body').append(row);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error updating table:', error);
        }
    });
}

// Helper functions to check file types
function isCSV(filename) {
    return filename.endsWith('.csv') || filename.endsWith('.CSV');;
}

function isExcel(filename) {
    return filename.endsWith('.xlsx');
}

// Function to set all checkboxes to the same state as the "Select All" checkbox
function toggleSelectAll(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('#query-table tbody input[type="checkbox"]');
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
    const checkboxes = document.querySelectorAll('#query-table tbody input[type="checkbox"]');
    headerCheckbox.checked = Array.from(checkboxes).every(checkbox => checkbox.checked);
}

// Add event listener to individual checkboxes to update header checkbox state
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('#query-table tbody input[type="checkbox"]');
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
    updateQueryTable(searchTerm);
}

// Call updateQueryTable function
$(document).ready(function() {
    // Initial call
    updateQueryTable();
    // Bind search button click event
    $('#searchButton').click(handleSearch);
});

// Function to delete selected files
function deleteVaultFiles() {
    const selectedFiles = [];
    const checkboxes = document.querySelectorAll('#query-table tbody input[type="checkbox"]:checked');
    const selectAllCheckbox = document.querySelector('#query-table thead input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        selectedFiles.push(checkbox.value);
    });

    // Uncheck the main header checkbox
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    if (selectedFiles.length > 0) {
        deleteFile(selectedFiles);
        updateQueryTable(); // Refresh the table after deletion
    } else {
        alert('No files selected');
    }
}

socket.on('delete_selected_file_response', function(msg){
    updateQueryTable();
    // console.log(msg);
});

// Delete files from Vault
function deleteFile(fileNames) {
    $("#waitImg_del").show(); // Show the loading image
    // Send a DELETE request to the Flask route
    $.ajax({
        url: '/delete',
        method: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({ file_names: fileNames }),
        dataType: 'json',
        success: function(response) {
            // console.log(response.message) // Log success message
            // Optionally, update UI or do something else after successful deletion
            updateQueryTable(); // Refresh the table after deletion
            $("#waitImg_del").hide(); // Show the loading image
        },
        error: function(xhr, status, error) {
            // console.error('Error deleting files:', error);
        }
    });
}

// Virtual Analyst Voice Record Button
document.addEventListener('DOMContentLoaded', function() {
    let recognition;
    const outputDiv = document.getElementById('message');
    const recordButton = document.getElementById('recordButton');

    let timeoutId;

    recordButton.addEventListener('click', () => {
        if (!recognition || !recognition.running) {
            // Start recording
            startRecording();
            recordButton.textContent = '';
            recordButton.classList.remove('off'); // Remove the "off" class
        } else {
            // Stop recording
            recognition.stop();
            recordButton.textContent = '';
            recordButton.classList.add('off'); // Add the "off" class
        }
    });

    function startRecording() {
        let SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        if (!SpeechRecognition) {
            // console.error('Speech recognition not supported in this browser');
            outputDiv.textContent = 'Speech recognition not supported in this browser';
            clearTimeout(timeoutId); // Clear any existing timeout
            timeoutId = setTimeout(() => {
                outputDiv.textContent = ""; // Clear output after 5 seconds
            }, 6000);
            toggleRecordButtonVisibility(false); // Hide the record button
            return;
        }

        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
            const transcript = event.results[event.results.length - 1][0].transcript;
            const inputField = document.getElementById('question_eda');
            inputField.value = transcript;

        };

        recognition.onerror = function(event) {
            // console.error('Speech recognition error:', event.error);
        };

        recognition.onend = function() {
            recognition.stop();
            recordButton.textContent = '';
            recordButton.classList.add('off'); // Add the "off" class
            if (outputDiv.textContent.trim() !== '') {
                sendTextToServer(outputDiv.textContent); // Send text to server only if not empty
            }
        };

        toggleRecordButtonVisibility(true); // Show the record button
        recognition.start();
    }

    function toggleRecordButtonVisibility(show) {
        recordButton.style.display = show ? 'block' : 'none';
    }
});