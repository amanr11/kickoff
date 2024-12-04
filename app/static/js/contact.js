document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Basic validation
    if (!name || !email || !message) {
        alert('Please fill out all fields.');
        return;
    }

    const formData = new FormData(this); // Collect form data

    const url = this.getAttribute('data-contact-url'); // Get the URL from the data attribute

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Your message has been sent!');
            document.getElementById("contactForm").reset();
        } else {
            alert(`There was an error: ${data.error}`);
        }
    })
    .catch(error => {
        alert('There was a problem with the form submission.');
        console.error('Error:', error);
    });
});
