$(document).ready(function () {
    // Toggle details for game cards
    $(".game-card").on("click", function () {
        $(this).find(".game-details").slideToggle();
    });

    // Example: Pagination or filtering logic
    $("#gameFilter").on("input", function () {
        const query = $(this).val().toLowerCase();
        $(".game-card").each(function () {
            const title = $(this).find(".game-title").text().toLowerCase();
            $(this).toggle(title.includes(query));
        });
    });
});
