const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const BASE_URL = 'https://api.pexels.com/v1';

const getHeaders = () => ({
  Authorization: API_KEY,
});

export const fetchWallpapers = async (query = 'wallpapers', page = 1, perPage = 30, orientation = '', color = '') => {
  try {
    let url = `${BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    // orientation can be 'landscape', 'portrait', or 'square'
    if (orientation) {
      url += `&orientation=${orientation}`;
    }

    if (color) {
      url += `&color=${encodeURIComponent(color)}`;
    }

    const response = await fetch(url, { headers: getHeaders() });
    
    if (!response.ok) {
      throw new Error(`Error fetching wallpapers: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from Pexels API:", error);
    return null;
  }
};

export const fetchCuratedWallpapers = async (page = 1, perPage = 30) => {
  try {
    const response = await fetch(`${BASE_URL}/curated?page=${page}&per_page=${perPage}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error fetching curated wallpapers: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch curated from Pexels API:", error);
    return null;
  }
};
