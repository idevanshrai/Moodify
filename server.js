const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();

// CORS SEttings
app.use(cors({
    origin: '*',  // Frontend Vercel
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
        console.error('Failed to authenticate with Spotify API:', error);
    }
};

// Initial authentication with Spotify
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
        emotionalBalance,
        language  // Added language parameter
    } = req.query;

    console.log('Received request with parameters:', req.query); // Log received query parameters

    try {
        const moodKeyword = getMoodKeyword(energy, stress, intensity, emotionalSpectrum, weather, timeOfDay, emotionalBalance);
        console.log('Mood keyword generated:', moodKeyword); // Log the mood keyword
        
        const playlistLink = await getSpotifyPlaylist(moodKeyword, timeOfDay, language); // Pass the language to the playlist fetching function
        console.log('Playlist link fetched:', playlistLink); // Log the fetched playlist link
        
        res.json({ playlistLink });
    } catch (error) {
        console.error('Error fetching playlist:', error.message);
        res.status(500).json({ error: 'Failed to fetch playlist.' });
    }
});

// Algorithm to determine the mood keyword 
function getMoodKeyword(energy, stress, intensity, emotionalSpectrum, weather, timeOfDay, emotionalBalance) {
    console.log('Mood algorithm inputs:', { energy, stress, intensity, emotionalSpectrum, weather, timeOfDay, emotionalBalance });

    // Morning moods
    if (timeOfDay === 'morning') {
        if (energy > 8 && stress < 4 && intensity > 7) {
            return 'productive';
        } else if (energy > 6 && emotionalSpectrum > 7 && stress < 5) {
            return 'motivated';
        } else if (energy < 4 && stress > 7 && intensity < 4) {
            return 'calm';
        } else if (emotionalSpectrum < 4 && stress > 7) {
            return 'moody';
        }
    }

    // Afternoon moods
    if (timeOfDay === 'afternoon') {
        if (energy > 6 && stress < 4 && emotionalSpectrum > 7) {
            return 'uplifted';
        } else if (energy < 5 && stress > 6 && emotionalBalance < 5) {
            return 'drained';
        } else if (energy > 5 && intensity > 7 && emotionalSpectrum > 6) {
            return 'energetic';
        } else if (emotionalSpectrum < 4 && stress > 6) {
            return 'anxious';
        }
    }

    // Evening moods
    if (timeOfDay === 'evening') {
        if (energy < 4 && stress > 6 && intensity < 4) {
            return 'relaxed';
        } else if (energy > 6 && emotionalSpectrum > 7) {
            return 'excited';
        } else if (energy > 5 && emotionalSpectrum < 4 && stress < 6) {
            return 'reflective';
        } else if (energy < 3 && emotionalBalance < 3 && stress > 7) {
            return 'exhausted';
        }
    }

    // General condition
    if (energy > 7 && stress < 3 && emotionalSpectrum > 6 && intensity > 7) {
        return 'happy';
    } else if (energy < 4 && stress > 7 && intensity < 4) {
        return 'calm';
    } else if (energy < 3 && stress > 8) {
        return 'Exhausted';
    } else if (weather === 'high' && emotionalSpectrum > 6) {
        return 'excited';
    } else if (emotionalSpectrum < 3 && intensity > 7) {
        return 'moody';
    } else if (intensity < 3 && stress < 4 && emotionalBalance < 3) {
        return 'peaceful';
    } else if (intensity > 7 && energy > 7 && emotionalBalance > 6) {
        return 'energized';
    } else if (energy < 4 && emotionalBalance < 4 && stress > 8) {
        return 'exhausted';
    } else {
        return 'neutral';
    }
}


// Fetching playlist from Spotify, now considering the language parameter
async function getSpotifyPlaylist(mood, timeOfDay, language) {
    try {
        // Include language in the search query if provided
        let query = `${mood} ${timeOfDay}`;
        if (language) {
            query += ` ${language}`;  // Append language to the search query
        }

        console.log('Fetching playlist for mood:', query);
        const searchResponse = await spotifyApi.searchPlaylists(query);
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

// Start the server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Route to test backend connectivity
app.get('/test', (req, res) => {
    res.send('Backend is working!');
});
