// // document.addEventListener("DOMContentLoaded", function() {
// //     fetchLists();
// // });

// // function fetchLists() {
// //     fetch('/progress_files')
// //         .then(response => response.json())
// //         .then(data => updateTable(data, 'progress'))
// //         .catch(error => console.error('Error:', error));

// //     fetch('/failed_files')
// //         .then(response => response.json())
// //         .then(data => updateTable(data, 'failed'))
// //         .catch(error => console.error('Error:', error));

// //     fetch('/embedding_not_created')
// //         .then(response => response.json())
// //         .then(data => updateTable(data, 'embedding'))
// //         .catch(error => console.error('Error:', error));
// // }

// // function updateTable(fileList, type) {
// //     const tableBody = document.getElementById('table-body');
// //     let rows = tableBody.rows;
// //     if (rows.length === 0) {
// //         for (let i = 0; i < fileList.length; i++) {
// //             let row = tableBody.insertRow(i);
// //             row.insertCell(0).innerHTML = (type === 'progress') ? fileList[i] : '';
// //             row.insertCell(1).innerHTML = (type === 'failed') ? fileList[i] : '';
// //             row.insertCell(2).innerHTML = (type === 'embedding') ? fileList[i] : '';
// //         }
// //     } 
// //     else {
// //         for (let i = 0; i < fileList.length; i++) {
// //             if (rows[i]) {
// //                 if (type === 'progress') rows[i].cells[0].innerHTML = fileList[i];
// //                 if (type === 'failed') rows[i].cells[1].innerHTML = fileList[i];
// //                 if (type === 'embedding') rows[i].cells[2].innerHTML = fileList[i];
// //             } else {
// //                 let row = tableBody.insertRow(i);
// //                 row.insertCell(0).innerHTML = (type === 'progress') ? fileList[i] : '';
// //                 row.insertCell(1).innerHTML = (type === 'failed') ? fileList[i] : '';
// //                 row.insertCell(2).innerHTML = (type === 'embedding') ? fileList[i] : '';
// //             }
// //         }
// //     }
// // }

// var socket = io(); // Assuming Socket.IO is initialized correctly
// document.addEventListener("DOMContentLoaded", function() {
//     fetchLists();
// });

// // setInterval(fetchLists, 1000);
// function fetchLists() {
//     socket.emit('embedding_not_created');
//     socket.emit('failed_files');
//     socket.emit('progress_files');

//     socket.on('pending', function(data){
//         console.log('Pending',data);
//     });

//     socket.on('failed', function(data){
//         console.log('Failed',data);
//     });

//     socket.on('success', function(data){
//         console.log('Success',data);
//     });
//     // fetch('/progress_files')
//     //     .then(response => response.json())
//     //     .then(data => 
//     //         console.log(data)
//     //         updateTable(data, 'progress')
//     //     )
//     //     .catch(error => console.error('Error:', error));

//     // fetch('/failed_files')
//     //     .then(response => response.json())
//     //     .then(data => updateTable(data, 'failed'))
//     //     .catch(error => console.error('Error:', error));

//     // fetch('/embedding_not_created')
//     //     .then(response => response.json())
//     //     .then(data => updateTable(data, 'embedding'))
//     //     .catch(error => console.error('Error:', error));
// }

// function updateProgressTable(fileList, type) {
//     const tableBody = document.getElementById('table-body');

//     if (!fileList || !Array.isArray(fileList)) {
//         console.error('Invalid fileList:', fileList);
//         return;
//     }

//     let rows = tableBody.rows;

//     for (let i = 0; i < fileList.length; i++) {
//         if (rows[i]) {
//             if (type === 'progress') rows[i].cells[0].innerHTML = fileList[i];
//             if (type === 'failed') rows[i].cells[1].innerHTML = fileList[i];
//             if (type === 'embedding') rows[i].cells[2].innerHTML = fileList[i];
//         } else {
//             let row = tableBody.insertRow(i);
//             row.insertCell(0).innerHTML = (type === 'progress') ? fileList[i] : '';
//             row.insertCell(1).innerHTML = (type === 'failed') ? fileList[i] : '';
//             row.insertCell(2).innerHTML = (type === 'embedding') ? fileList[i] : '';
//         }
//     }
// }

