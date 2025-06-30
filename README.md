# BrandVoice.ai - Instagram Content Repurposer

Transform your Instagram posts into multi-platform content with AI-powered technology from Spaceslam.

## 🚀 Features

- **Instagram Integration**: Fetch posts and videos using Meta Graph API
- **AI Transcription**: Convert Instagram videos to text using OpenAI Whisper-1
- **Multi-Platform Content**: Generate LinkedIn posts, Instagram carousels, Threads posts, and video scripts
- **Space-Tech Branding**: Energetic, innovative content optimized for Spaceslam's brand voice
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Comprehensive error management for all integrations

## 🛠 Setup

### Prerequisites

- Node.js 18+ 
- npm/pnpm/yarn
- OpenAI API key
- Meta Graph API access token
- Instagram Basic Display API access (optional)

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Meta Graph API Configuration  
META_ACCESS_TOKEN=your_meta_access_token_here
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here

# Instagram Basic Display API (optional)
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here

# Rate Limiting (optional)
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW=3600000
\`\`\`

### Installation

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## 🔧 API Configuration

### Meta Graph API Setup

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Instagram Basic Display product
3. Configure Instagram Basic Display settings
4. Generate access tokens
5. Add your app to Instagram's allowlist

### OpenAI API Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Ensure you have credits for GPT-4o-mini and Whisper-1 usage

## 📱 Supported Instagram Formats

- **Posts**: `https://www.instagram.com/p/ABC123/`
- **Reels**: `https://www.instagram.com/reel/ABC123/`
- **IGTV**: `https://www.instagram.com/tv/ABC123/`
- **Query Parameters**: URLs with `?hl=en` and other parameters

## 🎯 Generated Content Types

### LinkedIn Posts
- Professional tone with space-tech energy
- Relevant hashtags and engagement hooks
- BrandVoice.ai branding integration

### Instagram Carousels  
- 5 engaging slides with complete copy
- Story-driven content structure
- Space-tech terminology and emojis

### Threads Posts
- Conversational tone under 500 characters
- Relevant hashtags and engagement
- Community-focused messaging

### Video Scripts
- Complete scripts with timing and visual cues
- Clear call-to-actions
- Spaceslam branding integration

## 🔒 Security & Privacy

- Server-only API integrations
- Temporary file cleanup for video processing
- Rate limiting protection
- Comprehensive error handling
- No client-side API key exposure

## 🚀 Deployment

### Vercel (Recommended)

\`\`\`bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
\`\`\`

### Docker

\`\`\`bash
# Build Docker image
docker build -t brandvoice-ai .

# Run container
docker run -p 3000:3000 --env-file .env.local brandvoice-ai
\`\`\`

## 📊 Monitoring & Analytics

- Built-in error logging
- API usage tracking
- Rate limit monitoring
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

Copyright © 2024 Spaceslam. All rights reserved.

## 🆘 Support

For support and questions:
- Email: support@space-slam.com
- Website: [space-slam.com](https://space-slam.com)
- Documentation: [docs.brandvoice.ai](https://docs.brandvoice.ai)

---

Built with ❤️ by [Spaceslam](https://space-slam.com) for the future of content creation.
