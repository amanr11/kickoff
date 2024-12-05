function showDeleteConfirmation() {
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();

    // handle the confirmation button click
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function () {
        document.getElementById('deleteAccountForm').submit();
    };
}