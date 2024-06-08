
// import { updateTable } from './popup.js';
// updateTable();
const socket_admin = io();
socket_admin.emit('requestAdminVaultData');
socket_admin.on('adminVaultData', function(data) {
    const adminVaultTableBody = document.getElementById('adminVaultTableBody');
    console.log(data);
    adminVaultTableBody.innerHTML = '';

    data.forEach(file => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="admin-vault-checkbox" data-filename="${file.name}" data-url="${file.url}"></td>
            <td>${file.name}</td>
            <td><a href="${file.url}" target="_blank">View</a></td>
        `;
        adminVaultTableBody.appendChild(row);
    });

    // const adminVaultModal = new bootstrap.Modal(document.getElementById('adminVaultModal'));
    // adminVaultModal.show();
});

document.getElementById('uploadToUserVault').addEventListener('click', function() {
    const selectedFiles = [];
    document.querySelectorAll('.admin-vault-checkbox:checked').forEach(checkbox => {
        selectedFiles.push({
            name: checkbox.getAttribute('data-filename'),
            url: checkbox.getAttribute('data-url')
        });
    });

    socket_admin.emit('upload_to_user_vault', { files: selectedFiles });
});

socket_admin.on('upload_to_user_vault_response', function(response) {
    if (response.success) {
        alert('Files uploaded successfully to your vault!');
        updateTable();
        // Optionally hide the modal
        // const adminVaultModal = new bootstrap.Modal(document.getElementById('adminVaultModal'));
        // adminVaultModal.hide();
    } else {
        alert('Failed to upload files: ' + response.message);
    }
});
