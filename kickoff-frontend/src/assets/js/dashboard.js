$(document).ready(function () {
    // toggle game card details
    $(".game-card").on("click", function () {
        $(this).find(".game-details").slideToggle();
    });

    // apply filters when the "Apply Filters" button is clicked
    $("#applyFilters").on("click", function () {
        const gameSearch = $("#gameSearch").val().trim().toLowerCase();
        const skillFilter = $("#skillFilter").val();

        // filter through games dynamically
        $(".col-md-4").each(function () {
            const location = $(this).find(".card-title").text().toLowerCase();
            const skill = $(this).data("skill");

            // match location and skill level filters
            const matchesSearch = gameSearch === "" || location.includes(gameSearch);
            const matchesSkill = skillFilter === "" || skill === skillFilter;

            // show or hide cards based on matching filters
            if (matchesSearch && matchesSkill) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // search dynamically as the user types
    $("#gameSearch").on("input", function () {
        $("#applyFilters").click(); // reapply filters
    });
});

function showCancelConfirmation(gameId) {
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    document.getElementById('confirmationMessage').textContent = 'Are you sure you want to cancel this game?';
    
    // set up the confirm button action
    const confirmButton = document.getElementById('confirmActionButton');
    confirmButton.onclick = function () {
        document.getElementById(`cancelForm-${gameId}`).submit();
    };

    modal.show();
}

function showBackOutConfirmation(gameId) {
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    document.getElementById('confirmationMessage').textContent = 'Are you sure you want to back out of this game?';

    // set up the confirm button action
    const confirmButton = document.getElementById('confirmActionButton');
    confirmButton.onclick = function () {
        document.getElementById(`backOutForm-${gameId}`).submit();
    };

    modal.show();
}

