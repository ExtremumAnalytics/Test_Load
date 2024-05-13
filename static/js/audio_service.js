// only one time sen to server
// const recordButton = document.getElementById('recordButton');
// let isRecording = false;
// let recorder;
// let audioChunks = [];

// recordButton.addEventListener('click', toggleRecording);

// async function toggleRecording() {
//     if (!isRecording) {
//         isRecording = true;
//         recordButton.textContent = 'Stop Recording';
//         recordButton.id = 'recording';

//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         recorder = new MediaRecorder(stream);

//         recorder.ondataavailable = e => {
//             audioChunks.push(e.data);
//         };

//         recorder.onstop = () => {
//             const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
//             const formData = new FormData();
//             formData.append('audio', audioBlob);

//             const xhr = new XMLHttpRequest();
//             xhr.open('POST', '/audio', true); // Bina URL specify kiye
//             xhr.onload = function() {
//                 if (xhr.status === 200) {
//                     console.log('Audio data sent successfully.');
//                 } else {
//                     console.error('Error occurred while sending audio data.');
//                 }
//             };
//             xhr.onerror = function() {
//                 console.error('Error occurred while sending audio data.');
//             };
//             xhr.send(formData);

//             audioChunks = [];
//             isRecording = false;
//             recordButton.textContent = 'Record';
//             recordButton.id = 'recordButton';
//         };

//         recorder.start();
//     } else {
//         recorder.stop();
//     }
// }

// this is working but button color not add

// document.addEventListener('DOMContentLoaded', function() {
//     let recognition;
//     const outputDiv = document.getElementById('message');
//     const recordButton = document.getElementById('recordButton');

//     let timeoutId;

//     recordButton.addEventListener('click', () => {
//         if (!recognition || !recognition.running) {
//             // Start recording
//             startRecording();
//             recordButton.textContent = 'Stop Recording';
//         } else {
//             // Stop recording
//             recognition.stop();
//             recordButton.textContent = 'Start Recording';
//         }
//     });

//     function startRecording() {
//         let SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
//         if (!SpeechRecognition) {
//             console.error('Speech recognition not supported in this browser');
//             return;
//         }

//         recognition = new SpeechRecognition();
//         recognition.lang = 'en-US';
//         recognition.interimResults = true;
//         recognition.maxAlternatives = 1;

//         recognition.onresult = function(event) {
//             const transcript = event.results[event.results.length - 1][0].transcript;
//             outputDiv.textContent = transcript;
//             clearTimeout(timeoutId); // Clear any existing timeout
//             timeoutId = setTimeout(() => {
//                 outputDiv.textContent = ""; // Clear output after 5 seconds
//             }, 5000);
//         };

//         recognition.onerror = function(event) {
//             console.error('Speech recognition error:', event.error);
//         };

//         recognition.onend = function() {
//             recognition.stop();
//             recordButton.textContent = 'Start Recording';
//             if (outputDiv.textContent.trim() !== '') {
//                 sendTextToServer(outputDiv.textContent); // Send text to server only if not empty
//             }
//         };

//         recognition.start();
//     }

//     function sendTextToServer(text) {
//         fetch('/upload', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ text: text })
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Text sent to server:', text);
//         })
//         .catch(error => {
//             console.error('Error sending text to server:', error);
//         });
//     }
// });


// working but browser support system not add


// document.addEventListener('DOMContentLoaded', function() {
//     let recognition;
//     const outputDiv = document.getElementById('message');
//     const recordButton = document.getElementById('recordButton');

//     let timeoutId;

//     recordButton.addEventListener('click', () => {
//         if (!recognition || !recognition.running) {
//             // Start recording
//             startRecording();
//             recordButton.textContent = 'Stop Recording';
//             recordButton.classList.remove('off'); // Remove the "off" class
//         } else {
//             // Stop recording
//             recognition.stop();
//             recordButton.textContent = 'Start Recording';
//             recordButton.classList.add('off'); // Add the "off" class
//         }
//     });

//     function startRecording() {
//         let SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
//         if (!SpeechRecognition) {
//             console.error('Speech recognition not supported in this browser');
//             outputDiv.textContent = 'Speech recognition not supported in this browser';
//             clearTimeout(timeoutId); // Clear any existing timeout
//             timeoutId = setTimeout(() => {
//                 outputDiv.textContent = ""; // Clear output after 5 seconds
//             }, 8000);
//             return;
//         }

//         recognition = new SpeechRecognition();
//         recognition.lang = 'en-US';
//         recognition.interimResults = true;
//         recognition.maxAlternatives = 1;

//         recognition.onresult = function(event) {
//             const transcript = event.results[event.results.length - 1][0].transcript;
//             outputDiv.textContent = transcript;
//             clearTimeout(timeoutId); // Clear any existing timeout
//             timeoutId = setTimeout(() => {
//                 outputDiv.textContent = ""; // Clear output after 5 seconds
//             }, 5000);
//         };

//         recognition.onerror = function(event) {
//             console.error('Speech recognition error:', event.error);
//         };

//         recognition.onend = function() {
//             recognition.stop();
//             recordButton.textContent = 'Start Recording';
//             recordButton.classList.add('off'); // Add the "off" class
//             if (outputDiv.textContent.trim() !== '') {
//                 sendTextToServer(outputDiv.textContent); // Send text to server only if not empty
//             }
//         };

//         recognition.start();
//     }

//     function sendTextToServer(text) {
//         fetch('/upload', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ text: text })
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log('Text sent to server:', text);
//         })
//         .catch(error => {
//             console.error('Error sending text to server:', error);
//         });
//     }
// });

// all functions working but not accurate


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

    // function sendTextToServer(text) {
    //     fetch('/upload', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ text: text })
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         console.log('Text sent to server:', text);
    //     })
    //     .catch(error => {
    //         console.error('Error sending text to server:', error);
    //     });
    // }

    function toggleRecordButtonVisibility(show) {
        recordButton.style.display = show ? 'block' : 'none';
    }
});