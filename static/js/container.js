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

function linkSelectedDataSource() {
    var dataSource = sessionStorage.getItem('selectedDataSource'); // Get the selected data source from sessionStorage
    var contentArea = document.getElementById('lds'); // Get the target container
    // contentArea.innerHTML = ''; // Clear any existing content
    var doc_template = document.getElementById('fileForm');
    var mp3_template = document.getElementById('audio_file');
    var webCrawl_template = document.getElementById('Web_Crawling');
    var source_URL_template = document.getElementById('SourceURL');
    var database_template = document.getElementById('databaseForm');
    var defaultMsg = document.getElementById('defaultMsg');
    

    switch(dataSource) {
        case 'Documents':
            doc_template.style.display= 'block';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            break;

        case 'Audio File':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'block';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            break;

        case 'Web Crawling':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'block';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            break;
        
        case 'Source URL':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'block';
            database_template.style.display= 'none';
            defaultMsg.style.display= 'none';
            break;

        case 'Database':
            doc_template.style.display= 'none';
            mp3_template.style.display= 'none';
            webCrawl_template.style.display= 'none';
            source_URL_template.style.display= 'none';
            database_template.style.display= 'block';
            defaultMsg.style.display= 'none';
            break;

        // Add more cases as necessary for different data sources
    }
}


// function linkDataSource() {
//     var dataSource = sessionStorage.getItem('selectedDataSource');
//     var ldsContainer = document.querySelector('.lds');

//     // Clear the current content
//     ldsContainer.innerHTML = '';

//     // Update the UI based on the data source
//     switch(dataSource) {
//         // case 'Documents':
//         //     ldsContainer.innerHTML = `
//         //         <div class="doc-container p-2">
//         //             <label class="mb-2" style="color:#000000;" for="docFile">Please Upload Files: (Eg. Docs, Excel, PDF, etc.)</label>
//         //             <input type="file" id="fileInput" name="myFile" class="form-control mb-2" accept=".pdf, .txt, .xls, .xlsx, .docx, .csv" multiple>
                    
//         //             <!-- Button Group -->
//         //             <div class="row mt-4">
//         //                 <div class="col-lg-12 d-flex justify-content-center">
//         //                     <div class="button-group">
//         //                         <button type="button" class="btn btn-primary mr-2" onclick="submitForm()" style="font-size: 14px;">Submit</button>
//         //                         <button type="button" class="btn btn-secondary mr-2" onclick="closeLds()" style="font-size: 14px;">Close</button>
//         //                     </div>
//         //                 </div>
//         //             </div>
//         //         </div>
//         //         <script src="{{ url_for('static', filename='js/popup.js') }}"></script>

//         //     `;
//         //     break;

//         case 'Audio File':
//             ldsContainer.innerHTML = `
//                 <div class="mp3-container p-2">
//                     <label class="mb-2" style="color:#000000;" for="mp3File">Please Upload Audio Files:</label>
//                     <input type="file" id="mp3Input" name="file" class="form-control mb-2" accept=".mp3" multiple>
                    
//                     <!-- Button Group -->
//                     <div class="row mt-4">
//                         <div class="col-lg-12 d-flex justify-content-center">
//                             <div class="button-group">
//                                 <button type="button" class="btn btn-primary mr-2" onclick="submitForm()" style="font-size: 14px;">Submit</button>
//                                 <button type="button" class="btn btn-secondary mr-2" onclick="closeLds()" style="font-size: 14px;">Close</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <script src="{{ url_for('static', filename='js/popup.js') }}"></script>
//             `;
//             break;

//         case 'Web Crawling':
//             ldsContainer.innerHTML = `
                // <div class="webCrawlContainer">
                //         <!-- First Container (Input URL) -->
                //         <div class="d-flex flex-row justify-content-center align-content-center">
                //             <div class="col-lg-6 input-container d-flex flex-column justify-content-center align-content-center rounded border p-2 m-2">
                //                 <label for="webCrawlingInput" class="m-1" style="font-size: 14px;">Web Crawling URL Connection:</label>
                //                 <input type="text" id="webCrawlingInput" class="form-control" placeholder="Web Crawling URL" style="font-size: 14px;">
                //             </div>
                //             <!-- Second Container (Progress) -->
                //             <div class="col-lg-8 progress-container rounded border p-2 m-2">
                //                 <div class="d-flex flex-column">
                //                     <label for="status" style="font-size: 14px;">Current Status:</label>
                //                     <label for="totalFiles" style="font-size: 14px;">Total Files:</label>
                //                     <label for="filesDownloaded" style="font-size: 14px;">Files Downloaded:</label>
                //                     <label for="progressPercentage" style="font-size: 14px;">Progress Percentage:</label>
                //                     <label for="currentFileName" style="font-size: 14px;">Current File Name:</label>
                //                 </div>
                //             </div>
                //         </div>
                    
                //     <!-- Button Group -->
                //     <div class="row mt-4">
                //         <div class="col-lg-12 d-flex justify-content-center">
                //             <div class="button-group">
                //                 <button type="button" id="fileManagerBtn" class="btn btn-primary mr-2" onclick="pdfPopupopen()" style="font-size: 14px;">File Manager</button>
                //                 <button type="button" class="btn btn-primary mr-2" onclick="submitForm()" style="font-size: 14px;">Submit</button>
                //                 <button type="button" class="btn btn-secondary mr-2" onclick="closeLds()" style="font-size: 14px;">Close</button>
                //             </div>
                //         </div>
                //     </div>

                //     <div id="popupweb" class="pop_box" style="display: none;">
                //         <div class="m-box">
                //             <img src="static/img/ea_logo.png" alt="logo" style="width:48px; heigth:48px;">
                //             <h5>| Loaded Data |</h5>
                //             <div class="form-l" style="text-align: center;">
                //                 <div id="messagedelopload"></div>
                //             </div>
                //             <div class="table-responsive">
                //                 <table class="table table-bordered">
                //                     <thead class="thead-light">
                //                         <tr>
                //                             <th><input type="checkbox" onclick="toggleAllCheckboxes()"> Select All</th>
                //                             <th>File Name</th>
                //                             <th>Size</th>
                //                             <th>Last Modified</th>
                //                         </tr>
                //                     </thead>
                //                     <tbody>
                //                         <!-- PDF file details will be displayed here -->
                //                         <tr>
                //                             <td><input type="checkbox" onclick="toggleAllCheckboxes()"> Select All</td>
                //                             <td>File Name 1</td>
                //                             <td>100 KB</td>
                //                             <td>2024-05-05</td>
                //                         </tr>
                //                         <tr>
                //                             <td><input type="checkbox" onclick="toggleAllCheckboxes()"> Select All</td>
                //                             <td>File Name 2</td>
                //                             <td>150 KB</td>
                //                             <td>2024-05-06</td>
                //                         </tr>
                //                         <!-- Add more rows dynamically as needed -->
                //                     </tbody>
                //                 </table>
                //             </div>
                //             <div class="col-lg-12 d-flex justify-content-center">
                //                 <div class="button-group">
                //                     <button type="button" id="uploadBtn" onclick="uploadSelectedFiles()" class="btn btn-primary mr-2" style="font-size: 14px;">Upload File</button>
                //                     <button type="button" id="deleteBtn" onclick="deletefilelocal()" class="btn btn-primary mr-2" style="font-size: 14px;">Delete File</button>
                //                     <button type="button" id="closeBtn" onclick="pdfclosePopup()" class="btn btn-secondary mr-2" style="font-size: 14px;">Close</button>
                //                 </div>
                //             </div>
                //         </div>
                //     </div>
//             `;

//             break;

//         case 'Source URL':
//             ldsContainer.innerHTML = `
                // <div class="source-url-container p-2">
                //     <label class="mb-2" style="color:#000000;" for="sourceUrl">Source URL Connection:</label>
                //     <input type="text" name="Source_URL" id="sourceUrl" class="form-control mb-2" placeholder="Enter URL">
                    
                //     <!-- Button Group -->
                //     <div class="row mt-4">
                //         <div class="col-lg-12 d-flex justify-content-center">
                //             <div class="button-group">
                //                 <button type="button" class="btn btn-primary mr-2" onclick="submitForm()" style="font-size: 14px;">Submit</button>
                //                 <button type="button" class="btn btn-secondary mr-2" onclick="closeLds()" style="font-size: 14px;">Close</button>
                //             </div>
                //         </div>
                //     </div>
                // </div>
//                 <script src="{{ url_for('static', filename='js/popup.js') }}"></script>
//             `;
//             break;
        
//         case 'Database':
//             ldsContainer.innerHTML = `
                // <div class="database-container p-2">
                //     <label class="mb-2" style="color:#000000;" for="database">Database Connection:</label>
                //     <input type="text" name="dbURL" id="dbURL" class="form-control mb-2" placeholder="Database URL">
                //     <input type="text" name="username" id="username" class="form-control mb-2" placeholder="Enter Username">
                //     <input type="password" name="password" id="password" class="form-control mb-2" placeholder="Enter Password">
                    
                //     <!-- Button Group -->
                //     <div class="row mt-4">
                //         <div class="col-lg-12 d-flex justify-content-center">
                //             <div class="button-group">
                //                 <button type="button" class="btn btn-primary mr-2" onclick="submitForm()" style="font-size: 14px;">Submit</button>
                //                 <button type="button" class="btn btn-secondary mr-2" onclick="closeLds()" style="font-size: 14px;">Close</button>
                //             </div>
                //         </div>
                //     </div>
                // </div>
//                 <script src="{{ url_for('static', filename='js/popup.js') }}"></script>
//             `;
//             break;
        
//         case 'Scanner Queue':
//             ldsContainer.innerHTML = '<p>Scanner Queue UI Loaded.</p>';
//             break;
            
//         case 'Email Server':
//             ldsContainer.innerHTML = '<p>Email Server UI Loaded.</p>';
//             break;
        
//         case 'Share Point':
//             ldsContainer.innerHTML = '<p>Share Point UI Loaded.</p>';
//             break;

//         default:
//             ldsContainer.innerHTML = '<p>Please Select a Data Source.</p>';
//     }
// }

// Function to handle URL submission
function submitUrl() {
    var url = document.getElementById('sourceUrl').value;
    console.log("URL submitted:", url);
    // Add your handling logic here
}

// Function to close the lds container UI
function closeLds() {
    var ldsContainer = document.querySelector('.lds');
    ldsContainer.innerHTML = `
        <div>
            <p style="color:#000000;">Linking Successful.
            Please Load the Cogni Link!
            </p>
        </div>
    `;
}

// // Add an event listener to the document
// document.addEventListener('click', function(event) {
//     // Check if the clicked element is not a data source item
//     if (!event.target.closest('.bg-light')) {
//         // Clear the selected data source
//         sessionStorage.removeItem('selectedDataSource');
//         // Remove highlight from all data source items
//         var elements = document.querySelectorAll('.bg-light');
//         elements.forEach(function(el) {
//             el.classList.remove('highlighted');
//         });
//         // Disable the link button
//         // var linkButton = document.getElementById('linkButton');
//         // linkButton.disabled = false;
//     }
// });

// // Function to toggle visibility of the popup container
// function pdfPopupopen() {
//     var popup = document.getElementById("popupweb");
//     if (popup.style.display === "none" || popup.style.display === "") {
//         popup.style.display = "block";
//     } 
//     else {
//         popup.style.display = "none";
//     }
// }


// Function to open the popup window
// function pdfPopupopen() {
//     // Define the dimensions and position of the popup window
//     var width = 600;
//     var height = 400;
//     var left = (window.innerWidth - width) / 2;
//     var top = (window.innerHeight - height) / 2;

//     // Open the popup window
//     var popupWindow = window.open("", "_blank", "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top);

//     // Write the HTML content to the popup window
//     popupWindow.document.write(webCraw_file_manager.html);

//     // Close the document to ensure it's fully loaded
//     popupWindow.document.close();
// }


// // Event listener for the File Manager button
// document.getElementById("fileManagerBtn").addEventListener("click", function() {
//     pdfPopupopen();
// });

// Function to load HTML content and display in a popup
// document.getElementById("fileManagerBtn").addEventListener("click", 
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


function scrollToVault(){
    var vault = document.getElementById('vault_container');
    vault.scrollIntoView({behavior: 'smooth'});
}

function toggleSelectAll(){
    var checkboxes = document.querySelectorAll('#table-body input[type="checkbox"]');
    var selectAllCheckbox = document.getElementById('selectAll');

    checkboxes.forEach(function(checkbox){
        checkbox.checked = selectAllCheckbox.checked;
    });
}