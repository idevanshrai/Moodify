// Wait for the DOM to load before executing the code
document.addEventListener('DOMContentLoaded', () => {
    // Log to check if the script is running
    console.log('Document loaded. Executing splash screen logic.');

    // Hide the splash screen and prompt for the user's name
    setTimeout(() => {
        console.log('Hiding splash screen...');
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
        } else {
            console.error('Splash screen element not found!');
        }

        const app = document.getElementById('app');
        if (app) {
            app.classList.remove('hidden');
        } else {
            console.error('App element not found!');
        }

        // Prompt for user's name
        const fullName = prompt("Please enter your full name:");
        console.log('User name input:', fullName);
        const displayNameElement = document.getElementById('display-name');
        if (displayNameElement) {
            displayNameElement.textContent = fullName || "Guest";
        } else {
            console.error('Display name element not found!');
        }
    }, 4000);

    // Update slider fill color dynamically
    const sliders = document.querySelectorAll('.styled-slider');
    sliders.forEach(slider => {
        updateSliderFill(slider);
        slider.addEventListener('input', () => updateSliderFill(slider));
    });

    function updateSliderFill(slider) {
        const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.setProperty('--value', `${value}%`);
    }
});

// Determine mood keyword based on input values
function getMoodKeyword(intensity, emotionalSpectrum, energy, stress, focus, social, musicPreference, emotionalBalance) {
    if (energy > 7 && intensity > 7 && emotionalSpectrum > 7) {
        return 'upbeat';
    } else if (stress > 7 || emotionalBalance < 3) {
        return 'calm';
    } else if (focus > 5 && energy < 4) {
        return 'relaxing';
    } else if (social > 5 && musicPreference > 5) {
        return 'party';
    } else {
        return 'chill';
    }
}

// Handle playlist fetching when the "Get Playlist" button is clicked
const submitBtn = document.getElementById('submit-btn');
const playlistResults = document.getElementById('playlist-results');

submitBtn.addEventListener('click', async () => {
    console.log('Get Playlist button clicked.');

    // Get values from sliders and dropdowns
    const intensity = document.getElementById('intensity-slider').value;
    const emotionalSpectrum = document.getElementById('emotional-spectrum-slider').value;
    const energy = document.getElementById('energy-slider').value;
    const stress = document.getElementById('stress-slider').value;
    const focus = document.getElementById('focus-slider').value;
    const social = document.getElementById('social-slider').value;
    const musicPreference = document.getElementById('music-preference-slider').value;
    const weather = document.getElementById('weather-dropdown').value;
    const timeOfDay = document.getElementById('time-dropdown').value;
    const emotionalBalance = document.getElementById('emotional-balance-slider').value;

    // Get mood keyword
    const moodKeyword = getMoodKeyword(intensity, emotionalSpectrum, energy, stress, focus, social, musicPreference, emotionalBalance);

    // Show loading message
    playlistResults.innerHTML = 'Fetching playlist...';

    console.log('Sending request to http://localhost:5500/playlist with the following parameters:');
    console.log({
        intensity,
        emotionalSpectrum,
        energy,
        stress,
        focus,
        social,
        musicPreference,
        weather,
        timeOfDay,
        emotionalBalance,
        moodKeyword
    });

    try {
        // Make a GET request to the backend with the user input as query parameters
        const response = await fetch('http://localhost:5500/playlist?' + new URLSearchParams({
            intensity,
            emotionalSpectrum,
            energy,
            stress,
            focus,
            social,
            musicPreference,
            weather,
            timeOfDay,
            emotionalBalance,
            moodKeyword
        }));

        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Received response:', data);

        // Display the playlist link or an error message
        if (data.playlistLink) {
            playlistResults.innerHTML = `<a href="${data.playlistLink}" target="_blank">Your Playlist</a>`;
        } else {
            playlistResults.innerHTML = 'No playlist found for the current mood.';
        }
    } catch (error) {
        console.error('Error:', error);
        playlistResults.innerHTML = 'Failed to fetch playlist. Please try again later.';
    }

    // Additional check: Test backend connectivity
    try {
        console.log('Testing backend connectivity...');
        const testResponse = await fetch('http://localhost:5500/test');
        if (testResponse.ok) {
            const testData = await testResponse.text();
            console.log('Test route response:', testData);
        } else {
            console.error('Test route failed with status:', testResponse.status);
        }
    } catch (testError) {
        console.error('Test route error:', testError);
    }
});
