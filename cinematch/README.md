# CineMatch - Advanced Movie Discovery Platform

A professional-grade movie discovery web application built with Next.js, featuring AI-powered recommendations, real-time chat, and comprehensive movie metadata.

## 🚀 Features

### 1. AI-Powered "Mood" Search
- Natural language search (e.g., "Something space-themed but cozy")
- Integration with Groq (Llama 3.3-70b) for intelligent recommendations
- Returns 5 movie suggestions based on mood descriptions
- Beautiful gradient UI with AI-branded results

### 2. Real-time Global Chat
- Live chat system using Supabase Realtime
- User avatars with initials
- Timestamps and persistent usernames
- Minimizable chat interface with smooth animations

### 3. Movie Trailers & Detailed Metadata
- Embedded YouTube trailers in modal view
- **Enhanced with YouTube Data API v3:**
  - View counts, like counts, and duration
  - Video descriptions and channel information
  - Alternative trailer search when no official trailer available
- Comprehensive movie information (genres, cast, budget, revenue)
- Responsive image galleries
- Expandable overviews with smooth transitions

### 4. Review System with AI Sentiment Analysis
- 5-star rating system with text reviews
- Automatic sentiment analysis using Groq AI
- Visual sentiment indicators (Positive/Neutral/Negative)
- User review history and editing capabilities

### 5. Advanced Navigation & Filtering
- Genre-based filtering with TMDB integration
- Mobile-responsive hamburger menu
- Horizontal scrolling for desktop
- Clear filter functionality

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.1.4 (App Router), React 19.2.3
- **Styling**: Tailwind CSS 4.0 with custom dark theme
- **Icons**: Lucide React
- **AI**: Groq SDK (Llama 3.3-70b)
- **Database**: Supabase (PostgreSQL + Realtime)
- **API**: TMDB (The Movie Database)

## 📋 Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd cinematch
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# TMDB API (already configured)
NEXT_PUBLIC_TMDB_API_KEY=61e7c417108a4dccaebf5e5b6a0d23ef

# Groq API - Get from https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Supabase - Get from https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# YouTube Data API - Get from https://console.developers.google.com/
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 2.1. YouTube Data API Setup
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3" from the API library
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file
6. **Free tier**: 10,000 requests per day

### 3. Supabase Database Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `supabase-setup.sql` file:
   - Creates `messages` table for global chat
   - Creates `reviews` table for movie reviews with sentiment analysis
   - Sets up Row Level Security policies
   - Creates performance indexes

### 4. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Usage Guide

### AI Mood Search
1. Type a mood description in the purple gradient search bar
2. Examples: "Something space-themed but cozy", "Feel-good comedy", "Dark psychological thriller"
3. Click "Get Recommendations" to see AI-powered suggestions

### Global Chat
1. Click the chat bubble in the bottom-right corner
2. Your username is automatically generated (UserXXXX)
3. Messages appear in real-time for all users

### Movie Details
1. Click any movie card to open detailed view
2. Switch between "Details" and "Reviews" tabs
3. Watch trailers, view cast information, and read user reviews

### Reviews & Ratings
1. In the movie details modal, go to the "Reviews" tab
2. Select 1-5 stars and optionally write a review
3. AI automatically analyzes sentiment and displays appropriate emoji
4. Your review is saved and can be updated later

### Genre Filtering
1. Use the genre filter bar below the main navigation
2. On mobile, tap the menu button to see genre options
3. Click "Clear" to remove genre filter

## 🎨 Design Features

- **Dark Theme**: Consistent dark gray (#111827) background with pink/purple accents
- **Responsive Design**: Mobile-first approach with hamburger menus
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Modern UI**: Gradient backgrounds, rounded corners, and glass morphism effects
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation

## 📱 Mobile Responsiveness

- Collapsible navigation menu
- Touch-friendly interface elements
- Optimized modal views for small screens
- Responsive grid layouts (1-5 columns based on screen size)

## 🔧 Development Notes

### File Structure
```
app/
├── actions/
│   ├── moodSearch.js     # AI mood search server actions
│   ├── reviews.js        # Review system with sentiment analysis
│   └── genres.js         # Genre filtering logic
├── components/
│   ├── GlobalChat.js     # Real-time chat component
│   ├── MovieDetailModal.js # Movie details with tabs
│   ├── ReviewSection.js  # Review form and display
│   └── GenreFilter.js    # Genre navigation (desktop/mobile)
├── page.js               # Main application component
└── layout.js             # Root layout
```

### API Integration
- **TMDB**: Movie data, posters, trailers, genres, cast
- **Groq**: AI-powered mood search and sentiment analysis
- **Supabase**: Real-time chat, review storage, user data

### Performance Optimizations
- Image lazy loading with placeholder images
- Efficient API calls with proper error handling
- Component-level state management
- Optimized re-renders with proper dependency arrays

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
Ensure your platform supports:
- Node.js 18+
- Environment variables
- Server-side functions (Next.js API routes)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. Please ensure you have proper licenses for all APIs and services used.

## 🆘 Troubleshooting

### Common Issues
1. **Groq API errors**: Verify your API key is correct and has sufficient credits
2. **Supabase connection**: Check URL and anon key, ensure SQL setup was completed
3. **Missing movie data**: TMDB API key should work, but may have rate limits
4. **Build errors**: Ensure all dependencies are installed and environment variables are set

### Debug Mode
Add `NEXT_PUBLIC_DEBUG=true` to your environment variables to enable console logging for debugging.

---

**Built with ❤️ for the CS community - demonstrating advanced web development capabilities**
