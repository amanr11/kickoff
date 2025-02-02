// scroll to Top button
document.addEventListener("DOMContentLoaded", function () {
    const scrollToTopBtn = document.createElement("button");
    scrollToTopBtn.innerHTML = "↑";
    scrollToTopBtn.classList.add("scroll-to-top-btn");
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener("scroll", function () {
        if (window.scrollY > 200) {
            scrollToTopBtn.classList.add("show");
        } else {
            scrollToTopBtn.classList.remove("show");
        }
    });

    scrollToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});


    document.getElementById("togglePassword").addEventListener("click", function() {
        const passwordField = document.getElementById("password");
        const eyeIcon = document.getElementById("eyeIcon");
        
        // Toggle the password field type between text and password
        if (passwordField.type === "password") {
            passwordField.type = "text";
            eyeIcon.classList.remove("fa-eye"); // Hide icon
            eyeIcon.classList.add("fa-eye-slash"); // Show icon
        } else {
            passwordField.type = "password";
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
        }
    });
