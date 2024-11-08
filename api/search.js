export default async function handler(req, res) {
    const { query, start } = req.query;

    // Replace these with environment variables
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.SEARCH_ENGINE_ID;

    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&start=${start}&key=${apiKey}&cx=${searchEngineId}&searchType=image`;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Error fetching from Google API: ${response.statusText}`);
        }

        const data = await response.json();
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
