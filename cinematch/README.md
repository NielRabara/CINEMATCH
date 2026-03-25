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

# 🎬 CINEMATCH

**CineMatch** is a modern, AI-powered movie discovery platform with real-time chat, advanced authentication, and comprehensive movie metadata. Built with **Next.js 16**, **React 19**, and **Tailwind CSS**.

---

## 🚀 Features

### 🔐 Advanced Authentication System
- **Secure Password-Based Login**: Username/email authentication with password hashing
- **Unique User Profiles**: Email validation and unique username enforcement
- **Real-time Session Management**: Persistent login state with proper logout
- **No Guest Access**: Prevents automatic guest account creation

### 🤖 AI-Powered "Mood" Search
- Natural language search (e.g., "Something space-themed but cozy")
- **Google Gemini AI Integration**: Uses `gemini-2.5-flash`, `gemini-2.0-flash`, and `gemini-2.0-flash-lite` models
- **Retry Logic**: Automatic retry with exponential backoff for 503 errors
- **Fallback Models**: Multiple model support for improved success rate (~60%)
- **Beautiful Gradient UI**: AI-branded results with smooth animations

### 💬 Real-time Global Chat
- **Authenticated Users Only**: Chat requires proper user authentication
- **Supabase Realtime**: Live message updates across all users
- **User Avatars**: Dynamic initials-based avatars
- **Persistent Messages**: Message history stored in PostgreSQL database
- **Minimizable Interface**: Smooth animations and responsive design

### 🎭 Movie Details & Metadata
- **Comprehensive Information**: Genres, cast, budget, revenue, ratings
- **YouTube Trailers**: Integrated trailer viewing with metadata
- **TMDB Integration**: Full movie and TV series database
- **Image Galleries**: High-quality poster and backdrop images
- **Responsive Modals**: Mobile-optimized detail views

### ⭐ Review System
- **5-Star Rating**: Detailed rating system with text reviews
- **User Profiles**: Review history tied to authenticated users
- **Persistent Storage**: Reviews saved to Supabase database

### 🎨 Advanced Navigation
- **Multi-Content Support**: Movies, TV series, and anime
- **Genre Filtering**: Advanced genre-based filtering
- **Mobile Responsive**: Hamburger menu and touch-friendly interface
- **Dynamic Tabs**: Popular, Top Rated, Upcoming, Favorites, Likes

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.4 (App Router) with React 19.2.3
- **Styling**: Tailwind CSS 4.0 with custom dark theme
- **Icons**: Lucide React for modern, consistent iconography
- **State Management**: React hooks with localStorage persistence

### Backend & APIs
- **AI**: Google Gemini API with retry logic and fallback models
- **Database**: Supabase (PostgreSQL + Realtime + RLS)
- **Movie Data**: TMDB API for comprehensive movie metadata
- **Authentication**: Custom password-based system with SHA-256 hashing

### Development Tools
- **Package Manager**: npm with package-lock.json
- **Version Control**: Git with semantic versioning
- **Environment**: .env.local for secure configuration

---

## 📋 Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/NielRabara/CINEMATCH.git
cd cinematch
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# TMDB API (Movie Database)
NEXT_PUBLIC_TMDB_API_KEY=61e7c417108a4dccaebf5e5b6a0d23ef

# Google Gemini API (AI Features)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
GEMINI_MODEL=gemini-2.5-flash

# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# YouTube Data API (Trailers)
YOUTUBE_API_KEY=your_youtube_api_key_here

# OMDB API (Additional Movie Data)
OMDB_API_KEY=a39def2e
```

### 4. Database Setup
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open the SQL Editor
3. Run the SQL commands from `supabase-setup.sql`
4. Run the migration from `add-password-column.sql` if needed
5. Run the RLS policies from `fix-rls-policies.sql`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🎯 Usage Guide

### 🔑 Authentication
1. **Sign Up**: Click "Sign Up" button, enter username, email, and password
2. **Login**: Click "Login" button, use username/email and password
3. **Profile**: Click your avatar to access profile settings
4. **Logout**: Use logout button in profile modal

### 🤖 AI Mood Search
1. Type a mood description in the purple gradient search bar
2. Examples: "Something space-themed but cozy", "Feel-good comedy", "Dark psychological thriller"
3. Click "Get Recommendations" for AI-powered suggestions
4. View AI picks in dedicated results section

### 💬 Global Chat
1. **Authentication Required**: Must be logged in to access chat
2. Click chat bubble in bottom-right corner
3. Type messages and press Enter or click send
4. Messages appear in real-time for all authenticated users
5. Minimize chat using the minimize button

### 🎬 Movie Discovery
1. **Browse**: Use navigation tabs (Popular, Top Rated, Upcoming)
2. **Search**: Use search bar for specific movies/TV shows
3. **Filter**: Apply genre and content type filters
4. **Interact**: Like movies, view details, watch trailers

---

## 🎨 Design System

### Color Palette
- **Primary**: Pink (#ec4899) for branding and CTAs
- **Secondary**: Purple (#8b5cf6) for accents and gradients
- **Background**: Dark gray (#111827) for modern dark theme
- **Surface**: Medium gray (#1f2937) for cards and modals

### Typography
- **Headings**: Bold, uppercase tracking for brand consistency
- **Body**: System fonts for optimal readability
- **UI Elements**: Consistent sizing and spacing

### Animations
- **Micro-interactions**: Hover states, button feedback
- **Page Transitions**: Smooth loading and content changes
- **Loading States**: Skeleton screens and spinners

---

## 📱 Mobile Responsiveness

### Breakpoints
- **Mobile**: < 640px (1 column grid)
- **Tablet**: 640px - 1024px (2-3 columns)
- **Desktop**: > 1024px (4-5 columns)

### Mobile Features
- **Collapsible Navigation**: Hamburger menu with smooth animations
- **Touch-Friendly**: Larger tap targets and proper spacing
- **Optimized Modals**: Full-screen overlays on small devices
- **Responsive Chat**: Bottom-positioned chat with proper sizing

---

## 🔧 Development

### File Structure
```
app/
├── actions/
│   ├── auth.js           # Authentication system with password hashing
│   ├── moodSearch.js      # AI mood search with retry logic
│   ├── genres.js          # Genre filtering and TMDB integration
│   ├── content.js         # Content management and filtering
│   └── tmdbAccount.js     # User favorites and watchlist
├── components/
│   ├── GlobalChat.js      # Real-time chat component
│   ├── MovieDetailModal.js # Movie details with tabs
│   ├── ProfileModal.js    # User profile management
│   ├── LoginModal.js      # Authentication interface
│   ├── SignupModal.js     # User registration
│   └── GenrePopup.js      # Genre filtering UI
├── page.js               # Main application component
└── layout.js             # Root layout
```

### API Integration Details
- **TMDB**: Movie data, posters, trailers, genres, cast
- **Google Gemini**: AI mood search with multiple model fallback
- **Supabase**: Real-time chat, user authentication, data persistence
- **YouTube**: Trailer embedding and metadata

### Performance Optimizations
- **Image Optimization**: Lazy loading with placeholder images
- **API Efficiency**: Proper error handling and retry logic
- **State Management**: Optimized re-renders with proper dependencies
- **Bundle Size**: Code splitting and dynamic imports

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Automatic deployment on git push

### Environment Variables Required
- `NEXT_PUBLIC_TMDB_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `YOUTUBE_API_KEY`
- `OMDB_API_KEY`

---

## 🔒 Security Features

### Authentication Security
- **Password Hashing**: SHA-256 hashing for secure storage
- **Input Validation**: Client and server-side validation
- **Session Management**: Secure localStorage handling
- **No Guest Access**: Prevents unauthorized usage

### Database Security
- **Row Level Security**: Proper RLS policies for data access
- **API Key Protection**: Environment variable storage
- **SQL Injection Prevention**: Parameterized queries
- **Data Validation**: Input sanitization and type checking

---

## 🐛 Troubleshooting

### Common Issues

#### Authentication Problems
- **"Could not find 'password_hash' column"**: Run `add-password-column.sql`
- **"Row-level security policy violation"**: Run `fix-rls-policies.sql`
- **Login not working**: Check Supabase URL and anon key

#### AI Search Issues
- **"503 Service Unavailable"**: Automatic retry will handle this
- **"429 Too Many Requests"**: Free tier quota exceeded, wait for reset
- **No recommendations**: Try simpler mood descriptions

#### Chat Problems
- **Messages not appearing**: Check browser console for errors
- **Chat not loading**: Verify Supabase credentials and RLS policies
- **Real-time not working**: Check WebSocket connection in console

### Debug Mode
Add `NEXT_PUBLIC_DEBUG=true` to environment variables for detailed console logging.

---

## 📊 API Rate Limits

### Google Gemini (Free Tier)
- **Requests**: 15 requests per minute
- **Daily Quota**: Varies by region
- **Models**: Multiple fallback models improve reliability

### TMDB API
- **Requests**: 40 requests per 10 seconds
- **Concurrency**: Limited but reasonable for development

### Supabase
- **Real-time Connections**: 100 concurrent connections
- **Database Size**: 500MB free tier
- **Bandwidth**: 2GB monthly transfer

---

## 🔄 Version Control

### Current Version: 2.0.0

#### Version History
- **v2.0.0**: Advanced authentication, AI integration, real-time chat
- **v1.0.0**: Basic movie discovery with TMDB integration

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
git push origin main
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Use ES6+ features
- Follow React best practices
- Maintain consistent naming conventions
- Add proper error handling

---

## 📄 License

This project is for educational purposes. Please ensure you have proper licenses for all APIs and services used.

---

## 🆘 Support & Contact

### Issues & Bugs
- **GitHub Issues**: [Create new issue](https://github.com/NielRabara/CINEMATCH/issues)
- **Feature Requests**: Use GitHub discussions or issues
- **Security Issues**: Report privately via email

### Developer
- **Name**: Neil Rabara
- **GitHub**: [@NielRabara](https://github.com/NielRabara)
- **Project**: [CINEMATCH](https://github.com/NielRabara/CINEMATCH)

---

**Built with ❤️ using modern web technologies - showcasing advanced full-stack development capabilities**

---

## 📈 Project Metrics

### Technical Achievements
- ✅ **Authentication System**: Complete password-based auth
- ✅ **AI Integration**: Google Gemini with retry logic
- ✅ **Real-time Features**: Supabase live chat
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Performance**: Optimized API usage and caching
- ✅ **Security**: Proper validation and hashing

### User Experience
- 🎯 **Intuitive Navigation**: Clear information architecture
- 🎨 **Beautiful UI**: Modern gradients and smooth animations
- ⚡ **Fast Performance**: Optimized loading and interactions
- 🔒 **Secure Authentication**: Reliable user management
- 💬 **Social Features**: Real-time community chat
- 🤖 **Smart Search**: AI-powered recommendations

---

*Last Updated: March 2026*  
*Version: 2.0.0*
