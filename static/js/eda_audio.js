// Virtual Analyst Voice Record Button
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
            const inputField = document.getElementById('question_eda');
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