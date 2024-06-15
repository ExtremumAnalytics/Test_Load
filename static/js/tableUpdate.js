// Updating Digital Vault
export function updateTable() {
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
                
                // // If search term is provided and the filename doesn't match, skip
                // if (searchTerm && name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
                //     return;
                // }

                // Construct the row with customized column headers
                var row = '<tr>' +                    
                          '<td><input type="checkbox" id="select-checkbox" name="selected_blob" onclick="updateHeaderCheckbox()" value="' + blob.name + '"></td>' +
                          '<td>' + blob.name + '</td>' +
                          '<td>';

                // Check the file type and provide appropriate action
                if (isExcel(name)) {
                    // If it's an Excel file, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Excel</a>';
                }else if (isPDF(name)) {
                    // If it's a PDF, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openInNewTab(\'' + blob.url + '\')">View PDF</a>';
                } else if (isWord(name)) {
                    // If it's a Word document, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View Word</a>';
                } else if (isPowerPoint(name)) {
                    // If it's a PowerPoint presentation, open it in a new tab
                    row += '<a href="javascript:void(0);" onclick="openFileInNewTab(\'' + blob.url + '\')">View PowerPoint</a>';
                } else {
                    // If it's none of the above, open it directly in the browser
                    row += '<a href="' + blob.url + '" target="_blank">View</a>';
                }

                row += '</td>' +
                    '<td class="action-links">' +
                    //'<a href="' + blob.url + '" target="_blank" download>Download</a> </td>' +
                    '<a href="' + blob.url + '" download="' + name + '">Download</a> </td>' +
                    '<td>'+blob.status +'</td>' +
                    '</tr>';
                $('#table-body').append(row);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error updating table:', error);
        }
    });
}