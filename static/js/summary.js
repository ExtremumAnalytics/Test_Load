const socket = io();
var pin = localStorage.getItem('pin');
// Generate Summary Button
document.addEventListener('DOMContentLoaded', function() {
    const fetchSummaryBtn = document.getElementById('fetchSummaryBtn');
    const summaryList = document.getElementById('summaryList');
    const slider = document.getElementById("mySlider");
    const valueBox = document.querySelector(".value-box");

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
        
        socket.emit('summary_input', { summary_que: summary_que, value: slider.value });
    });

    socket.on('summary_response', function(data) {
        console.log(data); // Add this line to check the structure of the data
        displaySummaries(data);
        $("#waitImg").hide(); // Hide the loading image on success
        $('#message').text(data.message);
        setTimeout(function() {
            $('#message').text('');
        }, 8000); // Clear message after 8 seconds
    });

    socket.on('progress', function(data) {
        if(data.pin==pin){
            updateProgressBar(data.percentage);
        } 
    });
    
    function displaySummaries(summaries) {
        var summary = document.getElementById('summaryContainer');
        summary.innerHTML = ''; // Assuming summaryContainer is the container element

        // Check if summaries is an array
        if (Array.isArray(summaries)) {
            const list = document.createElement('ul'); // Create an unordered list element

            summaries.forEach(summary => {
                const listItem = document.createElement('li'); // Create a list item element
                
                listItem.innerHTML = `<b>${summary.key}</b>: ${summary.value.replace(/- /g, "<br>- ")}`;
                list.appendChild(listItem); // Append the list item to the list
            });

            summary.appendChild(list); // Append the list to the container
            updateImage();
        } else {
            // Handle the case where summaries is not an array (e.g., log an error)
            console.error('Invalid data format. Expected an array.');
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
}

// Handle the response from the server
socket.on('clear_chat_response', function(data) {
    $('#message').text(data.message); 
    setTimeout(function() {
        $('#message').text('');
    }, 8000); // Clear message after 8 seconds

    // Clear the chat history container
    var historyContainer = document.getElementById("summaryContainer");
    historyContainer.innerHTML = "";
});


socket.on('lda_topics_summ', function(data) {
    if (data.pin === pin) {
        console.log('Received LDA keywords:', data); // Debug

        // let htmlString = '';
        if (Array.isArray(data.keywords)) {
            let htmlString = data.keywords.map(keyword => `<span style="color: #0D076A">${keyword}</span>`).join(', ');
            document.getElementById('ldaSummText').innerHTML = htmlString;
        } else {
            console.error('Expected an array of keywords, but received:', data.keywords);
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
          console.log(data.message); // Log success message
      } else if (data.error) {
          console.error(data.error); // Log error message
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
            console.error('Speech recognition not supported in this browser');
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

var pin = localStorage.getItem('pin');

// Updating Wordcloud Image FUnction
function updateImage() {
    var image = document.getElementById('wordcloud-image');
    var timestamp = new Date().getTime(); // Generate timestamp to ensure the image is not cached
    //image.src = "../static/images/wordcloud.png?t=" + timestamp;
    image.src = "../static/login/"+ pin +"/wordcloud.png?t=" + timestamp;
}

// Call updateImage function every 5 seconds
setInterval(updateImage, 5000);

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

(function ($) {

    //Overall Readiness Chart
    $(document).ready(function() {
        const socket = io();
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
                    cutout: 95,
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
                console.log(data);
            }
        });

        // Function to update readiness chart
        function updateReadinessChart(data) {
            myChart2.data.datasets[0].data = [
                data.x,
                100 - data.x
            ];
            myChart2.update(); // Refresh the chart
        }
    });

    // Summary Page Sentiment Bar Chart
    $(document).ready(function() {
        const socket = io();

        var ctx3 = $("#sentiment_chart").get(0).getContext("2d");
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

        socket.on('analyze_sentiment_summ', function(data) {
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
