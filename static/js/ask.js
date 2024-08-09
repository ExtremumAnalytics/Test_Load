const socket=io();
var pin = localStorage.getItem('pin');
socket.emit('table_update');

/// Toggle Switch
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');

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

// Files Dropdown
document.addEventListener('DOMContentLoaded', function() {
    socket.emit('get_files_dropdown_data');

    socket.on('files_dropdown_data', function(data) {
        if (data.error) {
            alert(data.error);
            return;
        }

        const filesDropdown = document.getElementById('selectFiles');
        // Populate files dropdown
        data.files.forEach(file => {
            const option = document.createElement('option');
            option.value = file; 
            option.text = file;  
            filesDropdown.add(option);
        });
    });
});

// Progress Bar update
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('waitImg');
    progressBar.style.width = percentage + '%';
    percent=percentage + '%';
    progressBar.setAttribute('width', percent);
    progressBar.innerText = percentage + '% ';
}

document.getElementById('selectFiles').addEventListener('change', function() {
    const selectSource = document.getElementById('selectSource');
    if (this.value !== 'default') {
        selectSource.value = 'myFiles';
    } else {
        selectSource.value = 'default';
    }
});

function sendQuestion() {
    var question = document.getElementById("question").value.trim(); // Trim the question
    var source = document.getElementById("selectSource").value;
    var selected_file = document.getElementById('selectFiles').value;
    // console.log(selected_file);    

    if (selected_file === 'default') {
        selected_file = false
    }
    if (source === 'default') {
        alert('Please select a source!');
        return;
    }

    if (question === "") {
        alert("Ask Question!");
        return;
    }
    document.getElementById("waitImg").style.display = 'block'; // Show the loading image

    socket.emit('ask_question', { question: question, source: source, file_name: selected_file });

    socket.on('progress', function(data) {
        if (data.pin === pin) {
            updateProgressBar(data.percentage);
        }
    });

    socket.on('response', function(response) {
        updateProgressBar(100);
        setTimeout(() => {
            document.getElementById("waitImg").style.display = 'none';
        }, 1500);

        var historyContainer = document.getElementById("questionAnswer");
        historyContainer.innerHTML = "<ul id='chatHistoryList'></ul>";

        var historyList = document.getElementById("chatHistoryList");
        var chatHistory = response.chat_history;

        var latestItem = chatHistory.reduce((maxItem, currentItem) =>
            currentItem.index > maxItem.index ? currentItem : maxItem, chatHistory[0]);

        chatHistory.forEach(function(item) {
            var listItem = document.createElement('li');
            var question = "<b>" + "Question: " + "</b>" + item.question;
            var sourceLink = "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong> Source </strong></a>";
            var preElement = document.createElement('pre');
            preElement.classList.add('formatted-pre');
            preElement.style.whiteSpace = 'pre-wrap';
            preElement.style.overflowX = 'hidden';
            preElement.style.overflowY = 'auto';
            preElement.style.fontFamily = 'Times New Roman';
            preElement.style.fontSize ='16px';
            listItem.appendChild(preElement);
            historyList.appendChild(listItem);

            if (item.index === latestItem.index) {
                preElement.innerHTML = question + "\n" + "<b>" + "Answer: \n" + "</b>";

                var words = item.answer.split(' ');
                var word_index = 0;
                var typingComplete = false; // Track when typing is complete

                var intervalId = setInterval(() => {
                    if (word_index < words.length) {
                        var wordSpan = document.createElement('span');
                        wordSpan.innerText = words[word_index] + ' ';
                        preElement.appendChild(wordSpan);
                        word_index++;
                    } else {
                        clearInterval(intervalId);
                        typingComplete = true; // Mark typing as complete
                        var sourceElement = document.createElement('div');
                        sourceElement.innerHTML = sourceLink + "\n\n";
                        preElement.appendChild(sourceElement);
                        sourceElement.querySelector('.source-link').addEventListener('click', function () {
                            openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
                        });

                        // Show the follow-up question only after typing is complete
                        if (response.follow_up !== 'N/A') {
                            showFollowUpQuestion(response.follow_up);
                        }
                    }

                    // Hide the follow-up question during typing
                    if (!typingComplete && response.follow_up !== 'N/A') {
                        document.getElementById("followUp").style.display = 'none';
                    }
                }, 50);
                document.getElementById('askSentiments').style.display = 'block';
                document.getElementById('askTopics').style.display = 'block';
                document.getElementById('sideImage').style.display = 'none';
            } else {
                preElement.innerHTML = question + "\n" + "<b>" + "Answer: \n" + "</b>" + item.answer + "<br>" + sourceLink + "\n\n";
            }
        });

        document.querySelectorAll('.source-link').forEach(function(link) {
            link.addEventListener('click', function() {
                openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
            });
        });

        document.getElementById("question").value = ""; // Clear the question input
    });
}

function showFollowUpQuestion(followUpText) {
    var follow_up_question = document.getElementById("followUp");
    follow_up_question.innerHTML = ""; // Clear previous follow-up question
    follow_up_question.style.display = 'block';

    var followup_list = document.createElement('p');
    follow_up_question.appendChild(followup_list);
    followup_list.innerHTML = "<button class='btn btn-primary m-4' id='followUpButton'>" + followUpText + "</button><br>";

    document.getElementById('followUpButton').addEventListener('click', function() {
        var strippedString = followUpText.replace("Do you also want to know", "").replace("Do you also want to know about", "");
        document.getElementById("question").value = strippedString.trim();
        sendQuestion(); // Call sendQuestion again with the follow-up question
    });
}

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
        // console.log(url);
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
            document.getElementById("question").value = "";
            document.getElementById("selectSource").value = "default";
            document.getElementById("selectFiles").value = "default";
            historyContainer.innerHTML = "";
            followup_list.innerHTML = "";
            document.getElementById('sideImage').style.display = 'block';
            document.getElementById('askSentiments').style.display = 'none';
            document.getElementById('askTopics').style.display = 'none';
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

    // Overall Readiness Chart
    $(document).ready(function() {
        const ctx2 = $("#readiness_chart").get(0).getContext("2d");
        const myChart2 = new Chart(ctx2,{
            type: "pie",
            data: {
                labels: ['Total Readiness', 'Data Left'],
                datasets: [{
                    backgroundColor: [
                        "rgba(0, 156, 255, 0.7)",
                        "rgba(156, 0, 255, 0.7)",
                        "rgba(0, 0, 255, 0.7)",
                        "rgba(0, 0, 255, 0.1)",
                    ],
                    borderWidth: 1,
                    circumference: 180,
                    rotation : 270,
                    aspectRatio : 2,
                    borderRadius:8,
                    cutout: 80,
                    data: [100,0]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    datalabels: {
                        color: '#ffffff',
                        display: true,
                        align: 'center',
                        anchor: 'center'
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        socket.on('update_gauge_chart', function(data) {
            // updateReadinessChart(data);
            if(data.pin==pin){
                updateReadinessChart(data);
            }
        });

        // Function to update readiness chart
        function updateReadinessChart(data) {
            // console.log(data);
            var left = 100 - data.x;
            myChart2.data.datasets[0].data = [
                Math.round(data.x),
                Math.round(left)
            ];
            myChart2.update(); // Refresh the chart
        }
    });

    // Ask Q/A Sentiment Chart
    $(document).ready(function() {

        var ctx3 = $("#ask_qa_senti_chart").get(0).getContext("2d");
        var myChart3 = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: ["Positive", "Negative", "Neutral"],
                datasets: [{
                    backgroundColor: [
                        "rgba(0, 156, 255, 0.7)",
                        "rgba(0, 156, 255, 0.5)",
                        "rgba(0, 156, 255, 0.3)"
                    ],
                    data: [0, 0, 0]  // Start with empty data, which will be updated dynamically
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: {
                        ticks: {
                            beginAtZero: true,
                            callback: function(value) {
                                return value + "%"; // Appends a '%' sign after each value on the x-axis
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    datalabels: {
                        color: '#000',
                        formatter: (value, ctx3) => {
                            let sum = 0;
                            let dataArr = ctx3.chart.data.datasets[0].data;
                            dataArr.map(data => {
                                sum += data;
                            });
                            let percentage = (value*100 / sum).toFixed(2)+"%";
                            return percentage;
                        },
                        display: true,
                        align: 'right',
                        anchor: 'center'
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        socket.on('analyze_sentiment_q_a', function(data) {
            // updateSummaryBarChart(data);
            if(data.pin==pin){
                updateSummaryBarChart(data);
            }
        });

        // Function to update sentiment chart
        function updateSummaryBarChart(data) {
            myChart3.data.datasets[0].data = data.values;
            myChart3.data.labels = data.labels;
            myChart3.update(); // Refresh the chart
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