document.addEventListener("DOMContentLoaded", () => {
    const commentsList = document.querySelector(".comments-list");
    const commentInput = document.getElementById('comment-input');
    const addCommentButton = document.getElementById('add-comment-button');
    const searchBarInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const moreInfoSection = document.querySelector('.More-info');
    const destinationSelect = document.getElementById('destination-select');
    let destinations = [];
    let comments = [];

    // Fetching destinations
    fetch("http://localhost:3000/destination")
        .then((resp) => resp.json())
        .then((data) => {
            destinations = data;
            populateDestinationSelect();
        });

    // Fetching comments
    fetch("http://localhost:3000/comments")
        .then((resp) => resp.json())
        .then((data) => {
            comments = data;
            displayComments();
        });

    // Populate destination select dropdown
    function populateDestinationSelect() {
        destinations.forEach(destination => {
            const option = document.createElement('option');
            option.value = destination.id;
            option.textContent = destination.name;
            destinationSelect.appendChild(option);
        });
    }

  

    // Handle adding comments
    addCommentButton.addEventListener('click', () => {
        const commentText = commentInput.value;
        const destinationId = destinationSelect.value;

        if (commentText && destinationId) {
            const newComment = {
                id: String(comments.length + 1),
                text: commentText,
                destinationId: destinationId
            };

            comments.push(newComment);
            displayComments();

            // Clear the input fields
            commentInput.value = '';
            destinationSelect.value = '';

            // Trigger comment added event
            commentAddedEvent(commentText);
        } else {
            alert('Please select a destination and enter a comment.');
        }
    });

    // Function to handle the event after a comment is added
    function commentAddedEvent(commentText) {
        console.log("New comment added: " + commentText);
        alert(`New comment added: ${commentText}`);
    }

    // Handle searching for destinations
    searchButton.addEventListener('click', () => {
        const searchValue = searchBarInput.value.trim().toLowerCase();

        if (searchValue) {
            const destination = destinations.find(dest => dest.id === searchValue || dest.name.toLowerCase() === searchValue);

            if (destination) {
                displayDestinationInfo(destination);
            } else {
                moreInfoSection.innerHTML = '<p>Destination not found</p>';
            }
        }
    });

    // Display destination info
    function displayDestinationInfo(destination) {
        moreInfoSection.innerHTML = `
            <h2>More Information</h2>
            <p><strong>Name:</strong> ${destination.name}</p>
            <p><strong>Location:</strong> ${destination.location}</p>
            <p><strong>Description:</strong> ${destination.description}</p>
        `;
    }
});
