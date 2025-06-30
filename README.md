# Spaceslam Content Repurposer

Transform any Instagram post into cross-platform content in seconds! This full-stack Next.js application uses AI to generate LinkedIn posts, Instagram carousels, Threads posts, and video scripts from Instagram URLs.

## Features

- 🚀 **Multi-channel Content Generation**: Convert Instagram posts to LinkedIn, Carousel, Threads, and Video Script formats
- 🎯 **AI-Powered**: Uses OpenAI GPT-4o-mini for intelligent content transformation
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🌙 **Dark Mode**: Full dark mode support with next-themes
- 📱 **Responsive Design**: Mobile-first responsive design
- ⚡ **Rate Limiting**: Built-in rate limiting (30 requests/hour per IP)
- 🔄 **Real-time Updates**: React Query for efficient data fetching and caching
- ♿ **Accessible**: WCAG compliant with proper ARIA labels and keyboard navigation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4o-mini
- **State Management**: TanStack Query (React Query)
- **Theme**: next-themes
- **Icons**: Lucide React + React Icons
- **Testing**: Vitest

## Quick Start

1. **Clone and install dependencies**:
   \`\`\`bash
   git clone <repository-url>
   cd spaceslam-content-repurposer
   pnpm install
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Add your OpenAI API key to `.env.local`:
   \`\`\`
   OPENAI_API_KEY=your_openai_api_key_here
   \`\`\`

3. **Run the development server**:
   \`\`\`bash
   pnpm dev
   \`\`\`

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Paste an Instagram post or reel URL into the input field
2. Click "Generate" to process the content
3. View the generated content across different tabs (LinkedIn, Carousel, Threads, Video Script)
4. Use the copy buttons to copy content to your clipboard
5. Paste the content into your preferred social media platforms

## API Endpoints

### POST /api/process

Processes an Instagram URL and generates multi-channel content.

**Request Body**:
\`\`\`json
{
  "url": "https://instagram.com/p/example"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "linkedin": "Professional LinkedIn post content...",
    "carousel": ["Slide 1", "Slide 2", "Slide 3", "Slide 4", "Slide 5"],
    "threads": "Threads post content...",
    "video_script": "Video script with cues and shots..."
  }
}
\`\`\`

## Development

### Project Structure

\`\`\`
src/
├── app/                 # Next.js App Router pages and API routes
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions and configurations
└── styles/             # Global styles
\`\`\`

### Key Components

- **HomePage**: Main application interface with form and results
- **ContentResults**: Tabbed interface for displaying generated content
- **CopyButton**: Reusable copy-to-clipboard functionality
- **ThemeToggle**: Dark/light mode toggle

### Testing

Run the test suite:
\`\`\`bash
pnpm test
\`\`\`

### Linting and Formatting

\`\`\`bash
pnpm lint
pnpm format
\`\`\`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for content generation | Yes |
| `IG_ACCESS_TOKEN` | Instagram API token (future feature) | No |
| `NEXT_PUBLIC_APP_URL` | Application URL for metadata | No |

## Rate Limiting

The application implements in-memory rate limiting:
- **Limit**: 30 requests per hour per IP address
- **Window**: 1 hour rolling window
- **Response**: 429 status code when limit exceeded

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@spaceslam.com or open an issue on GitHub.
