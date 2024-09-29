const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
app.use(cors());

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
        console.error('Failed to authenticate with Spotify API:', error);
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
        focus,
        social,
        musicPreference,
        weather,
        timeOfDay,
        emotionalBalance,
        moodKeyword
    } = req.query;

    console.log('Received request with parameters:', req.query);

    try {
        const playlistLink = await getSpotifyPlaylist(moodKeyword);
        res.json({ playlistLink });
    } catch (error) {
        console.error('Error fetching playlist:', error.message);
        res.status(500).json({ error: 'Failed to fetch playlist.' });
    }
});

// Determine mood keyword based on input values (if needed in the server)
function getMoodKeyword(energy, stress, intensity, emotionalSpectrum, weather, timeOfDay) {
    if (energy > 7 && stress < 3) {
        return 'happy';
    } else if (energy < 4 && stress > 7) {
        return 'calm';
    } else if (weather === 'high' && emotionalSpectrum > 7) {
        return 'excited';
    } else if (timeOfDay === 'evening' && emotionalBalance < 5) {
        return 'relaxed';
    } else {
        return 'neutral';
    }
}

// Fetch Spotify playlist based on mood
async function getSpotifyPlaylist(mood) {
    try {
        console.log('Fetching playlist for mood:', mood);
        const searchResponse = await spotifyApi.searchPlaylists(mood);
        const playlist = searchResponse.body.playlists.items[0];
        if (playlist) {
            console.log('Playlist found:', playlist.external_urls.spotify);
            return playlist.external_urls.spotify; // Return the Spotify playlist link
        } else {
            throw new Error('No playlist found');
        }
    } catch (error) {
        console.error('Error fetching playlist from Spotify:', error.message);
        throw new Error('Error fetching playlist from Spotify: ' + error.message);
    }
}

// Start server on port 5500
app.listen(5500, () => {
    console.log('Server is running on port 5500');
});

// Add this route to test if the backend can be reached
app.get('/test', (req, res) => {
    res.send('Backend is working!');
});
