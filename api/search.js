let lastRequestTime = 0;

export default async function handler(req, res) {
    const { query, start } = req.query;

    // Replace these with environment variables
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;

    // Validate and encode query parameter
    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
    }
    const encodedQuery = encodeURIComponent(query);

    // Validate start parameter (should be a positive integer)
    const startIndex = parseInt(start, 10);
    if (isNaN(startIndex) || startIndex < 1) {
        return res.status(400).json({ error: 'Invalid start parameter' });
    }

    // Implement throttling: Limit requests to once every 2 seconds
    const currentTime = Date.now();
    if (currentTime - lastRequestTime < 2000) {
        console.warn("Too many requests in a short period. Please wait before making another request.");
        return res.status(429).json({ error: 'Too many requests. Please wait and try again.' });
    }
    lastRequestTime = currentTime;

    // Construct the search URL
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodedQuery}&start=${startIndex}&key=${apiKey}&cx=${searchEngineId}&searchType=image`;

    // Log the full request URL for debugging
    console.log("Request URL:", searchUrl);

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Error fetching from Google API: ${response.statusText}`);
        }

        const data = await response.json();

        // Log the full response for debugging
        console.log("Google API response data:", JSON.stringify(data, null, 2));

        if (data.error) {
            throw new Error(`Google API returned an error: ${data.error.message}`);
        }

        // Handle case where no items are returned
        if (!data.items || data.items.length === 0) {
            console.warn("No images found for the given query");
            return res.status(200).json({ message: "No images found" });
        }

        // Map the returned items to extract image URLs and titles
        const images = data.items.map(item => ({
            url: item.link,
            title: item.title,
        }));

        res.status(200).json(images);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error fetching images' });
    }
}
