document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.querySelector('.search-bar button');
    const moreInfoSection = document.querySelector('.more-info #destination-info');
    const topDestinationsGrid = document.querySelector('#top-destinations-grid');
    const searchInput = document.querySelector('.search-bar input');
    const commentsList = document.querySelector('#comments-list');
    const commentInput = document.querySelector('#comment-input');
    const addCommentButton = document.querySelector('#add-comment-button');

    const modal = document.getElementById("modal");
    const modalContent = document.querySelector(".modal-content");
    const modalClose = document.querySelector(".close");

    const modalDestinationName = document.getElementById("modal-destination-name");
    const modalDestinationLocation = document.getElementById("modal-destination-location");
    const modalDestinationDescription = document.getElementById("modal-destination-description");
    const modalDestinationImage = document.getElementById("modal-destination-image");

    const videoContainer = document.getElementById('video-container');

    let currentDestinationId = null;
    let editCommentId = null;

    let destinations = [];

    fetch("http://localhost:3000/destination")
        .then((resp) => resp.json())
        .then((data) => {
            destinations = data;
            displayTopDestinations();
            
        });

    function displayTopDestinations() {
        const topDestinations = destinations.slice(0, 6); 
        topDestinationsGrid.innerHTML = topDestinations.map(destination => `
            <div>
                <img src="${destination.image}" alt="${destination.name}" data-id="${destination.id}">
                <span>${destination.name}</span>
            </div>
        `).join('');

        attachGridEventListeners(); displayTopVideos();
    }

   

    function attachGridEventListeners() {
        document.querySelectorAll('#top-destinations-grid div').forEach(div => {
            div.addEventListener('click', () => {
                const destinationId = div.querySelector('img').getAttribute('data-id');
                const destination = destinations.find(dest => dest.id == destinationId);
                if (destination) {
                    displayDestinationModal(destination);
                    displayComments(destination);
                    currentDestinationId = destinationId;
                }
            });
        });
    }

    function displayDestinationModal(destination) {
        modalDestinationName.innerText = destination.name;
        modalDestinationLocation.innerText = `Location: ${destination.location}`;
        modalDestinationDescription.innerText = destination.description;
        modalDestinationImage.src = destination.image;

        modal.style.display = "block";
    }

    modalClose.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    function displayDestinationInfo(destination) {
        moreInfoSection.innerHTML = `
            <div class="info-container">
                <img src="${destination.image}" alt="${destination.name}" class="info-image">
                <div class="info-text">
                    <p><strong>Name:</strong> ${destination.name}</p>
                    <p><strong>Location:</strong> ${destination.location}</p>
                    <p><strong>Description:</strong> ${destination.description}</p>
                </div>
            </div>
        `;
    }
    

    function displayComments(destination) {
        commentsList.innerHTML = (destination.comments || []).map(comment => `
            <div data-id="${comment.id}">
                <p>${comment.text}</p>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `).join('');

        attachCommentEventListeners(destination);
    }

    function attachCommentEventListeners(destination) {
        commentsList.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const commentDiv = button.parentElement;
                const commentId = commentDiv.getAttribute('data-id');
                const comment = destination.comments.find(comment => comment.id == commentId);
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
                destination.comments = destination.comments.filter(comment => comment.id != commentId);
                updateDestination(destination);
                displayComments(destination);
            });
        });
    }


    addCommentButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        const commentText = commentInput.value.trim();
        if (commentText && currentDestinationId) {
            const destination = destinations.find(dest => dest.id == currentDestinationId);
            if (editCommentId) {
                const comment = destination.comments.find(comment => comment.id == editCommentId);
                if (comment) {
                    comment.text = commentText;
                }
                editCommentId = null;
            } else {
                const newComment = {
                    id: Date.now().toString(),
                    text: commentText
                };
                if (!destination.comments) {
                    destination.comments = [];
                }
                destination.comments.push(newComment);
            }
            updateDestination(destination);
            displayComments(destination);
            commentInput.value = '';
        }
    });

    function updateDestination(destination) {
        fetch(`http://localhost:3000/destination/${destination.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comments: destination.comments })
        })
        .then(response => response.json())
        .then(updatedDestination => {
            const index = destinations.findIndex(dest => dest.id == updatedDestination.id);
            destinations[index] = updatedDestination;
        });
    }

    // Search Filter Functionality
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filteredDestination = destinations.find(dest =>
            dest.id.toLowerCase() === searchTerm ||
            dest.name.toLowerCase() === searchTerm
        );
        
        if (filteredDestination) {
            displayDestinationInfo(filteredDestination);
            displayComments(filteredDestination);
            currentDestinationId = filteredDestination.id;
        } else {
            moreInfoSection.innerHTML = '<p>Destination not found!</p>';
        }
    }

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    searchButton.addEventListener('click', () => {
        performSearch();
    });


    displayTopDestinations(); // Display top 5 destinations initially
});





