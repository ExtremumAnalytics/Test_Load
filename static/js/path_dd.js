// Function to update the table based on the search term
// Define functions to check file types outside of the updateTable function

// function openInNewTab(url) {
//     var win = window.open(url, '_blank');
//     win.focus();
// }

// function isPDF(filename) {
//     return filename.toLowerCase().endsWith('.pdf');
// }

// function isExcel(filename) {
//     return filename.toLowerCase().endsWith('.xls') || filename.toLowerCase().endsWith('.xlsx');
// }

// function isWord(filename) {
//     return (
//         filename.toLowerCase().endsWith('.doc') ||
//         filename.toLowerCase().endsWith('.docx') ||
//         filename.toLowerCase().endsWith('.rtf')
//     );
// }

// function isPowerPoint(filename) {
//     return (
//         filename.toLowerCase().endsWith('.ppt') ||
//         filename.toLowerCase().endsWith('.pptx')
//     );
// }

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
//                 var name = blob.name.split('/').pop();
                
//                 // If search term is provided and the filename doesn't match, skip
//                 if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
//                     return;
//                 }

//                 // Construct the row with customized column headers
//                 var row = '<tr>' +
//                           '<td>' + blob.name + '</td>' +
//                           '<td>';

//                 // Check the file type and provide appropriate action
//                 if (isPDF(name)) {
//                     // If it's a PDF, open it in a new tab
//                     row += '<a href="' + blob.url + '" target="_blank">View PDF</a>';
//                 } else if (isExcel(name)) {
//                     // If it's an Excel file, open it in a new tab
//                     row += '<a href="' + blob.url + '" target="_blank">View Excel</a>';
//                 } else if (isWord(name)) {
//                     // If it's a Word document, open it in a new tab
//                     row += '<a href="' + blob.url + '" target="_blank">View Word</a>';
//                 } else if (isPowerPoint(name)) {
//                     // If it's a PowerPoint presentation, open it in a new tab
//                     row += '<a href="' + blob.url + '" target="_blank">View PowerPoint</a>';
//                 } else {
//                     // If it's none of the above, open it directly in the browser
//                     row += '<a href="' + blob.url + '" target="_blank">View</a>';
//                 }

//                 row += '</td>' +
//                     '<td class="action-links">' +
//                     '<a href="' + blob.url + '">Download</a>' +
//                     '<a href="#" onclick="deleteFile(\'' + blob.name + '\')">Delete</a>' +
//                     '</td>' +
//                     '<td><input type="checkbox" name="selected_blob" value="' + blob.name + '"></td>' +
//                     '</tr>';
//                 $('#table-body').append(row);
//             });
//         },
//         error: function(xhr, status, error) {
//             console.error('Error updating table:', error);
//         }
//     });
// }

// // Function to handle search
// function handleSearch() {
//     var searchTerm = $('#searchInput').val();
//     updateTable(searchTerm);
// }

// // Call updateTable function every 5 seconds
// $(document).ready(function() {
//     // Initial call
//     updateTable();

//     // Set interval to update every 5 seconds
//     setInterval(updateTable, 10000); // 5000 milliseconds = 5 seconds

//     // Bind search button click event
//     $('#searchButton').click(handleSearch);
// });



// function openInNewTab(url) {
//     var win = window.open(url, '_blank');
//     win.focus();
// }

// function openFileInNewTab(url) {
//     var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
//     var win = window.open(googleDocsUrl, '_blank');
//     win.focus();
// }


// function isPDF(filename) {
//     return filename.toLowerCase().endsWith('.pdf');
// }

// function isExcel(filename) {
//     return filename.toLowerCase().endsWith('.xls') || filename.toLowerCase().endsWith('.xlsx');
// }

// function isWord(filename) {
//     return (
//         filename.toLowerCase().endsWith('.doc') ||
//         filename.toLowerCase().endsWith('.docx') ||
//         filename.toLowerCase().endsWith('.rtf')
//     );
// }

// function isPowerPoint(filename) {
//     return (
//         filename.toLowerCase().endsWith('.ppt') ||
//         filename.toLowerCase().endsWith('.pptx')
//     );
// }

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
//                 var name = blob.name.split('/').pop();
                
//                 // If search term is provided and the filename doesn't match, skip
//                 if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
//                     return;
//                 }

//                 // Construct the row with customized column headers
//                 var row = '<tr>' +
//                           '<td>' + blob.name + '</td>' +
//                           '<td>';

//                 // Check the file type and provide appropriate action
//                 if (isPDF(name)) {
//                     // If it's a PDF, open it in a new tab
//                     row += '<a href="#" onclick="openInNewTab(\'' + blob.url + '\')">View PDF</a>';
//                 } else if (isExcel(name)) {
//                     // If it's an Excel file, open it in a new tab
//                     row += '<a href="#" onclick="openFileInNewTab(\'' + blob.url + '\')">View Excel</a>';
//                 } else if (isWord(name)) {
//                     // If it's a Word document, open it in a new tab
//                     row += '<a href="#" onclick="openFileInNewTab(\'' + blob.url + '\')">View Word</a>';
                // } else if (isPowerPoint(name)) {
                //     // If it's a PowerPoint presentation, open it in a new tab
                //     row += '<a href="#" onclick="openFileInNewTab(\'' + blob.url + '\')">View PowerPoint</a>';
                // } else {
//                     // If it's none of the above, open it directly in the browser
//                     row += '<a href="' + blob.url + '" target="_blank">View</a>';
//                 }

//                 row += '</td>' +
//                     '<td class="action-links">' +
//                     '<a href="' + blob.url + '">Download</a>' +
//                     '<a href="#" onclick="deleteFile(\'' + blob.name + '\')">Delete</a>' +
//                     '</td>' +
//                     '<td><input type="checkbox" name="selected_blob" value="' + blob.name + '"></td>' +
//                     '</tr>';
//                 $('#table-body').append(row);
//             });
//         },
//         error: function(xhr, status, error) {
//             console.error('Error updating table:', error);
//         }
//     });
// }

// // Function to handle search
// function handleSearch() {
//     var searchTerm = $('#searchInput').val();
//     updateTable(searchTerm);
// }

// // Function to open file in new tab
// function openFileInNewTab(url) {
//     var a = document.createElement('a');
//     a.href = url;
//     a.target = '_blank';
//     document.body.appendChild(a);
//     a.click();
// }

// // Call updateTable function every 5 seconds
// $(document).ready(function() {
//     // Initial call
//     updateTable();

//     // Set interval to update every 5 seconds
//     setInterval(updateTable, 5000); // 5000 milliseconds = 5 seconds

//     // Bind search button click event
//     $('#searchButton').click(handleSearch);
// });

// // new code /////////////////////////////////////////////////////////////

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

function openFileInNewTab(url) {
    var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
    var win = window.open(googleDocsUrl, '_blank');
    win.focus();
}

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
                var name = blob.name.split('/').pop();
                
                // If search term is provided and the filename doesn't match, skip
                if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
                    return;
                }

                // Construct the row with customized column headers
                var row = '<tr>' +
                          '<td>' + blob.name + '</td>' +
                          '<td>';

                // Check the file type and provide appropriate action
                if (isExcel(name)) {
                    // If it's an Excel file, open it in a new tab
                    row += '<a href="#" onclick="openFileInNewTab(\'' + blob.url + '\')">View Excel</a>';
                }else if (isPDF(name)) {
                    // If it's a PDF, open it in a new tab
                    row += '<a href="#" onclick="openInNewTab(\'' + blob.url + '\')">View PDF</a>';
                } else if (isWord(name)) {
                    // If it's a Word document, open it in a new tab
                    row += '<a href="#" onclick="openFileInNewTab(\'' + blob.url + '\')">View Word</a>';
                } else if (isPowerPoint(name)) {
                    // If it's a PowerPoint presentation, open it in a new tab
                    row += '<a href="#" onclick="openFileInNewTab(\'' + blob.url + '\')">View PowerPoint</a>';
                } else {
                    // If it's none of the above, open it directly in the browser
                    row += '<a href="' + blob.url + '" target="_blank">View</a>';
                }

                row += '</td>' +
                    '<td class="action-links">' +
                    '<a href="' + blob.url + '">Download</a> </td>' +
                    '<td><a href="javascript:void(0);" onclick="deleteFile(\'' + blob.name + '\')" style="color: var(--primary);">Delete</a>' +
                    '</td>' +
                    // '<td><input type="checkbox" name="selected_blob" value="' + blob.name + '"></td>' +
                    '</tr>';
                $('#table-body').append(row);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error updating table:', error);
        }
    });
}

// Function to handle search
function handleSearch() {
    var searchTerm = $('#searchInput').val();
    updateTable(searchTerm);
}

// Call updateTable function every 5 seconds
$(document).ready(function() {
    // Initial call
    updateTable();

    // Set interval to update every 5 seconds
    setInterval(updateTable, 5000); // 5000 milliseconds = 5 seconds

    // Bind search button click event
    $('#searchButton').click(handleSearch);
});


function deleteFile(fileName) {
    // Send a DELETE request to the Flask route
    $.ajax({
        url: '/delete/' + fileName,
        method: 'DELETE',
        dataType: 'json',
        success: function(response) {
            console.log(response.message); // Log success message
            // Optionally, update UI or do something else after successful deletion
            updateTable(); // Refresh the table after deletion
        },
        error: function(xhr, status, error) {
            console.error('Error deleting file:', error);
        }
    });
}

