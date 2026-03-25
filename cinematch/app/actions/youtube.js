'use server';

export async function getYouTubeVideoDetails(videoId) {
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('YouTube API key not found, using fallback');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high.url,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        channelTitle: video.snippet.channelTitle
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching YouTube video details:', error);
    return null;
  }
}

export async function searchYouTubeTrailer(movieTitle, movieYear) {
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('YouTube API key not found, using fallback');
    return null;
  }

  try {
    const searchQuery = movieYear 
      ? `${movieTitle} ${movieYear} official trailer`
      : `${movieTitle} official trailer`;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&maxResults=5&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching YouTube trailers:', error);
    return [];
  }
}
