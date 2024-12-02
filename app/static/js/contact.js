$(document).ready(function () {
    // Form validation
    $("#contactForm").on("submit", function (e) {
        e.preventDefault();
        let isValid = true;

        $(this).find("input, textarea").each(function () {
            if ($(this).val().trim() === "") {
                isValid = false;
                $(this).addClass("is-invalid");
            } else {
                $(this).removeClass("is-invalid").addClass("is-valid");
            }
        });

        if (isValid) {
            alert("Form submitted successfully!");
            this.reset();
        }
    });

    // Smooth scroll to FAQ section
    $(".faq-link").on("click", function (e) {
        e.preventDefault();
        const target = $($(this).attr("href"));
        $("html, body").animate({ scrollTop: target.offset().top }, 800);
    });
});
