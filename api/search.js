export default async function handler(req, res) {
    const { query, start } = req.query;

    // Replace these with environment variables
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;

    // URL encode the query parameter to handle special characters
    const encodedQuery = encodeURIComponent(query);

    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodedQuery}&start=${start}&key=${apiKey}&cx=${searchEngineId}&searchType=image`;

    // Log the full request URL for debugging
    console.log("Request URL:", searchUrl);

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Error fetching from Google API: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for any error messages in the data
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
