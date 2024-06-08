// function uploadDraft() {
//     var fileInput = document.getElementById('fileInput');
//     var files;
//     const draftType = document.querySelector('select[name="source"]').value;

//     if (fileInput && fileInput.files.length > 0) {
//         files = fileInput.files;
//     } else {
//         files = []; // Placeholder action
//     }

//     var formData = new FormData();

//     for (var i = 0; i < files.length; i++) {
//         formData.append('myFile', files[i]);
//     }
        
//     $("#waitImg").show(); // Show the loading image

//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', '/upload_draft');
//     xhr.onload = function () {
//         if (xhr.status === 200) {
//             var response = JSON.parse(xhr.responseText);
//             document.getElementById('message').innerHTML = '<p>' + response.message + '</p>';
//             setTimeout(function () {
//                 document.getElementById('message').innerHTML = '';
//             }, 8000);
//             $("#waitImg").hide(); // Hide the loading image on success
//             // updateTable();
//             // document.getElementById('popupForm').reset();
//         } else {
//             document.getElementById('message').innerHTML = '<p>Failed to upload files. Please try again later.</p>';
//             setTimeout(function () {
//                 document.getElementById('message').innerHTML = '';
//             }, 8000);
//             updateTable();
//             $("#waitImg").hide(); // Hide the loading image on success
//         }
//     };
//     xhr.send(formData);
// }

// // Updating Digital Vault
// function updateTable(searchTerm) {
//     $.ajax({
//         url: '/draft_table_update',
//         method: 'GET',
//         dataType: 'json',
//         success: function(response) {
//             // Clear existing table rows
//             $('#table-body').empty();
            
//             // Populate the table with new data
//             response.forEach(function(blob) {
//                 // Extract the name from the URL
//                 var name = blob.name.split('/').pop();
                
//                 // If search term is provided and the filename doesn't match, skip
//                 if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
//                     return;
//                 }

//                 // Construct the row with customized column headers
//                 var row = '<tr>' +                    
//                           '<td><input type="checkbox" id="select-checkbox" name="selected_blob" onclick="updateHeaderCheckbox()" value="' + blob.name + '"></td>' +
//                           '<td>' + blob.name + '</td>' +
//                           '<td>';

//                 // Check the file type and provide appropriate action
//                 if (isExcel(name)) {
//                     // If it's an Excel file, open it in a new tab
//                     row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Excel</a>';
//                 }else if (isPDF(name)) {
//                     // If it's a PDF, open it in a new tab
//                     row += '<a href="javascript:void(0);" onclick="openInNewTab(\'' + blob.url + '\')">View PDF</a>';
//                 } else if (isWord(name)) {
//                     // If it's a Word document, open it in a new tab
//                     row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Word</a>';
//                 } else if (isPowerPoint(name)) {
//                     // If it's a PowerPoint presentation, open it in a new tab
//                     row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View PowerPoint</a>';
//                 } else {
//                     // If it's none of the above, open it directly in the browser
//                     row += '<a href="' + blob.url + '" target="_blank">View</a>';
//                 }

//                 row += '</td>' +
//                     '<td class="action-links">' +
//                     //'<a href="' + blob.url + '" target="_blank" download>Download</a> </td>' +
//                     '<a href="' + blob.url + '" download="' + name + '">Download</a> </td>' +
//                     '<td>'+blob.status +'</td>' +
//                     '</tr>';
//                 $('#table-body').append(row);
//             });
//         },
//         error: function(xhr, status, error) {
//             console.error('Error updating table:', error);
//         }
//     });
// }

// document.getElementById('uploadDraft').addEventListener('click', uploadDraft);

function uploadDraft() {
    const fileInput = document.getElementById('fileInput');
    const draftType = document.querySelector('select[name="source"]').value;

    if (fileInput.files.length === 0) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('draftType', draftType);
    
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('files', fileInput.files[i]);
    }
    
    $("#waitImg").show(); // Show the loading image
    
    fetch('/upload_draft', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            $("#waitImg").hide(); // Hide the loading image on success
            alert('Files uploaded successfully.');
            updateDraftTable();
            // console.log();
        } 
        else {
            $("#waitImg").hide(); // Hide the loading image on success
            alert('Failed to upload files: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error uploading files:', error);
    });
}

function updateDraftTable(searchTerm) {
    $.ajax({
        url: '/draft_table_update',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            // Clear existing table rows
            $('#table-body').empty();
            
            // Populate the table with new data
            response.forEach(function(blob) {
                // Extract the name from the URL
                var name = blob.name;
                var draftType = blob.draftType;
                
                // If search term is provided and the filename doesn't match, skip
                if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
                    return;
                }

                // Construct the row with customized column headers
                var row = '<tr>' +                    
                          '<td><input type="checkbox" id="select-checkbox" name="selected_blob" onclick="updateHeaderCheckbox()" value="' + blob.name + '"></td>' +
                           '<td>' + blob.name + '</td>' +
                          '<td>' + draftType + '</td>' +
                          '<td>';

                // Check the file type and provide appropriate action
                if (isPDF(name)) {
                    // If it's a PDF, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openInNewTab(\'' + blob.url + '\')">View PDF</a>';
                } else if (isWord(name)) {
                    // If it's a Word document, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Word</a>';
                } else {
                    // If it's none of the above, open it directly in the browser
                    row += '<a href="' + blob.url + '" target="_blank">View</a>';
                }

                row += '</td>' +
                    '<td class="action-links">' +
                    //'<a href="' + blob.url + '" target="_blank" download>Download</a> </td>' +
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
function isPDF(filename) {
    return filename.endsWith('.pdf');
}

function isWord(filename) {
    return filename.endsWith('.doc') || filename.endsWith('.docx');
}



// Function to set all checkboxes to the same state as the "Select All" checkbox
function toggleSelectAll(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('#draft-table tbody input[type="checkbox"]');
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
    const checkboxes = document.querySelectorAll('#draft-table tbody input[type="checkbox"]');
    headerCheckbox.checked = Array.from(checkboxes).every(checkbox => checkbox.checked);
}

// Add event listener to individual checkboxes to update header checkbox state
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('#draft-table tbody input[type="checkbox"]');
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
    updateDraftTable(searchTerm);
}

// Call updateDraftTable function 
$(document).ready(function() {
    // Initial call
    updateDraftTable();
    // Bind search button click event
    $('#searchButton').click(handleSearch);
});

// Function to delete selected files
function deleteDraftFiles() {
    const selectedFiles = [];
    const checkboxes = document.querySelectorAll('#draft-table tbody input[type="checkbox"]:checked');
    const selectAllCheckbox = document.querySelector('#draft-table thead input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        selectedFiles.push(checkbox.value);
    });

    // Uncheck the main header checkbox
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    if (selectedFiles.length > 0) {
        deleteFile(selectedFiles);
        updateDraftTable(); // Refresh the table after deletion
    } else {
        alert('No files selected');
    }
}

socket.on('delete_selected_file_response', function(msg){
    updateDraftTable();
    console.log(msg)
});

// Delete files from Vault
function deleteFile(fileNames) {
    // Send a DELETE request to the Flask route
    $.ajax({
        url: '/delete',
        method: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({ file_names: fileNames }),
        dataType: 'json',
        success: function(response) {
            console.log(response.message) // Log success message
            // Optionally, update UI or do something else after successful deletion
            updateDraftTable(); // Refresh the table after deletion
        },
        error: function(xhr, status, error) {
            console.error('Error deleting files:', error);
        }
    });
}