const socket = io();
var pin = localStorage.getItem('pin');
socket.emit('table_update');

// Close the select menu
function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

// Generate Summary Button
document.addEventListener('DOMContentLoaded', function() {
    const fetchSummaryBtn = document.getElementById('fetchSummaryBtn');
    const slider = document.getElementById("mySlider");
    const valueBox = document.querySelector(".value-box");
    const displayedSummaries = new Set(); // To keep track of displayed summaries
    let errorMessages = [];

    function updateProgressBar(percentage) {
        $("#waitImg").css("width", percentage + "%");
        $("#waitImg").attr("aria-valuenow", percentage);
        $("#waitImg").text(percentage + "%");
    }

    // Update the value box when the slider changes
    slider.addEventListener("input", () => {
        valueBox.textContent = slider.value;
    });

    fetchSummaryBtn.addEventListener('click', function() {
        $("#waitImg").show(); // Show the loading image
        updateProgressBar(0);
        const summary_que = document.getElementById('summary_que').value; // Get the value of the input field
        
        // Clear previous summaries and errors
        clearOldData();

        socket.emit('summary_input', { summary_que: summary_que, value: slider.value });
    });

    socket.on('summary_response', function(data) {
        // Check if data contains errors
        if (data.errors) {
            errorMessages = data.errors;
            // console.log(errorMessages);
        } else if (Array.isArray(data) && data.length > 0) {
            // console.log(data);
            displaySummaries(data);
        }

        if (data.message) {
            $('#message').text(data.message);
            setTimeout(function() {
                $('#message').text('');
            }, 5000); // Clear message after 5 seconds
        }
        updateImage();

        // Display errors at the bottom
        if (errorMessages.length > 0) {
            const errorContainer = document.getElementById('modalBody');
            while (errorContainer.firstChild) {
                errorContainer.removeChild(errorContainer.firstChild);
            }
            displayErrors(errorMessages);
            errorMessages = []; // Clear error messages after displaying
        }
    });

    socket.on('progress', function(data) {
        if(data.pin == pin){
            updateProgressBar(data.percentage);
        }
        if(data.percentage == 100){
            $("#waitImg").hide(); // Hide the loading image on success
            updateImage();
            socket.emit('table_update');
        }
    });

    function clearOldData() {
        const summaryContainer = document.getElementById('summaryContainer');
        summaryContainer.innerHTML = ''; // Clear the summary container
        displayedSummaries.clear(); // Clear the set of displayed summaries
    }

    function displaySummaries(summaries) {
        const summaryContainer = document.getElementById('summaryContainer');

        // Create or select the existing unordered list element
        let list = summaryContainer.querySelector('ul');
        if (!list) {
            list = document.createElement('ul');
            summaryContainer.appendChild(list);
        }

        summaries.forEach(summary => {
            // Check if the summary has already been displayed
            const summaryKey = `${summary.key}:${summary.value}`;
            if (!displayedSummaries.has(summaryKey)) {
                const listItem = document.createElement('li'); // Create a list item element
                list.appendChild(listItem); // Append the list item to the list

                const words = `<b>${summary.key}</b>: ${summary.value.replace(/- /g, "<br>- ")}`.split(' ');
                let wordIndex = 0;

                function typeWord() {
                    if (wordIndex < words.length) {
                        listItem.innerHTML += words[wordIndex] + ' ';
                        wordIndex++;
                        setTimeout(typeWord, 50); // Adjust the delay as needed (50ms in this case)
                    } else {
                        listItem.innerHTML += '<p></p>'; // Add the paragraph break after the summary
                    }
                }
                typeWord(); // Start the typing effect
                displayedSummaries.add(summaryKey); // Add to the set of displayed summaries
                document.getElementById('summarySentiments').style.display = 'block';
                document.getElementById('summaryWordCloud').style.display = 'block';
                document.getElementById('summaryTopics').style.display = 'block';
            }
        });
    }

    function displayErrors(errors) {
        const error = document.getElementById('modalBody');
        if (Array.isArray(errors) && errors.length > 0) {

            const list = document.createElement('ul'); // Create an unordered list element

            errors.forEach(error => {
                const listItem = document.createElement('li'); // Create a list item element
                listItem.innerHTML = `${error}`;
                list.appendChild(listItem); // Append the list item to the list
            });

            error.appendChild(list); // Append the list to the container
            document.getElementById('myModal').style.display='block';

        } else {
            console.error('Invalid error data format. Expected an array.');
        }
    }
});

// Updating Wordcloud Image FUnction
function updateImage() {
    var image = document.getElementById('wordcloud-image');
    var timestamp = new Date().getTime(); // Generate timestamp to ensure the image is not cached
    image.src = "../static/login/"+ pin +"/wordcloud.png?t=" + timestamp;
}

// Function to clear the chat summary using Socket.IO
function clear_summ_Chat() {
    // Emit event to the server to clear chat history
    socket.emit('clear_chat_summ', {});
    socket.emit('table_update');
    document.getElementById('summary_que').value = "";
}

// Handle the response from the server
socket.on('clear_chat_response', function(data) {
    $('#message').text(data.message); 
    setTimeout(function() {
        $('#message').text('');
    }, 8000); // Clear message after 8 seconds
    updateImage();

    // Clear the chat history container
    var historyContainer = document.getElementById("summaryContainer");
    historyContainer.innerHTML = "";
});


socket.on('lda_topics_summ', function(data) {
    if (data.pin === pin) {
        // console.log('Received LDA keywords:', data); // Debug

        // let htmlString = '';
        if (Array.isArray(data.keywords)) {
            let htmlString = data.keywords.map(keyword => `<span style="color: #0D076A">${keyword}</span>`).join(', ');
            document.getElementById('ldaSummText').innerHTML = htmlString;
        } else {
            // console.error('Expected an array of keywords, but received:', data.keywords);
        }
    }
});


// Summary Page Word Count Slider
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById("mySlider");
    const valueBox = document.querySelector(".value-box");
    const socket = io();

    // Update the value box when the slider changes
    slider.addEventListener("input", () => {
        valueBox.textContent = slider.value;
    });

    // Send a Socket.IO event to the server when the slider changes
    slider.addEventListener("change", () => {
        socket.emit('Cogservice_Value_Updated', { value: slider.value });
    });

    // Handle the response from the server
    socket.on('cogservice_response', (data) => {
        if (data.message) {
            //   console.log(data.message); // Log success message
        } else if (data.error) {
            //   console.error(data.error); // Log error message
        }
    });
});

//Summary Page Voice Recording Button
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
            toggleRecordButtonVisibility(true); // Hide the record button
            return;
        }

        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
            const transcript = event.results[event.results.length - 1][0].transcript;
            const inputField = document.getElementById('summary_que');
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

var pin = localStorage.getItem('pin');

// Updating Wordcloud Image FUnction
function updateImage() {
    var image = document.getElementById('wordcloud-image');
    var timestamp = new Date().getTime(); // Generate timestamp to ensure the image is not cached
    //image.src = "../static/images/wordcloud.png?t=" + timestamp;
    image.src = "../static/login/"+ pin +"/wordcloud.png?t=" + timestamp;
}


// Loading Updated wordcloud image
document.addEventListener('DOMContentLoaded', function() {
    var image = document.getElementById('wordcloud-link');

    image.addEventListener('click', function() {
        var fullImageOverlay = document.createElement('div');
        fullImageOverlay.id = 'full-image-overlay';

        var fullImage = document.createElement('img');
        //fullImage.src = "../static/images/wordcloud.png?t=" + new Date().getTime(); // Append timestamp to ensure image refresh
        fullImage.src = "../static/login/"+ pin +"/wordcloud.png?t=" + new Date().getTime(); // Append timestamp to ensure image refresh
        fullImage.id = 'full-image';

        var closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-btn';
        closeBtn.addEventListener('click', function() {
            fullImageOverlay.remove();
        });

        fullImageOverlay.appendChild(fullImage);
        fullImageOverlay.appendChild(closeBtn);

        document.body.appendChild(fullImageOverlay);
    });
});