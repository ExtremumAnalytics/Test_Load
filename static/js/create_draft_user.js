// // // Open the Source URL from Results 
// // function openFileInNewTab(url) {
// //     var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
// //     var win = window.open(googleDocsUrl, '_blank');
// //     win.focus();
// // }

// // Progress Bar update
// function updateProgressBar(percentage) {
//     const progressBar = document.getElementById('waitImg');
//     progressBar.style.width = percentage + '%';
//     percent=percentage + '%';
//     progressBar.setAttribute('width', percent);
//     progressBar.innerText = percentage + '% ';
// }


// // Define the sendQuestion function in the global scope
// function sendQuestion() {
//     const socket=io();
//     var question = document.getElementById("question").value.trim(); // Trim the question
//     const draftType = document.getElementById('draftTypeDropdown').value;
//     if (!draftType) {
//         alert('Please select a draft type.');
//         return;
//     }

//     socket.emit('get_draft_by_type', { draftType });

//     socket.on('draft_response', (data) => {
//         if (data.error) {
//             alert(data.error);
//         } else {
//             // const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(data.url)}&embedded=true`;
//             var officeUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(data.url);
//             document.getElementById('draftIframe').src = officeUrl;
//         }
//     });
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
//             var listItem = document.createElement('li');
//             listItem.innerHTML = "<strong>Question:</strong> " + item.question + "<br>" +
//                 "<strong>Answer:</strong> " + item.answer + "<br>" +
//                 "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong>Source:</strong> </a>";
//             historyList.appendChild(listItem);
//         });

//         // Attach event listeners to source links
//         document.querySelectorAll('.source-link').forEach(function(link) {
//             link.addEventListener('click', function() {
//                 openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
//             });
//         });

//         document.getElementById("question").value = ""; // Clear the question input
//     });
// }

// function openFileInNewTab(url) {
//     try {
//         // Ensure URL is fully encoded
//         // var encodedUrl = encodeURIComponent(url.trim());
//         // var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodedUrl;
//             // Use Microsoft Office Online viewer
//         var officeUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(url);
//         // iframe.src = officeUrl;
//         console.log('Opening URL:', officeUrl);
//         var win = window.open(officeUrl, '_blank');
//         if (win) {
//             win.focus();
//         } else {
//             console.error("Failed to open new tab. Popup blocker might be enabled.");
//         }
//     } catch (e) {
//         console.error("Error opening file in new tab:", e);
//     }
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
//         // sourceLink.textContent = sources[i];

//         // Extract file name from the URL
//         var url = new URL(sources[i]);
//         var fileName = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
//         sourceLink.textContent = fileName;

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



// // Clear Chat
// function clearChat() {
//     const socket=io();
//     socket.emit('clear_chat');

//     socket.on('chat_cleared', function(data) {
//         console.log('response', data);
//         $('#message').text(data.message);
//         setTimeout(function() {
//             $('#message').text('');
//         }, 8000); // Clear the message after 8 seconds

//         if (data.message === 'Chat history cleared successfully') {
//             var historyContainer = document.getElementById("questionAnswer");
//             var doc = document.getElementById('draftIframe');
//             historyContainer.innerHTML = "";
//             doc.src = "";
//         } else {
//             alert("An error occurred while clearing chat history.");
//         }
//     });
// }

// const socket=io();
// var pin = localStorage.getItem('pin');

// // socket.on('lda_topics_QA', function(data) {
// //     // Only update the UI if the data is for the current user
// //     if (data.pin === pin) {
// //         console.log('Received LDA keywords:', data); // Debug

// //         // let htmlString = '';
// //         if (Array.isArray(data.keywords)) {
// //             let htmlString = data.keywords.map(keyword => `<span style="color: #0D076A">${keyword}</span>`).join(', ');
// //             document.getElementById('ldaQAText').innerHTML = htmlString;
// //         } else {
// //             console.error('Expected an array of keywords, but received:', data.keywords);
// //         }

// //         // Update the UI element based on the LDA type
// //         // document.getElementById('ldaQAText').innerHTML = htmlString;
// //     }
// // });

// // // Q/A Page Topics Defining using Latent Dirichlet Allocation
// // socket.on('lda_topics_QA', function(data) {
// //     // Only update the LDA topics if the data is for the current user
// //     if (data.pin === pin) {
// //         console.log('Received LDA data:', data); // Debug

// //         let htmlString = '';
// //         for (const topic in data) {
// //             if (data.hasOwnProperty(topic)) {
// //                 htmlString += `<b>${topic}:</b>`;

// //                 const values = data[topic];
// //                 console.log(`Topic: ${topic}, Values:`, values); // Debug: Log the values

// //                 // Check if values is an array
// //                 if (Array.isArray(values)) {
// //                     values.forEach((value, index) => {
// //                         htmlString += (index % 2 === 0) ? `<span style="color: #0D076A">${value}</span>` : value;
// //                         htmlString += ', ';
// //                     });
// //                 } else {
// //                     console.error(`Expected an array for topic ${topic}, but got:`, values);
// //                 }

// //                 htmlString = htmlString.slice(0, -2); // Remove the trailing comma and space
// //                 htmlString += '<br>';
// //             }
// //         }

// //         // Update the UI element based on the LDA type
// //         document.getElementById('ldaQAText').innerHTML = htmlString;
// //     }
// // });


// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Document Viewer</title>
//     <style>
//         .popup {
//             position: fixed;
//             top: 50px;
//             left: 50%;
//             transform: translateX(-50%);
//             background-color: #fff;
//             padding: 20px;
//             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//             z-index: 1000;
//         }
//         .popup-content {
//             position: relative;
//         }
//         .close-button {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             cursor: pointer;
//         }
//     </style>
// </head>
// <body>
//     <div id="popup" class="popup" style="display: none;">
//         <div class="popup-content">
//             <span class="close-button" onclick="document.getElementById('popup').style.display='none'">&times;</span>
//             <iframe id="draftIframe" style="width: 100%; height: 600px;"></iframe>
//         </div>
//     </div>

//     <select id="draftTypeDropdown">
//         <option value="">Select Draft Type</option>
//         <option value="type1">Type 1</option>
//         <option value="type2">Type 2</option>
//     </select>
//     <input type="text" id="question" placeholder="Ask a question">
//     <button onclick="sendQuestion()">Send Question</button>
//     <div id="waitImg" style="display:none;">Loading...</div>
//     <div id="questionAnswer"></div>

const msalConfig = {
    auth: {
        clientId: 'YOUR_CLIENT_ID', // Replace with your Azure AD application client ID
        authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your Azure AD tenant ID
        redirectUri: 'YOUR_REDIRECT_URI' // Replace with your redirect URI
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const loginRequest = {
    scopes: ['Files.ReadWrite.All']
};

async function signIn() {
    try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        const account = loginResponse.account;
        msalInstance.setActiveAccount(account);

        const tokenRequest = {
            scopes: ['Files.ReadWrite.All'],
            account: account
        };
        const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
        return tokenResponse.accessToken;
    } catch (error) {
        console.error('Error during login', error);
    }
}

async function updateDocumentContent(fileId, content, accessToken) {
    const endpoint = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`;

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        },
        body: content // The content generated by the LLM should be in a Word document format
    });

    if (response.ok) {
        return response.json();
    } else {
        console.error('Error updating document content', response.statusText);
    }
}

async function openDocumentInIframe(fileId) {
    const accessToken = await signIn();
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content?access_token=${accessToken}`;
    document.getElementById('draftIframe').src = officeUrl;
    document.getElementById('popup').style.display = 'block';
}

async function sendQuestion() {
    const socket = io();
    var question = document.getElementById("question").value.trim();
    const draftType = document.getElementById('draftTypeDropdown').value;
    if (!draftType) {
        alert('Please select a draft type.');
        return;
    }

    socket.emit('get_draft_by_type', { draftType });

    socket.on('draft_response', async (data) => {
        if (data.error) {
            alert(data.error);
        } else {
            var officeUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(data.url);
            document.getElementById('draftIframe').src = officeUrl;

            if (question === "") {
                alert("Ask Question!");
                return;
            }
            document.getElementById("waitImg").style.display = 'block';

            socket.emit('ask_question', { question: question });

            socket.on('progress', function(data) {
                if (data.pin == pin) {
                    updateProgressBar(data.percentage);
                    console.log(data.percentage);
                }
            });

            socket.on('response', async function(response) {
                updateProgressBar(100);
                console.log('100');
                setTimeout(() => {
                    document.getElementById("waitImg").style.display = 'none';
                }, 1500);

                if (response.message) {
                    document.getElementById('message').innerText = response.message;
                    setTimeout(function() {
                        document.getElementById('message').innerText = '';
                    }, 8000);
                }

                var historyContainer = document.getElementById("questionAnswer");
                historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

                var historyList = document.getElementById("chatHistoryList");
                response.chat_history.forEach(function(item) {
                    var listItem = document.createElement('li');
                    listItem.innerHTML = "<strong>Question:</strong> " + item.question + "<br>" +
                        "<strong>Answer:</strong> " + item.answer + "<br>" +
                        "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong>Source:</strong> </a>";
                    historyList.appendChild(listItem);
                });

                document.querySelectorAll('.source-link').forEach(function(link) {
                    link.addEventListener('click', function() {
                        openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
                    });
                });

                document.getElementById("question").value = "";

                const llmContent = response.message; // Assuming response.message contains the content
                const fileId = 'YOUR_FILE_ID'; // Replace with the actual file ID
                const accessToken = await signIn();
                await updateDocumentContent(fileId, llmContent, accessToken);
                openDocumentInIframe(fileId);
            });
        }
    });
}
