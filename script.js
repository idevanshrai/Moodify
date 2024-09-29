// Get DOM elements
const intensitySlider = document.getElementById('intensity-slider');
const emotionalSpectrumSlider = document.getElementById('emotional-spectrum-slider');
const energySlider = document.getElementById('energy-slider');
const stressSlider = document.getElementById('stress-slider');
const focusSlider = document.getElementById('focus-slider');
const socialSlider = document.getElementById('social-slider');
const musicPreferenceSlider = document.getElementById('music-preference-slider');
const weatherDropdown = document.getElementById('weather-dropdown');
const timeDropdown = document.getElementById('time-dropdown');
const emotionalBalanceSlider = document.getElementById('emotional-balance-slider');
const submitBtn = document.getElementById('submit-btn');
const playlistResults = document.getElementById('playlist-results');

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        const fullName = prompt("Please enter your full name:");
        document.getElementById('display-name').textContent = fullName || "Guest";
    }, 4000);

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

// Mood-guessing logic for more accurate playlist selection
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

// Add event listener to the submit button
submitBtn.addEventListener('click', async () => {
    const intensity = intensitySlider.value;
    const emotionalSpectrum = emotionalSpectrumSlider.value;
    const energy = energySlider.value;
    const stress = stressSlider.value;
    const focus = focusSlider.value;
    const social = socialSlider.value;
    const musicPreference = musicPreferenceSlider.value;
    const weather = weatherDropdown.value;
    const timeOfDay = timeDropdown.value;
    const emotionalBalance = emotionalBalanceSlider.value;

    playlistResults.innerHTML = 'Fetching playlist...';

    const moodKeyword = getMoodKeyword(intensity, emotionalSpectrum, energy, stress, focus, social, musicPreference, emotionalBalance);

    try {
        // Update the fetch URL to your Vercel API endpoint
        const response = await fetch(`https://moodify-lake.vercel.app/api?` + new URLSearchParams({
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

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.playlistLink) {
            playlistResults.innerHTML = `<a href="${data.playlistLink}" target="_blank">Your Playlist</a>`;
        } else {
            playlistResults.innerHTML = 'No playlist found for the current mood.';
        }
    } catch (error) {
        console.error('Error:', error);
        playlistResults.innerHTML = 'Failed to fetch playlist. Please try again later.';
    }
});
