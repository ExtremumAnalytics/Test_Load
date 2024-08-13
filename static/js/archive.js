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
