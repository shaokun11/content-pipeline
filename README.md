# Reddit Semantic Content Pipeline

A content ingestion and semantic search system that fetches Reddit posts, generates embeddings using Google's Gemini AI, and stores them in Milvus vector database for efficient similarity search.

## Features

- **Content Ingestion**: Automatically fetches new posts from Reddit
- **Semantic Embeddings**: Uses Google Gemini's text-embedding-004 model to generate 768-dimensional vectors
- **Vector Storage**: Stores content and embeddings in Milvus vector database
- **Similarity Search**: Enables semantic search across ingested content using cosine similarity
- **Incremental Updates**: Tracks processed posts to avoid duplicates

## Prerequisites

- Node.js (ES modules support)
- Milvus vector database running on localhost:19530
- Google Gemini API key
- Reddit cookie (optional, for increased rate limits)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd content-pipeline
```

1. Install dependencies:

```bash
npm install
```

1. Set up environment variables:
Create a `.env` file in the root directory:

```
GEMINI_API_KEY=your_gemini_api_key
REDDIT_COOKIE=your_reddit_cookie (optional)
```

## Usage

### Start the Ingestion Service

Run the main application to start ingesting Reddit posts:

```bash
npx tsx src/app.ts
```

This will:

- Start the Reddit ingestion service
- Fetch new posts from r/all
- Generate embeddings for the content
- Store them in Milvus database
- Perform a sample query with "Ps3hen pirated games"

### Database Schema

The system uses Milvus with the following collection structure:

- **id**: Auto-generated primary key (Int64)
- **vector**: 768-dimensional embedding vector (FloatVector)
- **data**: JSON document containing:
  - source: "reddit"
  - source_id: Reddit post ID
  - permalink: Reddit URL
  - author: Post author
  - community: Subreddit name
  - title: Post title
  - content: Combined title and self-text
  - created_at: Publication timestamp

## API Reference

### DbServices Class

#### insert(data)

Inserts documents with their embeddings into the database.

#### query(vector)

Searches for similar content using vector similarity.

- Returns top 3 most similar documents
- Uses cosine similarity metric
- Returns the original document data

### Content Normalization

Reddit posts are normalized into a standard format with:

- Title and self-text combined for content
- UTC timestamps converted to Date objects
- Reddit-specific metadata preserved

## Configuration

Edit `src/config.ts` to modify:

- Milvus collection names
- Vector dimensions (default: 768)

## Development

The project uses TypeScript with strict mode enabled. Key configurations:

- ES modules with Node.js next module resolution
- Strict type checking enabled
- Source maps enabled for debugging

## Dependencies

- @google/genai: Google Gemini AI SDK
- @zilliz/milvus2-sdk-node: Milvus client
- keyv: Local key-value storage for tracking progress
- dotenv: Environment variable management
- tsx: TypeScript execution

## License

ISC
