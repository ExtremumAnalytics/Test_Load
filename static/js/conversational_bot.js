const socket=io();
var pin = localStorage.getItem('pin');
socket.emit('table_update');
var isSpeechEnabled = true;

// Toggle Switch
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    var voice = localStorage.getItem('voice');
    setGif(voice);
    socket.emit('greetme',{voice:voice});
    set_speakingGif();

    socket.on('greetMeResponse',function(data){
        console.log(data.message);
        if (data.message){
            set_loadingGif();
        }
    });

 
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', function() {
            if (window.location.pathname === '/Ask_Question') {
                // Redirect to the toggle page when the switch is turned on
                if (this.checked) {
                    window.location.href = '/conversational_bot';
                }
            } else if (window.location.pathname === '/conversational_bot') {
                // Redirect back to the main page when the switch is turned off
                if (!this.checked) {
                    window.location.href = '/Ask_Question';
                }
            }
        });
    }
});


 
// Add event listener to the stop button
document.getElementById('stopNaration').addEventListener('click', stopNarration);

function stopNarration(event) {
    window.speechSynthesis.cancel(); // Stop the speech synthesis
    console.log("Narration stopped");
    if (event) {
        event.stopPropagation();
    }
}

function set_speakingGif(){
    if(document.getElementById('loadingGifMale').style.display === 'block'){
        document.getElementById('loadingGifMale').style.display = 'none';
        document.getElementById('speakingGifMale').style.display = 'block'
    }
    else if(document.getElementById('loadingGifFemale').style.display === 'block'){
        document.getElementById('loadingGifFemale').style.display = 'none';
        document.getElementById('speakingGifFemale').style.display = 'block';
    }
}

function set_loadingGif(){
    if(document.getElementById('speakingGifMale').style.display === 'block'){
        document.getElementById('speakingGifMale').style.display = 'none';
        document.getElementById('loadingGifMale').style.display = 'block'
    }
    else if(document.getElementById('speakingGifFemale').style.display === 'block'){
        document.getElementById('speakingGifFemale').style.display = 'none';
        document.getElementById('loadingGifFemale').style.display = 'block';
    }


}

function setGif(voice) {
    // Hide all GIFs initially
    document.getElementById('loadingGifMale').style.display = 'none';
    document.getElementById('speakingGifMale').style.display = 'none';
    document.getElementById('loadingGifFemale').style.display = 'none';
    document.getElementById('speakingGifFemale').style.display = 'none';

    // Show the appropriate GIFs based on voice selection
    if (voice === "male") {
        document.getElementById('loadingGifMale').style.display = 'block'; // or 'inline-block' as needed
        // Simulate loading followed by speaking
       
    } else if (voice === "female") {
        document.getElementById('loadingGifFemale').style.display = 'block';
       
    }
}


// // Progress Bar update
// function updateProgressBar(percentage) {
//     const progressBar = document.getElementById('waitImg');
//     progressBar.style.width = percentage + '%';
//     const percent = percentage + '%';
//     progressBar.setAttribute('width', percent);
//     progressBar.innerText = percentage + '% ';
// }

// Global socket initialization and response handling outside of the sendQuestion function
// var socket = io(); // Assuming socket.io is being used and initialized here

// socket.on('progress', function(data) {
//     if (data.pin === pin) {
//         updateProgressBar(data.percentage);
//     }
// });

socket.on('response', handleResponse);

function handleResponse(response) {
    // updateProgressBar(100);
    // setTimeout(() => {
    //     document.getElementById("waitImg").style.display = 'none';
    // }, 1500);
    set_speakingGif();
    displayChatHistory(response.chat_history);
    handleFollowUp(response.follow_up);
}
socket.on('speech',function(data){
    console.log(data.message);
    if (data.message){
        document.getElementById("question").value = "";
        set_loadingGif();
    }
    // if (!recognition || !recognition.running) {
    //     // Start recording
    //     startRecording();
    //     recordButton.textContent = '';
    //     recordButton.classList.remove('off'); // Remove the "off" class
    // } 
    
});


function sendQuestion() {
    var question = document.getElementById("question").value.trim();
    var source = document.getElementById("selectSource").value;
    var voice = localStorage.getItem('voice');

    if (source === 'default') {
        alert('Please select a source!');
        return;
    }

    if (question === "") {
        alert("Ask Question!");
        return;
    }

    // document.getElementById("waitImg").style.display = 'block';

    

    socket.emit('conversation', { question: question, source: source, voice: voice });
}

document.getElementById('question').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendQuestion();
    }
  });

function displayChatHistory(chatHistory) {
    var historyContainer = document.getElementById("questionAnswer");
    historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

    var historyList = document.getElementById("chatHistoryList");
    var latestItem = chatHistory.reduce((maxItem, currentItem) =>
        currentItem.index > maxItem.index ? currentItem : maxItem, chatHistory[0]);

    chatHistory.forEach(function(item) {
        var listItem = document.createElement('li');
        var questionText = "<b>Question: </b>" + item.question;

        var sourceLink = "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong> Source </strong></a>";

        var preElement = document.createElement('pre');
        preElement.classList.add('formatted-pre');
        preElement.style.whiteSpace = 'pre-wrap';
        preElement.style.overflowX = 'hidden';
        preElement.style.overflowY = 'auto';
        preElement.style.fontFamily = 'Times New Roman';
        preElement.style.fontSize = '16px';

        listItem.appendChild(preElement);
        historyList.appendChild(listItem);

        if (item.index === latestItem.index) {
            handleLatestAnswer(item, preElement, questionText, sourceLink);
        } else {
            preElement.innerHTML = questionText + "\n<b>Answer: \n</b>" + item.answer + "<br>" + sourceLink + "\n\n";
        }
    });

    attachSourceLinkEvents();
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

function handleLatestAnswer(item, preElement, questionText, sourceLink) {
    preElement.innerHTML = questionText + "\n<b>Answer: \n</b>";
    var words = item.answer.split(' ');

    
    // Incrementally update the text display regardless of speech state
    var answerText = "";
    var wordIndex = 0;
    var interval = setInterval(() => {
        if (wordIndex < words.length) {
            answerText += words[wordIndex] + ' ';
            preElement.innerHTML = questionText + "\n<b>Answer: \n</b>" + answerText;
            wordIndex++;
        } else {
            clearInterval(interval);
            // Add the source link once text is fully displayed
            var sourceElement = document.createElement('div');
            sourceElement.innerHTML = sourceLink + "\n\n";
            preElement.appendChild(sourceElement);
            sourceElement.querySelector('.source-link').addEventListener('click', function() {
                openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
            });
        }
    }, 400); // Adjust the interval time as needed
}

       




//change here
function attachSourceLinkEvents() {
    document.querySelectorAll('.source-link').forEach(function(link) {
        link.addEventListener('click', function() {
            openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
        });
    });
}
 
function handleFollowUp(followUp) {
    var follow_up_question = document.getElementById("followUp");
    follow_up_question.innerHTML = "";
 
    if (followUp === 'N/A') {
        follow_up_question.style.display = 'none';
    } else {
        var followup_list = document.createElement('p');
        follow_up_question.style.display = 'block';
        follow_up_question.appendChild(followup_list);
        followup_list.innerHTML = "<button class='btn btn-primary m-4' id='followUpButton'>" + followUp + "</button><br>";
 
        document.getElementById('followUpButton').addEventListener('click', function() {
            if (followUp) {
                var strippedString = followUp.replace("Do you also want to know", "").replace("Do you also want to know about", "");
                document.getElementById("question").value = strippedString.trim();
                sendQuestion();
            }
        });
    }
 
    document.getElementById("question").value = "";
}
 
 
 
function openFileInNewTab(url) {
    try {
        const pattern = /https:\/\/.+\/https:\/\/.+/;
        // console.log(url);
        const match = url.match(pattern);
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
 
        // Search for the pattern in the input string
        const match = url.match(pattern);
 
        if (match) {
            // Extract the URL part after the last occurrence of 'https://'
            const extractedUrl = match[0].split('https://').slice(2).join('https://');
            // console.log("Extracted URL:", `https://${extractedUrl}`);
            return extractedUrl;
        }
        else{
            return url.split('/').pop();
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
 
 
// Clear Chat
function clearChat() {
    socket.emit('clear_chat');
 
    socket.on('chat_cleared', function(data) {
        // console.log('response', data);
        $('#message').text(data.message);
        setTimeout(function() {
            $('#message').text('');
        }, 8000); // Clear the message after 8 seconds
 
        if (data.message === 'Chat history cleared successfully') {
            var historyContainer = document.getElementById("questionAnswer");
            var followup_list = document.getElementById("followUp");
            historyContainer.innerHTML = "";
            followup_list.innerHTML = "";
        } else {
            alert("An error occurred while clearing chat history.");
        }
    });
}
 
 
socket.on('lda_topics_QA', function(data) {
    // Only update the UI if the data is for the current user
    if (data.pin === pin) {
        // console.log('Received LDA keywords:', data); // Debug
 
        // let htmlString = '';
        if (Array.isArray(data.keywords)) {
            let htmlString = data.keywords.map(keyword => `<span style="color: #0D076A">${keyword}</span>`).join(', ');
            document.getElementById('ldaQAText').innerHTML = htmlString;
        } else {
            console.error('Expected an array of keywords, but received:', data.keywords);
        }
    }
});
 
// Chart update
 
(function ($) {
    var pin = localStorage.getItem('pin');

    $(document).ready(function() {
        // Initial values
        var readiness = 75;
        var dataLeft = 100 - readiness;

        // Function to display readiness values
        function displayReadiness(readiness) {
            $('#readiness_value').html(
                `<p>${readiness}% / 100%</p>`
            );
        }

        // Display initial readiness values
//        displayReadiness(readiness, dataLeft);

        // Listen for updates from the socket
        socket.on('update_gauge_chart', function(data) {
            if (data.pin == pin) {
                updateReadinessValues(data);
            }
        });

        // Function to update readiness values
        function updateReadinessValues(data) {
            var readiness = data.x;
            displayReadiness(readiness);
        }
    });

})(jQuery);
//Ask  Q/A Voice Recording Button
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
            console.error('Speech recognition not supported in this browser');
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
            const inputField = document.getElementById('question');
            inputField.value = transcript;
 
        };
 
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
        };
 
        recognition.onend = function() {
            recognition.stop();
            sendQuestion();
            recordButton.textContent = '';
            recordButton.classList.add('off'); // Add the "off" class
            if (outputDiv.textContent.trim() !== '') {
                sendTextToServer(outputDiv.textContent);
                // Send text to server only if not empty
            }
        };
 
        toggleRecordButtonVisibility(true); // Show the record button
        recognition.start();
    }
 
    function toggleRecordButtonVisibility(show) {
        recordButton.style.display = show ? 'block' : 'none';
    }
});