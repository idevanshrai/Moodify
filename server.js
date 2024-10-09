const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();

// Enable CORS to allow requests from your frontend
app.use(cors({
    origin: '*', // Replace '*' with your frontend URL for enhanced security
}));

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Function to authenticate with Spotify API
const authenticateSpotify = async () => {
    try {
        console.log('Attempting to authenticate with Spotify API...');
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log('Successfully authenticated with Spotify API');
    } catch (error) {
        console.error('Failed to authenticate with Spotify API:', error.message);
    }
};

// Initial authentication
authenticateSpotify();

// Middleware to refresh Spotify API token if expired
app.use(async (req, res, next) => {
    if (!spotifyApi.getAccessToken()) {
        console.log('Access token expired. Refreshing...');
        await authenticateSpotify();
    }
    next();
});

// Main playlist route
app.get('/playlist', async (req, res) => {
    const {
        intensity,
        emotionalSpectrum,
        energy,
        stress,
        weather,
        timeOfDay,
        emotionalBalance
    } = req.query;

    console.log('Received request with parameters:', req.query);

    try {
        const moodKeyword = getMoodKeyword(
            parseInt(energy),
            parseInt(stress),
            parseInt(intensity),
            parseInt(emotionalSpectrum),
            weather,
            timeOfDay,
            parseInt(emotionalBalance)
        );

        console.log('Determined mood keyword:', moodKeyword);

        const playlistLink = await getSpotifyPlaylist(moodKeyword, timeOfDay);
        res.json({ playlistLink });
    } catch (error) {
        console.error('Error fetching playlist:', error.message);
        res.status(500).json({ error: 'Failed to fetch playlist.' });
    }
});

// Algorithm to determine mood keyword
function getMoodKeyword(energy, stress, intensity, emotionalSpectrum, weather, timeOfDay, emotionalBalance) {
    // Ensure numerical inputs
    energy = energy || 0;
    stress = stress || 0;
    intensity = intensity || 0;
    emotionalSpectrum = emotionalSpectrum || 0;
    emotionalBalance = emotionalBalance || 0;

    // Morning adjustments
    if (timeOfDay === 'morning' && energy > 7 && stress < 5) {
        return 'motivated';
    }
    
    // Afternoon adjustments
    if (timeOfDay === 'afternoon' && energy > 5 && stress < 4) {
        return 'uplifting';
    }
    
    // Evening adjustments
    if (timeOfDay === 'evening') {
        if (energy < 4 || stress > 6) {
            return 'relaxed';
        } else if (energy > 6 && emotionalSpectrum > 7) {
            return 'excited';
        }
    }
    
    // General conditions
    if (energy > 7 && stress < 3 && emotionalSpectrum > 6) {
        return 'happy';
    } else if (energy < 4 && stress > 7 && intensity < 4) {
        return 'calm';
    } else if (weather === 'high' && emotionalSpectrum > 7) {
        return 'energetic';
    } else if (emotionalSpectrum < 4 && intensity > 5) {
        return 'moody';
    } else {
        return 'neutral';
    }
}

// Fetching Spotify playlist based on mood and time of day
async function getSpotifyPlaylist(mood, timeOfDay) {
    try {
        const query = `${mood} ${timeOfDay}`;
        console.log('Fetching playlist for mood:', query);

        const searchResponse = await spotifyApi.searchPlaylists(query);
        console.log('Spotify search response:', searchResponse.body);

        const playlist = searchResponse.body.playlists.items[0];
        if (playlist) {
            console.log('Playlist found:', playlist.external_urls.spotify);
            return playlist.external_urls.spotify;
        } else {
            throw new Error('No playlist found');
        }
    } catch (error) {
        console.error('Error fetching playlist from Spotify:', error.message);
        throw new Error('Error fetching playlist from Spotify: ' + error.message);
    }
}

// Start server on the specified port
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Route to test if the backend can be reached
app.get('/test', (req, res) => {
    res.send('Backend is working!');
});
