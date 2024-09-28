const express = require('express');
const cors = require('cors');
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
app.use(cors());


console.log('CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET);

// Set up Spotify API credentials
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

app.get('/playlist', async (req, res) => {
    const energy = req.query.energy;
    const stress = req.query.stress;

    // Use energy and stress levels to determine the mood
    const moodKeyword = getMoodKeyword(energy, stress);
    const language = 'en'; // Default language for now

    try {
        // Authenticate with Spotify API
        const tokenResponse = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(tokenResponse.body['access_token']);

        // Get playlist based on mood and language
        const playlistLink = await getSpotifyPlaylist(moodKeyword, language);
        res.json({ playlistLink });
    } catch (error) {
        console.error('Spotify API error:', error);
        res.status(500).json({ error: 'Failed to fetch playlist.' });
    }
});

function getMoodKeyword(energy, stress) {
    // Define mood based on energy and stress levels
    if (energy > 7 && stress < 3) {
        return 'happy';
    } else if (energy < 4 && stress > 7) {
        return 'calm';
    } else {
        return 'neutral';
    }
}

async function getSpotifyPlaylist(mood, language) {
    // Search for playlists on Spotify based on mood and language
    try {
        const searchResponse = await spotifyApi.searchPlaylists(mood);
        const playlist = searchResponse.body.playlists.items[0];
        return playlist.external_urls.spotify; // Return the Spotify playlist link
    } catch (error) {
        throw new Error('Error fetching playlist from Spotify');
    }
}

// Start server on port 5500
app.listen(5500, () => {
    console.log('Server is running on port 5500');
});

app.get('/playlist', async (req, res) => {
  const energy = req.query.energy;
  const stress = req.query.stress;

  console.log("Received request with energy:", energy, "and stress:", stress);

  const moodKeyword = getMoodKeyword(energy, stress);
  const language = 'en'; // Default language for now

  console.log("Generated mood keyword:", moodKeyword);

  try {
      const playlistLink = await getSpotifyPlaylist(moodKeyword, language);
      console.log("Playlist fetched successfully:", playlistLink);
      res.json({ playlistLink });
  } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ error: 'Failed to fetch playlist.' });
  }
});

