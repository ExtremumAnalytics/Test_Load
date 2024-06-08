// Select Data Source Function
function selectDataSource(element, dataSourceName) {
    // Remove highlights from other data sources
    var elements = document.querySelectorAll('.bg-light');
    elements.forEach(function(el) {
        el.classList.remove('highlighted');
    });

    // Highlight the selected data source
    element.classList.add('highlighted');

    // Save the selected data source
    sessionStorage.setItem('selectedDataSource', dataSourceName);
}

// Loading the Selected Data Source
function linkSelectedDataSource() {
    var dataSource = sessionStorage.getItem('selectedDataSource'); // Get the selected data source from sessionStorage
    var doc_template = document.getElementById('fileForm');
    var mp3_template = document.getElementById('audio_file');
    var webCrawl_template = document.getElementById('Web_Crawling');
    var source_URL_template = document.getElementById('SourceURL');
    var database_template = document.getElementById('databaseForm');
    var defaultMsg = document.getElementById('defaultMsg');
    var close = document.getElementById('close');
    var load = document.getElementById('loadData');
    

    switch(dataSource) {
        case 'Documents':
            doc_template.style.display= 'block';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        case 'Audio File':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'block';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        case 'Web Crawling':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'block';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;
        
        case 'Source URL':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'block';
            database_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        case 'Database':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'block';
            defaultMsg.style.display= 'none';
            close.style.display = 'none';
            load.style.display= 'none';
            break;

        // Add more cases as necessary for different data sources
    }
}

// Function to handle URL submission
function submitUrl() {
    var url = document.getElementById('sourceUrl').value;
    console.log("URL submitted:", url);
    // Add your handling logic here
}

//Show Web Crawl File Manager 
function displayWebCrawFileManager() {
    // Example of fetching HTML content from a server
    fetch('/file_manager')
        .then(response => response.text())
        .then(htmlContent => {
            // Open a new popup window
            var popupWindow = window.open("{{url_for('data_source')}}", "_blank", "Title", 'newwin', 'toolbar=yes, menubar=yes, scrollbars=yes, resizable=yes, width=800, height=600');

            // Write the HTML content to the popup window
            popupWindow.document.open();
            popupWindow.document.write(htmlContent);
            popupWindow.document.close();
        })
        .catch(error => console.error('Failed to load HTML content:', error));
};

// Scroll Vault Function
function scrollToVault(){
    var vault = document.getElementById('vault_container');
    vault.scrollIntoView({behavior: 'smooth'});
}

// // Select All Button Function
// function toggleSelectAll(){
//     var checkboxes = document.querySelectorAll('#table-body input[type="checkbox"]');
//     var selectAllCheckbox = document.getElementById('selectAll');

//     checkboxes.forEach(function(checkbox){
//         checkbox.checked = selectAllCheckbox.checked;
//     });
// }

// // Data Base Connection Form
// document.getElementById('dbForm').onsubmit = async (event) => {
//     event.preventDefault();
//     const formData = new FormData(event.target);

//     // Initialize Socket.IO client
//     const socket = io();

//     socket.emit('run_query', Object.fromEntries(formData));

//     socket.on('query_success', (data) => {
//         document.getElementById('message').innerText = data.message || 'Query executed successfully.';
//         setTimeout(() => {
//             document.getElementById('message').innerText = '';
//         }, 8000); // Clear message after 8 seconds
//     });

//     socket.on('query_error', (data) => {
//         document.getElementById('message').innerText = JSON.stringify(data);
//         setTimeout(() => {
//             document.getElementById('message').innerText = '';
//         }, 8000); // Clear message after 8 seconds
//     });
// };