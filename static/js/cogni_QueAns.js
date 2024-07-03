// // Open the Source URL from Results 
// function openFileInNewTab(url) {
//     var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
//     var win = window.open(googleDocsUrl, '_blank');
//     win.focus();
// }

// Progress Bar update
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('waitImg');
    progressBar.style.width = percentage + '%';
    percent=percentage + '%';
    progressBar.setAttribute('width', percent);
    progressBar.innerText = percentage + '% ';
}
function sendQuestion() {
    const socket = io();
    var question = document.getElementById("question").value.trim(); // Trim the question

    if (question === "") {
        alert("Ask Question!");
        return;
    }
    document.getElementById("waitImg").style.display = 'block'; // Show the loading image

    socket.emit('ask_question', { question: question });

    socket.on('progress', function(data) {
        if (data.pin === pin) {
            updateProgressBar(data.percentage);
            console.log(data.percentage);
        }
    });

    socket.on('response', function(response) {
        updateProgressBar(100);
        console.log('100');
        setTimeout(() => {
            document.getElementById("waitImg").style.display = 'none';
        }, 1500);

        if (response.message) {
            document.getElementById('message').innerText = response.message;
            setTimeout(function() {
                document.getElementById('message').innerText = '';
            }, 8000); // delete after 8 seconds
        }

        // Display chat history
        var historyContainer = document.getElementById("questionAnswer");
        historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

        var historyList = document.getElementById("chatHistoryList");
        response.chat_history.forEach(function(item) {
            var listItem = document.createElement('li');
            listItem.innerHTML = "<strong>Question:</strong> " + item.question + "<br>" +
                "<strong>Answer:</strong> " + item.answer + "<br>" +
                "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong> Source </strong> </a>";
            historyList.appendChild(listItem);
        });

        // Attach event listeners to source links
        document.querySelectorAll('.source-link').forEach(function(link) {
            link.addEventListener('click', function() {
                openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
            });
        });

        document.getElementById("question").value = ""; // Clear the question input
    });
}

function openFileInNewTab(url) {
    try {
        // Ensure URL is fully encoded
        var encodedUrl = encodeURIComponent(url.trim());
        var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodedUrl;
        console.log('Opening URL:', googleDocsUrl);
        var win = window.open(googleDocsUrl, '_blank');
        if (win) {
            win.focus();
        } else {
            console.error("Failed to open new tab. Popup blocker might be enabled.");
        }
    } catch (e) {
        console.error("Error opening file in new tab:", e);
    }
}


function openPopup(sources, pageNumbers) {
    console.log("Opening popup with sources:", sources, "and page numbers:", pageNumbers);

    // Create the popup div
    var popupDiv = document.createElement('div');
    popupDiv.classList.add('popup');

    // Create the content div
    var popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

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
        return url.split('/').pop();
    }

    // Create and append the source rows
    for (var i = 0; i < sources.length; i++) {
        var sourceRow = document.createElement('tr');
        var sourceData = document.createElement('td');
        var sourceLink = document.createElement('a');

        var fileName = extractFileName(sources[i]);  // Extract the file name from the URL

        sourceLink.href = 'javascript:void(0)';  // Prevent default link behavior
        sourceLink.textContent = fileName;

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
    popupContent.appendChild(table);

    // Append the content to the popup div
    popupDiv.appendChild(popupContent);

    // Append the popup to the body
    document.body.appendChild(popupDiv);

    // Display the popup
    popupDiv.style.display = 'flex';
}


//working
// function openPopup(sources, pageNumbers) {
//     console.log("Opening popup with sources:", sources, "and page numbers:", pageNumbers);

//     // Create the popup div
//     var popupDiv = document.createElement('div');
//     popupDiv.classList.add('popup');

//     // Create the content div
//     var popupContent = document.createElement('div');
//     popupContent.classList.add('popup-content');

//     // Create the close button
//     var closeButton = document.createElement('span');
//     closeButton.classList.add('close-button');
//     closeButton.innerHTML = '&times;';
//     closeButton.onclick = function() {
//         popupDiv.style.display = 'none';
//         document.body.removeChild(popupDiv);
//     };

//     // Create the table
//     var table = document.createElement('table');

//     // Create and append the table header row
//     var headerRow = document.createElement('tr');
//     var sourceHeader = document.createElement('th');
//     sourceHeader.textContent = 'Source Filename';
//     var pageNumberHeader = document.createElement('th');
//     pageNumberHeader.textContent = 'Page Number';
//     headerRow.appendChild(sourceHeader);
//     headerRow.appendChild(pageNumberHeader);
//     table.appendChild(headerRow);

//     // Create and append the source rows
//     for (var i = 0; i < sources.length; i++) {
//         var sourceRow = document.createElement('tr');
//         var sourceData = document.createElement('td');
//         var sourceLink = document.createElement('a');
//         sourceLink.href = 'javascript:void(0)';
//         sourceLink.textContent = sources[i];

//         sourceLink.addEventListener('click', (function(source) {
//             return function() {
//                 openFileInNewTab(source);
//             };
//         })(sources[i]));

//         sourceData.appendChild(sourceLink);
//         var pageNumberData = document.createElement('td');
//         pageNumberData.textContent = pageNumbers[i];
//         sourceRow.appendChild(sourceData);
//         sourceRow.appendChild(pageNumberData);
//         table.appendChild(sourceRow);
//     }

//     // Append the close button and table to the popup content
//     popupContent.appendChild(closeButton);
//     popupContent.appendChild(table);

//     // Append the content to the popup div
//     popupDiv.appendChild(popupContent);

//     // Append the popup to the body
//     document.body.appendChild(popupDiv);

//     // Display the popup
//     popupDiv.style.display = 'flex';
// }







// function openPopup(sources, pageNumbers) {
//     console.log("Opening popup with sources:", sources, "and page numbers:", pageNumbers);

//     // Create the popup div
//     var popupDiv = document.createElement('div');
//     popupDiv.classList.add('popup');

//     // Create the content div
//     var popupContent = document.createElement('div');
//     popupContent.classList.add('popup-content');

//     // Create the close button
//     var closeButton = document.createElement('span');
//     closeButton.classList.add('close-button');
//     closeButton.innerHTML = '&times;';
//     closeButton.onclick = function() {
//         popupDiv.style.display = 'none';
//         document.body.removeChild(popupDiv);
//     };

//     // Create the table
//     var table = document.createElement('table');

//     // Create and append the table header row
//     var headerRow = document.createElement('tr');
//     var sourceHeader = document.createElement('th');
//     sourceHeader.textContent = 'Source URL';
//     var pageNumberHeader = document.createElement('th');
//     pageNumberHeader.textContent = 'Page Number';
//     headerRow.appendChild(sourceHeader);
//     headerRow.appendChild(pageNumberHeader);
//     table.appendChild(headerRow);

//     // Create and append the source rows
//     for (var i = 0; i < sources.length; i++) {
//         var sourceRow = document.createElement('tr');
//         var sourceData = document.createElement('td');
//         var sourceLink = document.createElement('a');
//         sourceLink.href = 'javascript:void(0)';
//         sourceLink.textContent = sources[i];
//         sourceLink.addEventListener('click', (function(source) {
//             return function() {
//                 openFileInNewTab(source);
//             };
//         })(sources[i]));
//         sourceData.appendChild(sourceLink);
//         var pageNumberData = document.createElement('td');
//         pageNumberData.textContent = pageNumbers[i];
//         sourceRow.appendChild(sourceData);
//         sourceRow.appendChild(pageNumberData);
//         table.appendChild(sourceRow);
//     }

//     // Append the close button and table to the popup content
//     popupContent.appendChild(closeButton);
//     popupContent.appendChild(table);

//     // Append the content to the popup div
//     popupDiv.appendChild(popupContent);

//     // Append the popup to the body
//     document.body.appendChild(popupDiv);

//     // Display the popup
//     popupDiv.style.display = 'flex';
// }


// function sendQuestion() {
//     const socket = io();
//     var question = document.getElementById("question").value.trim(); // Trim the question

//     if (question === "") {
//         alert("Ask Question!");
//         return;
//     }
//     document.getElementById("waitImg").style.display = 'block'; // Show the loading image

//     socket.emit('ask_question', { question: question });

//     socket.on('progress', function(data) {
//         if (data.pin === pin) {
//             updateProgressBar(data.percentage);
//             console.log(data.percentage);
//         }
//     });

//     socket.on('response', function(response) {
//         updateProgressBar(100);
//         console.log('100');
//         setTimeout(() => {
//             document.getElementById("waitImg").style.display = 'none';
//         }, 1500);

//         if (response.message) {
//             document.getElementById('message').innerText = response.message;
//             setTimeout(function() {
//                 document.getElementById('message').innerText = '';
//             }, 8000); // delete after 8 seconds
//         }

//         // Display chat history
//         var historyContainer = document.getElementById("questionAnswer");
//         historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

//         var historyList = document.getElementById("chatHistoryList");
//         response.chat_history.forEach(function(item) {
//             var listItem = document.createElement('li');
//             listItem.innerHTML = "<strong>Question:</strong> " + item.question + "<br>" +
//                 "<strong>Answer:</strong> " + item.answer + "<br>" +
//                 "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong>Source:</strong> </a>";
//             historyList.appendChild(listItem);
//         });

//         // Attach event listeners to source links
//         document.querySelectorAll('.source-link').forEach(function(link) {
//             link.addEventListener('click', function() {
//                 openPopup(this.getAttribute('data-source'), this.getAttribute('data-page'));
//             });
//         });

//         document.getElementById("question").value = ""; // Clear the question input
//     });
// }

// function openFileInNewTab(url) {
//     var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
//     var win = window.open(googleDocsUrl, '_blank');
//     win.focus();
// }

// function openPopup(source, pageNumber) {
//     console.log("Opening popup with source:", source, "and page number:", pageNumber);

//     // Create the popup div
//     var popupDiv = document.createElement('div');
//     popupDiv.classList.add('popup');

//     // Create the content div
//     var popupContent = document.createElement('div');
//     popupContent.classList.add('popup-content');

//     // Create the close button
//     var closeButton = document.createElement('span');
//     closeButton.classList.add('close-button');
//     closeButton.innerHTML = '&times;';
//     closeButton.onclick = function() {
//         popupDiv.style.display = 'none';
//         document.body.removeChild(popupDiv);
//     };

//     // Create the table
//     var table = document.createElement('table');

//     // Create and append the table header row
//     var headerRow = document.createElement('tr');
//     var sourceHeader = document.createElement('th');
//     sourceHeader.textContent = 'Source URL';
//     var pageNumberHeader = document.createElement('th');
//     pageNumberHeader.textContent = 'Page Number';
//     headerRow.appendChild(sourceHeader);
//     headerRow.appendChild(pageNumberHeader);
//     table.appendChild(headerRow);

//     // Create and append the source row
//     var sourceRow = document.createElement('tr');
//     var sourceData = document.createElement('td');
//     var sourceLink = document.createElement('a');
//     sourceLink.href = 'javascript:void(0)';
//     sourceLink.textContent = source;
//     sourceLink.addEventListener('click', function() {
//         openFileInNewTab(source);
//     });
//     sourceData.appendChild(sourceLink);
//     var pageNumberData = document.createElement('td');
//     pageNumberData.textContent = pageNumber;
//     sourceRow.appendChild(sourceData);
//     sourceRow.appendChild(pageNumberData);
//     table.appendChild(sourceRow);

//     // Append the close button and table to the popup content
//     popupContent.appendChild(closeButton);
//     popupContent.appendChild(table);

//     // Append the content to the popup div
//     popupDiv.appendChild(popupContent);

//     // Append the popup to the body
//     document.body.appendChild(popupDiv);

//     // Display the popup
//     popupDiv.style.display = 'flex';
// }




// function sendQuestion() {
//     const socket = io();
//     var question = document.getElementById("question").value.trim(); // Trim the question

//     if (question === "") {
//         alert("Ask Question!");
//         return;
//     }
//     document.getElementById("waitImg").style.display = 'block'; // Show the loading image

//     socket.emit('ask_question', { question: question });

//     socket.on('progress', function(data) {
//         if (data.pin === pin) {
//             updateProgressBar(data.percentage);
//             console.log(data.percentage);
//         }
//     });

//     socket.on('response', function(response) {
//         updateProgressBar(100);
//         console.log('100');
//         setTimeout(() => {
//             document.getElementById("waitImg").style.display = 'none';
//         }, 1500);

//         if (response.message) {
//             document.getElementById('message').innerText = response.message;
//             setTimeout(function() {
//                 document.getElementById('message').innerText = '';
//             }, 8000); // delete after 8 seconds
//         }

//         // Display chat history
//         var historyContainer = document.getElementById("questionAnswer");
//         historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

//         var historyList = document.getElementById("chatHistoryList");
//         response.chat_history.forEach(function(item) {
//             var listItem = document.createElement('li');
//             listItem.innerHTML = "<strong>Question:</strong> " + item.question + "<br>" +
//                 "<strong>Answer:</strong> " + item.answer + "<br>" +
//                 "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong>Source:</strong> </a>";
//             historyList.appendChild(listItem);
//         });

//         // Attach event listeners to source links
//         document.querySelectorAll('.source-link').forEach(function(link) {
//             link.addEventListener('click', function() {
//                 openPopup(this.getAttribute('data-source'), this.getAttribute('data-page'));
//             });
//         });

//         document.getElementById("question").value = ""; // Clear the question input
//     });
// }

// function openPopup(source, pageNumber) {
//     console.log("Opening popup with source:", source, "and page number:", pageNumber);

//     // Create the popup div
//     var popupDiv = document.createElement('div');
//     popupDiv.classList.add('popup');

//     // Create the content div
//     var popupContent = document.createElement('div');
//     popupContent.classList.add('popup-content');

//     // Create the close button
//     var closeButton = document.createElement('span');
//     closeButton.classList.add('close-button');
//     closeButton.innerHTML = '&times;';
//     closeButton.onclick = function() {
//         popupDiv.style.display = 'none';
//         document.body.removeChild(popupDiv);
//     };

//     // Create the table
//     var table = document.createElement('table');

//     // Create and append the table header row
//     var headerRow = document.createElement('tr');
//     var sourceHeader = document.createElement('th');
//     sourceHeader.textContent = 'Source URL';
//     var pageNumberHeader = document.createElement('th');
//     pageNumberHeader.textContent = 'Page Number';
//     headerRow.appendChild(sourceHeader);
//     headerRow.appendChild(pageNumberHeader);
//     table.appendChild(headerRow);

//     // Create and append the source row
//     var sourceRow = document.createElement('tr');
//     var sourceData = document.createElement('td');
//     sourceData.textContent = source;
//     var pageNumberData = document.createElement('td');
//     pageNumberData.textContent = pageNumber;
//     sourceRow.appendChild(sourceData);
//     sourceRow.appendChild(pageNumberData);
//     table.appendChild(sourceRow);

//     // Append the close button and table to the popup content
//     popupContent.appendChild(closeButton);
//     popupContent.appendChild(table);

//     // Append the content to the popup div
//     popupDiv.appendChild(popupContent);

//     // Append the popup to the body
//     document.body.appendChild(popupDiv);

//     // Display the popup
//     popupDiv.style.display = 'flex';
// }

// // Define the sendQuestion function in the global scope
// function sendQuestion() {
//     const socket=io();
//     var question = document.getElementById("question").value.trim(); // Trim the question

//     if (question === "") {
//         alert("Ask Question!");
//         return;
//     }
//     document.getElementById("waitImg").style.display = 'block'; // Show the loading image

//     socket.emit('ask_question', { question: question });
    
//     socket.on('progress', function(data) {
//         if(data.pin==pin){
//             updateProgressBar(data.percentage);
//             console.log(data.percentage)
//         }
//     });
    
//     socket.on('response', function(response) {
//         updateProgressBar(100);
//         console.log('100')
//         setTimeout(() => {
//             document.getElementById("waitImg").style.display = 'none';
//         }, 1500);
        
//         if (response.message) {
//             document.getElementById('message').innerText = response.message;
//             setTimeout(function() {
//                 document.getElementById('message').innerText = '';
//             }, 8000); // delete after 8 seconds
//         }

//         // Display chat history
//         var historyContainer = document.getElementById("questionAnswer");
//         historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

//         var historyList = document.getElementById("chatHistoryList");
//         response.chat_history.forEach(function(item) {
//             historyList.innerHTML += "<li><strong>Question:</strong> " + item.question + "<br>" +
//                 "<strong>Answer:</strong> " + item.answer + "<br>" +
//                 "<strong>Source:</strong> <a href='#' onclick=\"openFileInNewTab('" + item.source + "')\">" + item.source + "</a><br>" +
//                 "<strong>Page Number:</strong> " + item.page_number + "</li><br>";
//         });

//         document.getElementById("question").value = ""; // Clear the question input
//     });
// }

// Clear Chat
function clearChat() {
    const socket=io();
    socket.emit('clear_chat');

    socket.on('chat_cleared', function(data) {
        console.log('response', data);
        $('#message').text(data.message);
        setTimeout(function() {
            $('#message').text('');
        }, 8000); // Clear the message after 8 seconds

        if (data.message === 'Chat history cleared successfully') {
            var historyContainer = document.getElementById("questionAnswer");
            historyContainer.innerHTML = "";
        } else {
            alert("An error occurred while clearing chat history.");
        }
    });
}

const socket=io();
var pin = localStorage.getItem('pin');

socket.on('lda_topics_QA', function(data) {
    // Only update the UI if the data is for the current user
    if (data.pin === pin) {
        console.log('Received LDA keywords:', data); // Debug

        // let htmlString = '';
        if (Array.isArray(data.keywords)) {
            let htmlString = data.keywords.map(keyword => `<span style="color: #0D076A">${keyword}</span>`).join(', ');
            document.getElementById('ldaQAText').innerHTML = htmlString;
        } else {
            console.error('Expected an array of keywords, but received:', data.keywords);
        }

        // Update the UI element based on the LDA type
        // document.getElementById('ldaQAText').innerHTML = htmlString;
    }
});

// // Q/A Page Topics Defining using Latent Dirichlet Allocation
// socket.on('lda_topics_QA', function(data) {
//     // Only update the LDA topics if the data is for the current user
//     if (data.pin === pin) {
//         console.log('Received LDA data:', data); // Debug

//         let htmlString = '';
//         for (const topic in data) {
//             if (data.hasOwnProperty(topic)) {
//                 htmlString += `<b>${topic}:</b>`;

//                 const values = data[topic];
//                 console.log(`Topic: ${topic}, Values:`, values); // Debug: Log the values

//                 // Check if values is an array
//                 if (Array.isArray(values)) {
//                     values.forEach((value, index) => {
//                         htmlString += (index % 2 === 0) ? `<span style="color: #0D076A">${value}</span>` : value;
//                         htmlString += ', ';
//                     });
//                 } else {
//                     console.error(`Expected an array for topic ${topic}, but got:`, values);
//                 }

//                 htmlString = htmlString.slice(0, -2); // Remove the trailing comma and space
//                 htmlString += '<br>';
//             }
//         }

//         // Update the UI element based on the LDA type
//         document.getElementById('ldaQAText').innerHTML = htmlString;
//     }
// });