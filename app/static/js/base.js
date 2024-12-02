// Smooth scrolling for anchor links
$(document).ready(function () {
    $('a').on('click', function (e) {
        if (this.hash !== "") {
            e.preventDefault();

            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function () {
                window.location.hash = hash;
            });
        }
    });

    // Highlight active navbar link
    $(".navbar-nav .nav-link").on("click", function () {
        $(".navbar-nav .nav-link").removeClass("active");
        $(this).addClass("active");
    });

    // Enable tooltips
    $('[data-toggle="tooltip"]').tooltip();
});
