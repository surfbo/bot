# Cloudflare Workers Deployment Guide

## Prerequisites

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Authenticate with Cloudflare:
```bash
wrangler login
```

## Setup

1. Install dependencies for Workers:
```bash
npm install --save-dev @cloudflare/workers-types typescript wrangler
```

2. Set up environment variables:
```bash
wrangler secret put MATRIX_ACCESS_TOKEN
```
Enter your Matrix access token when prompted.

## Development

Run the worker locally:
```bash
wrangler dev
```

## Deployment

Deploy to staging:
```bash
wrangler deploy --env staging
```

Deploy to production:
```bash
wrangler deploy --env production
```

## Configuration

The cron job is configured to run every 3 days at 7:30 AM UTC:
- Schedule: `30 7 */3 * *`
- This matches the original GitHub Actions schedule

## Environment Variables

- `MATRIX_ACCESS_TOKEN`: Your Matrix bot access token

## File Structure

```
src/
├── index.ts      # Main worker entry point with scheduled event handler
├── fetcher.ts    # Fetches surf forecast data
├── parser.ts     # Parses HTML using regex (replaces JSDOM)
└── sender.ts     # Sends messages to Matrix via HTTP API
```

## Migration Notes

- Replaced JSDOM with regex-based HTML parsing for compatibility
- Replaced Matrix SDK with direct HTTP API calls
- Added proper TypeScript types for Cloudflare Workers
- Configured cron triggers in wrangler.toml