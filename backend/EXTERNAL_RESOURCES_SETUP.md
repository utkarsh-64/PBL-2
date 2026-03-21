# External Resources Search Setup

This document explains how to set up the external resource search functionality that allows the chatbot to find YouTube videos and blog articles when users request learning materials.

## Overview

The system can detect when users ask for external resources (e.g., "Can you give me resources about NPS vs EPF?") and will search for relevant educational content.

## API Keys Setup (Optional)

The system works in two modes:

### 1. With API Keys (Full Functionality)
When API keys are provided, the system will fetch actual search results from YouTube and Google.

### 2. Without API Keys (Fallback Mode)
When API keys are not provided, the system will generate search links that users can click to search manually.

## Required API Keys

### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Add the key to your `.env` file:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

### Google Custom Search API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Custom Search API"
3. Create credentials (API Key)
4. Go to [Google Custom Search Engine](https://cse.google.com/)
5. Create a new search engine
6. Get your Search Engine ID
7. Add both to your `.env` file:
   ```
   GOOGLE_SEARCH_API_KEY=your_google_api_key_here
   GOOGLE_CSE_ID=your_search_engine_id_here
   ```

## Environment Variables

Add these to your `backend/.env` file:

```env
# External Resource Search APIs (Optional)
YOUTUBE_API_KEY=your_youtube_data_api_key_here
GOOGLE_SEARCH_API_KEY=your_google_custom_search_api_key_here
GOOGLE_CSE_ID=your_custom_search_engine_id_here
```

## Usage Examples

Users can request resources using phrases like:
- "Can you give me resources about NPS vs EPF?"
- "Show me videos about retirement planning"
- "I want to learn more about pension schemes"
- "Find me articles about tax benefits of EPF"

## Features

### YouTube Integration
- Embeds videos directly in the chat
- Shows video thumbnails and descriptions
- Provides links to open in YouTube
- Falls back to search links if API unavailable

### Blog Articles
- Shows article titles and descriptions
- Provides direct links to articles
- Displays source domains
- Falls back to Google search links if API unavailable

### Smart Query Generation
- Uses AI to generate optimized search queries
- Focuses on Indian pension schemes and financial planning
- Tailors queries for different content types (videos vs articles)

## Dependencies

Make sure to install the required dependency:

```bash
pip install requests>=2.31.0
```

## Troubleshooting

### API Quota Limits
- YouTube API: 10,000 units per day (free tier)
- Google Custom Search: 100 queries per day (free tier)

### Fallback Behavior
If APIs are unavailable or quota exceeded, the system automatically falls back to providing search links.

### Error Handling
The system gracefully handles API errors and network issues, always providing some form of resource to the user.