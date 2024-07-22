const socket=io();
var pin = localStorage.getItem('pin');
socket.emit('table_update');

// Progress Bar update
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('waitImg');
    progressBar.style.width = percentage + '%';
    percent=percentage + '%';
    progressBar.setAttribute('width', percent);
    progressBar.innerText = percentage + '% ';
}

function sendQuestion() {
    var question = document.getElementById("question").value.trim(); // Trim the question
    var source = document.getElementById("selectSource").value;

    if (source === 'default') {
        alert('Please select a source!');
        return;
    }

    if (question === "") {
        alert("Ask Question!");
        return;
    }
    document.getElementById("waitImg").style.display = 'block'; // Show the loading image

    socket.emit('ask_question', { question: question, source: source });

    socket.on('progress', function(data) {
        if (data.pin === pin) {
            updateProgressBar(data.percentage);
            // console.log(data.percentage);
        }
    });

    socket.on('response', function(response) {
        updateProgressBar(100);
        // console.log('100');
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
            var question = "<b>" + "Question: " + "</b>" + item.question;
            var answer = "<b>" + "Answer: \n" + "</b>" + item.answer; //.replace(/- /g, "\n- ");
            var sourceLink = "<a href='javascript:void(0)' class='source-link' data-source='" + item.source + "' data-page='" + item.page_number + "'><strong> Source </strong></a>";

            var content = question + "\n" + answer + "\n" + sourceLink + "\n\n";

            var preElement = document.createElement('pre');
            preElement.innerHTML = content;
            preElement.classList.add('formatted-pre');
            // Set the CSS properties to handle overflow
            preElement.style.whiteSpace = 'pre-wrap'; // Allows text to wrap
            preElement.style.overflowX = 'hidden';    // Hides horizontal overflow
            preElement.style.overflowY = 'auto';      // Allows vertical overflow (optional)
            listItem.appendChild(preElement);
            historyList.appendChild(listItem);

        });

        // Attach event listeners to source links
        document.querySelectorAll('.source-link').forEach(function(link) {
            link.addEventListener('click', function() {
                openPopup(this.getAttribute('data-source').split(','), this.getAttribute('data-page').split(','));
            });
        });

        // Follow-up question
        var follow_up_question = document.getElementById("followUp");
        follow_up_question.innerHTML = ""; // Clear previous follow-up question
        if(response.follow_up === 'N/A'){
           follow_up_question.style.display='none';
        } else{
            var followup_list = document.createElement('p');
            follow_up_question.style.display='block';
            follow_up_question.appendChild(followup_list);
            followup_list.innerHTML = "<button class='btn btn-primary m-4' id='followUpButton'>" + response.follow_up + "</button><br>";

            // Attach event listener to follow-up button
            document.getElementById('followUpButton').addEventListener('click', function() {
                // Ensure response.follow_up is defined and replace the specified string
                if (response && response.follow_up) {
                    var strippedString = response.follow_up.replace("Do you also want to know", "").replace("Do you also want to know about", "");
                    document.getElementById("question").value = strippedString.trim();
                    sendQuestion(); // Call sendQuestion again with the follow-up question
                } else {
                    // console.error("response.follow_up is not defined");
                }
            });
        }
        document.getElementById("question").value = ""; // Clear the question input
    });
}

function openFileInNewTab(url) {
    try {
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
                    data: [75,25]
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
                data.x,
                left.toFixed(2)
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