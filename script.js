document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded. Initializing Moodify...');

    // Constants
    const BACKEND_URL = 'https://moodify-backend-oqd9.onrender.com'; //Backend URL

    // Initialize user settings from localStorage
    const userSettings = {
        theme: localStorage.getItem('moodifyTheme') || 'default',
        animations: localStorage.getItem('moodifyAnimations') !== 'false',
        volume: parseInt(localStorage.getItem('moodifyVolume')) || 70
    };

    // Apply saved settings
    applySettings(userSettings);

    // Initialize slider values display
    const sliders = document.querySelectorAll('.styled-slider');
    sliders.forEach(slider => {
        // Set initial display value
        const valueElement = document.getElementById(`${slider.id}-value`);
        if (valueElement) {
            valueElement.textContent = slider.value;
        }
        
        // Update slider fill and value display
        updateSliderFill(slider);
        
        // Add event listener for input changes
        slider.addEventListener('input', () => {
            updateSliderFill(slider);
            const valueElement = document.getElementById(`${slider.id}-value`);
            if (valueElement) {
                valueElement.textContent = slider.value;
            }
        });
    });

    // Initialize volume control
    const volumeControl = document.getElementById('volume-control');
    if (volumeControl) {
        volumeControl.value = userSettings.volume;
        volumeControl.style.setProperty('--value', `${userSettings.volume}%`);
        const volumeValue = document.getElementById('volume-value');
        if (volumeValue) volumeValue.textContent = `${userSettings.volume}%`;
        
        volumeControl.addEventListener('input', () => {
            volumeControl.style.setProperty('--value', `${volumeControl.value}%`);
            const volumeValue = document.getElementById('volume-value');
            if (volumeValue) volumeValue.textContent = `${volumeControl.value}%`;
        });
    }

    // Hide splash screen and show app after delay
    setTimeout(() => {
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

        // Load user name or prompt for it
        loadUserName();
    }, 3500);

    // Modal functionality
    const settingsModal = document.getElementById('settings-modal');
    const helpModal = document.getElementById('help-modal');
    const settingsButton = document.getElementById('settings-button');
    const helpButton = document.getElementById('help-button');
    const closeButtons = document.querySelectorAll('.close-modal');
    const saveSettingsButton = document.getElementById('save-settings');

    // Open modals
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            openModal(settingsModal);
            // Set current values in settings modal
            document.getElementById('theme-select').value = userSettings.theme;
            document.getElementById('animation-toggle').checked = userSettings.animations;
            document.getElementById('volume-slider').value = userSettings.volume;
            document.getElementById('volume-value').textContent = `${userSettings.volume}%`;
        });
    }

    if (helpButton) {
        helpButton.addEventListener('click', () => openModal(helpModal));
    }

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(settingsModal);
            closeModal(helpModal);
        });
    });

    // Save settings
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', () => {
            const newSettings = {
                theme: document.getElementById('theme-select').value,
                animations: document.getElementById('animation-toggle').checked,
                volume: parseInt(document.getElementById('volume-slider').value)
            };
            
            // Save to localStorage
            localStorage.setItem('moodifyTheme', newSettings.theme);
            localStorage.setItem('moodifyAnimations', newSettings.animations);
            localStorage.setItem('moodifyVolume', newSettings.volume);
            
            // Apply new settings
            applySettings(newSettings);
            
            // Close modal
            closeModal(settingsModal);
            
            // Show confirmation
            showToast('Settings saved successfully!');
        });
    }

    // Volume slider in settings
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            document.getElementById('volume-value').textContent = `${volumeSlider.value}%`;
        });
    }

    // Spotify connect button
    const connectSpotify = document.getElementById('connect-spotify');
    if (connectSpotify) {
        connectSpotify.addEventListener('click', () => {
            showToast('Connecting to Spotify...');
            // In a real app, this would redirect to Spotify OAuth
            setTimeout(() => {
                showToast('Please implement Spotify OAuth integration');
            }, 1500);
        });
    }

    // Submit button for playlist generation
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', generatePlaylist);
    }

    // Function to update slider fill
    function updateSliderFill(slider) {
        const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.setProperty('--value', `${value}%`);
    }

    // Function to open modal
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Function to close modal
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Function to apply settings
    function applySettings(settings) {
        // Apply theme
        document.documentElement.setAttribute('data-theme', settings.theme);
        
        // Apply animations
        if (!settings.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
        
        // Apply volume
        const volumeControl = document.getElementById('volume-control');
        if (volumeControl) {
            volumeControl.value = settings.volume;
            volumeControl.style.setProperty('--value', `${settings.volume}%`);
        }
    }

    // Function to load or prompt for user name
    function loadUserName() {
        let userName = localStorage.getItem('moodifyUserName');
        if (!userName) {
            userName = prompt("Welcome to Moodify!\nPlease enter your name to personalize your experience:") || "Guest";
            localStorage.setItem('moodifyUserName', userName);
        }
        
        const displayNameElement = document.getElementById('display-name');
        if (displayNameElement) {
            displayNameElement.textContent = userName;
        }
    }

    // Function to show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Function to generate playlist
    async function generatePlaylist() {
        console.log('Generating playlist...');
        
        // Disable button during request
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        // Get all values
        const energy = document.getElementById('energy-slider').value;
        const happiness = document.getElementById('happiness-slider').value;
        const stress = document.getElementById('stress-slider').value;
        const focus = document.getElementById('focus-slider').value;
        const social = document.getElementById('social-slider').value;
        const musicPreference = document.getElementById('music-preference-slider').value;
        const weather = document.getElementById('weather-dropdown').value;
        const timeOfDay = document.getElementById('time-dropdown').value;
        const language = document.getElementById('language-dropdown').value;
        
        // Show loading state
        const playlistResults = document.getElementById('playlist-results');
        playlistResults.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Creating your perfect playlist...</p>
            </div>
        `;
        
        // Scroll to results
        playlistResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        try {
            // Call your Render backend
            const response = await fetch(`${BACKEND_URL}/playlist?${new URLSearchParams({
                energy,
                emotionalSpectrum: happiness,
                stress,
                focus,
                social,
                intensity: musicPreference,
                weather,
                timeOfDay,
                emotionalBalance: happiness, // Using happiness as emotional balance for this example
                language
            })}`);
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();
            console.log('Playlist data received:', data);
            
            // Display results
            displayPlaylistResults(data);
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message);
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-headphones"></i> Create My Playlist';
        }
    }

    // Function to display playlist results
    function displayPlaylistResults(playlistData) {
        const playlistResults = document.getElementById('playlist-results');
        
        if (playlistData.playlistLink) {
            playlistResults.innerHTML = `
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <h3>Your playlist is ready!</h3>
                    <p>We've created a playlist that matches your current mood.</p>
                    <a href="${playlistData.playlistLink}" target="_blank" class="spotify-button">
                        <i class="fab fa-spotify"></i> Open in Spotify
                    </a>
                </div>
            `;
        } else {
            playlistResults.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>No playlist found</h3>
                    <p>We couldn't find a playlist for your current mood. Please try different settings.</p>
                </div>
            `;
        }
    }

    // Function to show error message
    function showError(message) {
        const playlistResults = document.getElementById('playlist-results');
        playlistResults.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="retry-button">
                    <i class="fas fa-sync-alt"></i> Try Again
                </button>
            </div>
        `;
    }

    // Test backend connection on load
    testBackendConnection();
    
    async function testBackendConnection() {
        try {
            const response = await fetch(`${BACKEND_URL}/test`);
            if (response.ok) {
                console.log('Backend connection test successful');
            } else {
                console.warn('Backend connection test failed');
            }
        } catch (error) {
            console.error('Error testing backend connection:', error);
        }
    }
});