$(document).ready(function () {
    // Profile picture preview
    $("#profilePicInput").on("change", function () {
        const [file] = this.files;
        if (file) {
            $("#profilePicPreview").attr("src", URL.createObjectURL(file));
        }
    });

    // Profile update logic
    $("#editProfileForm").on("submit", function (e) {
        e.preventDefault();
        alert("Profile updated successfully!");
        // Add AJAX or form submission logic here
    });
});
