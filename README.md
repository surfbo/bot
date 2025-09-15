# surf-bobot

Surf monitoring bot that runs on Cloudflare Workers and sends alerts to Matrix when good surf conditions are detected.

## Local Development

Install dependencies:
```bash
npm install
```

Run locally:
```bash
wrangler dev --test-scheduled
```

Test the scheduled function:
```bash
curl "http://localhost:8787/__scheduled?cron=30+7+*%2F3+*+*"
```

## Deployment

Deploy to Cloudflare Workers:
```bash
wrangler deploy
```

Set up secrets:
```bash
wrangler secret put MATRIX_ACCESS_TOKEN
```

## Configuration

The bot runs every 3 days at 7:30 AM UTC (configured in `wrangler.toml`).

See `CLOUDFLARE_DEPLOYMENT.md` for detailed setup instructions.
