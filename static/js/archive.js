var socket = io();
function loadArchivedChats() {
    var archivedChats = JSON.parse(localStorage.getItem('archivedChats')) || [];
    var archivedSummary = JSON.parse(localStorage.getItem('archivedSummary')) || [];
    var archivedEDA = JSON.parse(localStorage.getItem('virtualAnalystData')) || [];
    var container = document.getElementById('archivedChatsContainer');
    
    // Show Archived Chats
    archivedChats.forEach(function(chat, index) {
        var listItem = document.createElement('div');
        listItem.classList.add('chat-item');

        var questionElement = document.createElement('span');
        questionElement.innerHTML = "<b> Question: </b>" + chat.question;
        questionElement.style.fontFamily = 'Times New Roman';
        var preElement = document.createElement('pre');
        preElement.innerHTML = "<b>Answer:</b> " + chat.answer + "\n" +
                               "<a href='javascript:void(0)' class='source-link' data-source='" + chat.source + "' data-page='" + chat.page_number + "'><strong> Source </strong></a>\n\n";
        preElement.classList.add('formatted-pre');
        
        preElement.style.whiteSpace = 'pre-wrap';
        preElement.style.overflowX = 'hidden';
        preElement.style.overflowY = 'auto';
        preElement.style.fontFamily = 'Times New Roman';
        preElement.style.fontSize = '16px';

        listItem.appendChild(questionElement);
        listItem.appendChild(preElement);
        container.appendChild(listItem);
    });
    document.querySelectorAll('.source-link').forEach(function(link) {
        link.addEventListener('click', function() {
            openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
        });
    });

    // Show Archived Summary
    archivedSummary.forEach(function(summary, index) {
        var listItem = document.createElement('div');
        listItem.classList.add('summary-item');

        var questionElement = document.createElement('span');
        questionElement.innerHTML = "<b> Filename: </b>" + summary.filename;
        questionElement.style.fontFamily = 'Times New Roman';

        var preElement = document.createElement('pre');
        preElement.innerHTML = "<b>Summary:</b> " + summary.summary + "\n" ;
        preElement.classList.add('formatted-pre');
        
        preElement.style.whiteSpace = 'pre-wrap';
        preElement.style.overflowX = 'hidden';
        preElement.style.overflowY = 'auto';
        preElement.style.fontFamily = 'Times New Roman';
        preElement.style.fontSize = '16px';

        listItem.appendChild(questionElement);
        listItem.appendChild(preElement);
        container.appendChild(listItem);
    });

    // Show Archived Virtual Analyst Data
    archivedEDA.forEach(function(data) {
        var listItem = document.createElement('div');
        listItem.classList.add('eda-item');

        var questionElement = document.createElement('span');
        questionElement.innerHTML = "<b> Question: </b>" + data.eda_question;
        questionElement.style.fontFamily = 'Times New Roman';

        var preElement = document.createElement('pre');
        preElement.innerHTML = "<b>Answer:</b> " +  data.eda_response + "\n" ;
        preElement.classList.add('formatted-pre');
        
        preElement.style.whiteSpace = 'pre-wrap';
        preElement.style.overflowX = 'hidden';
        preElement.style.overflowY = 'auto';
        preElement.style.fontFamily = 'Times New Roman';
        preElement.style.fontSize = '16px';

        listItem.appendChild(questionElement);
        listItem.appendChild(preElement);
        container.appendChild(listItem);
    });

}

function emailArchivedChats() {
    var archivedChats = JSON.parse(localStorage.getItem('archivedChats')) || [];
    var archivedSummary = JSON.parse(localStorage.getItem('archivedSummary')) || [];
    var archivedEDA = JSON.parse(localStorage.getItem('virtualAnalystData')) || [];

    // if (archivedChats.length === 0 || archivedSummary.length===0 || archivedEDA.length===0) {
    //     alert("No archived history to email.");
    //     return;
    // }
    
    socket.emit('save_archive_data', {type: 'email' });

    socket.on('save_archive_response', function(response) {
        if (response.success) {
            alert(response.message);
            localStorage.removeItem('archivedChats');
            localStorage.removeItem('archivedSummary');
            localStorage.removeItem('virtualAnalystData');
        }
        else{
            alert(response.message);
        }
    });
}

function saveArchivedChats() {
    var archivedChats = JSON.parse(localStorage.getItem('archivedChats')) || [];
    var archivedSummary = JSON.parse(localStorage.getItem('archivedSummary')) || [];
    var archivedEDA = JSON.parse(localStorage.getItem('virtualAnalystData')) || [];
    // if (archivedChats.length === 0 || archivedSummary.length===0 || archivedEDA.length===0) {
    //     alert("No archived history to save.");
    //     return;
    // }
    
    socket.emit('save_archive_data', {type: 'save' });

    socket.on('save_archive_response', function(response) {
        if (response.success) {
            alert(response.message);
            localStorage.removeItem('archivedChats');
            localStorage.removeItem('archivedSummary');
            localStorage.removeItem('virtualAnalystData');
        }
        else{
            alert(response.message);
        }
    });
}

// Load the archived chats when the page loads
window.onload = loadArchivedChats;


function openFileInNewTab(url) {
    try {
        const pattern = /https:\/\/.+\/https:\/\/.+/;
        const pattern2 = /https:\/\/.+/;
        
        // Search for the pattern in the input string
        const match = url.match(pattern);
        const match_web_url = url.match(pattern2);
        if(match){
            const extractedUrl = match[0].split('https://').slice(2).join('https://');
            const finalUrl = `https://${extractedUrl}`;
            var win = window.open(finalUrl, '_blank');
            if (win) {
                win.focus();
            } else {
                console.error("Failed to open new tab. Popup blocker might be enabled.");
            }
        }
        else if (match_web_url) {
            var win = window.open(url, '_blank');
            if (win) {
                win.focus();
            } else {
                console.error("Failed to open new tab. Popup blocker might be enabled.");
            }
        }
        else{
            // Ensure URL is fully encoded
            var encodedUrl = encodeURIComponent(url.trim());
            var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodedUrl;
            // console.log('Opening URL:', googleDocsUrl);
            var win = window.open(googleDocsUrl, '_blank');
            if (win) {
                win.focus();
            } else {
                console.error("Failed to open new tab. Popup blocker might be enabled.");
            }
        }
    } catch (e) {
        console.error("Error opening file in new tab:", e);
    }
}


function openPopup(sources, pageNumbers) {
    // console.log("Opening popup with sources:", sources, "and page numbers:", pageNumbers);

    // Create the popup div
    var popupDiv = document.createElement('div');
    popupDiv.classList.add('popup');

    // Create the content div
    var popupContent = document.createElement('div');
    var tableContent = document.createElement('div');
    popupContent.classList.add('popup-content');
    tableContent.classList.add('table-content');
    tableContent.style.maxHeight  = '500px'; // Allows text to wrap
    tableContent.style.whiteSpace = 'pre-wrap'; // Allows text to wrap
    tableContent.style.overflowX = 'hidden';    // Hides horizontal overflow
    tableContent.style.overflowY = 'auto';      // Allows vertical overflow (optional)

    // Create the close button
    var closeButton = document.createElement('span');
    closeButton.classList.add('close-button');
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
        popupDiv.style.display = 'none';
        document.body.removeChild(popupDiv);
    };

    // Create the table
    var table = document.createElement('table');

    // Create and append the table header row
    var headerRow = document.createElement('tr');
    var sourceHeader = document.createElement('th');
    sourceHeader.textContent = 'Source Filename';
    var pageNumberHeader = document.createElement('th');
    pageNumberHeader.textContent = 'Page Number';
    headerRow.appendChild(sourceHeader);
    headerRow.appendChild(pageNumberHeader);
    table.appendChild(headerRow);

    // Function to extract file name from URL
    function extractFileName(url) {
        // Regular expression to find the URL after the changeable part
        const pattern = /https:\/\/.+\/https:\/\/.+/;
        const pattern2 = /https:\/\/.*testcongnilink.blob.core.windows.net/;        
        // Search for the pattern in the input string
        const match = url.match(pattern);
        const match_file_url = url.match(pattern2);
        if (match_file_url) {
            return url.split('/').pop();
        }
        else if (match) {
            // Extract the URL part after the last occurrence of 'https://'
            const extractedUrl = match[0].split('https://').slice(2).join('https://');
            // console.log("Extracted URL:", `https://${extractedUrl}`);
            return extractedUrl;
        }
        else{
            return url;
        }
        
    }

    // Create and append the source rows
    for (var i = 0; i < sources.length; i++) {
        var sourceRow = document.createElement('tr');
        var sourceData = document.createElement('td');
        var sourceLink = document.createElement('a');

        var fileName = extractFileName(sources[i]);  // Extract the file name from the URL
        sourceLink.href = 'javascript:void(0)';  // Prevent default link behavior
        if(fileName.length>40){
            sourceLink.textContent = fileName.substring(0, 40) + '...';
        }
        else{
            sourceLink.textContent = fileName;
        }

        // Add event listener to open the file in Google Viewer
        sourceLink.addEventListener('click', (function(url) {
            return function() {
                openFileInNewTab(url);
            };
        })(sources[i]));

        sourceData.appendChild(sourceLink);
        var pageNumberData = document.createElement('td');
        pageNumberData.textContent = pageNumbers[i];
        sourceRow.appendChild(sourceData);
        sourceRow.appendChild(pageNumberData);
        table.appendChild(sourceRow);
    }

    // Append the close button and table to the popup content
    popupContent.appendChild(closeButton);
    tableContent.appendChild(table);
    popupContent.appendChild(tableContent);

    // Append the content to the popup div
    popupDiv.appendChild(popupContent);

    // Append the popup to the body
    document.body.appendChild(popupDiv);

    // Display the popup
    popupDiv.style.display = 'flex';
}
