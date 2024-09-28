// Get DOM elements
const energySlider = document.getElementById('energy-slider');
const stressSlider = document.getElementById('stress-slider');
const submitBtn = document.getElementById('submit-btn');
const playlistResults = document.getElementById('playlist-results');

// Add event listener to the submit button
submitBtn.addEventListener('click', () => {
    const energy = energySlider.value;
    const stress = stressSlider.value;

    // Display loading message while waiting for the response
    playlistResults.innerHTML = 'Fetching playlist...';

    // Make a GET request to the backend to get the playlist
    fetch(`http://localhost:5500/playlist?energy=${energy}&stress=${stress}`)
        .then(response => response.json())
        .then(data => {
            if (data.playlistLink) {
                playlistResults.innerHTML = `<a href="${data.playlistLink}" target="_blank">Your Playlist</a>`;
            } else {
                playlistResults.innerHTML = 'No playlist found for the current mood.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            playlistResults.innerHTML = 'Failed to fetch playlist. Please try again later.';
        });
});
