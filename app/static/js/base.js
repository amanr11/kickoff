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
