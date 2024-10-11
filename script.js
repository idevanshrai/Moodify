document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Document loaded. Executing splash screen logic.');

    
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

    // COlor fill slider
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

// Determine mood 
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

    
    const moodKeyword = getMoodKeyword(intensity, emotionalSpectrum, energy, stress, focus, social, musicPreference, emotionalBalance);

    //loading message
    playlistResults.innerHTML = 'Fetching playlist...';

    console.log('Sending request to https://moodify-g6k2.onrender.com with the following parameters:');
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
        // backend ko bolke data mangwa raha
        const response = await fetch('https://moodify-backend-oqd9.onrender.com/playlist?' + new URLSearchParams({
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
