import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const GOOGLE_API_KEY = 'AIzaSyBEbEfR6VmYy9yE8wusHxGYS0kbRm3OthU';
const CX = '56eb5a04f74f04d98'; // Replace with your actual CX ID

// Serve static files from the public folder
app.use(express.static('public'));

// Explicitly serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to search for images
app.get('/api/search', async (req, res) => {
    const query = req.query.query;
    const start = req.query.start || 1; // Default to 1 if no start is specified
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}&searchType=image&start=${start}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Ensure items exist before mapping
        if (data.items) {
            const images = data.items.map(item => ({
                url: item.link,
                title: item.title
            }));
            res.json(images);
        } else {
            res.json([]); // Return empty array if no items
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
