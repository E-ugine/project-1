document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.querySelector('.search-bar button');
    const moreInfoSection = document.querySelector('.more-info #destination-info');
    const topDestinationsGrid = document.querySelector('#top-destinations-grid'); 
    const searchInput = document.querySelector('.search-bar input');
    const commentsList = document.querySelector('#comments-list');
    const commentInput = document.querySelector('#comment-input');
    const addCommentButton = document.querySelector('#add-comment-button');
    let currentDestinationId = null;
    let editCommentId = null;

    let destinations = [];
    let comments = JSON.parse(localStorage.getItem('comments')) || [];

    fetch('http://localhost:3000/destination')
        .then((res) => res.json())
        .then((data) => {
            destinations = data;
            displayTopDestinations();
        });

    function displayTopDestinations() {
        topDestinationsGrid.innerHTML = destinations.map(destination => `
            <div>
                <img src="${destination.image}" alt="${destination.name}" data-id="${destination.id}">
                <span>${destination.name}</span>
            </div>
        `).join('');

        document.querySelectorAll('.top-destinations .grid div').forEach(div => {
            div.addEventListener('click', () => {
                const destinationId = div.querySelector('img').getAttribute('data-id');
                const destination = destinations.find(dest => dest.id == destinationId);
                if (destination) {
                    displayDestinationInfo(destination);
                    displayComments(destinationId);
                    currentDestinationId = destinationId;
                }
            });
        });
    }

    searchButton.addEventListener('click', () => {
        const searchValue = searchInput.value.trim();
        if (searchValue) {
            const destination = destinations.find(destination => destination.id == searchValue || destination.name.toLowerCase() === searchValue.toLowerCase());
            if (destination) {
                displayDestinationInfo(destination);
                displayComments(destination.id);
                currentDestinationId = destination.id;
            } else {
                moreInfoSection.innerHTML = '<p>Destination not found!</p>';
            }
        }
    });

    function displayDestinationInfo(destination) {
        moreInfoSection.innerHTML = `
            <h2>More Information</h2>
            <p><strong>Name:</strong> ${destination.name}</p>
            <p><strong>Location:</strong> ${destination.location}</p>
            <p><strong>Description:</strong> ${destination.description}</p>`;
    }

    function displayComments(destinationId) {
        const destinationComments = comments.filter(comment => comment.destinationId == destinationId);
        commentsList.innerHTML = destinationComments.map(comment => `
            <div data-id="${comment.id}">
                <p>${comment.text}</p>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `).join('');

        commentsList.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const commentDiv = button.parentElement;
                const commentId = commentDiv.getAttribute('data-id');
                const comment = comments.find(comment => comment.id == commentId);
                if (comment) {
                    commentInput.value = comment.text;
                    editCommentId = comment.id;
                }
            });
        });

        commentsList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const commentDiv = button.parentElement;
                const commentId = commentDiv.getAttribute('data-id');
                comments = comments.filter(comment => comment.id != commentId);
                localStorage.setItem('comments', JSON.stringify(comments));
                displayComments(currentDestinationId);
            });
        });
    }

    addCommentButton.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        if (commentText && currentDestinationId) {
            if (editCommentId) {
                const comment = comments.find(comment => comment.id == editCommentId);
                if (comment) {
                    comment.text = commentText;
                }
                editCommentId = null;
            } else {
                const newComment = {
                    id: Date.now().toString(),
                    destinationId: currentDestinationId,
                    text: commentText
                };
                comments.push(newComment);
            }
            localStorage.setItem('comments', JSON.stringify(comments));
            displayComments(currentDestinationId);
            commentInput.value = '';
        }
    });
});
