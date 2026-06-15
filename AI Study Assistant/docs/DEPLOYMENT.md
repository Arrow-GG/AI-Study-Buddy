# Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Static assets optimized
- [ ] Error handling implemented
- [ ] Security review completed
- [ ] Performance tested
- [ ] Documentation updated

## Deployment Options

### Option 0: Vercel Frontend for noted.io

Use this for the Next.js frontend only.

```txt
Vercel Root Directory: frontend
Framework Preset: Next.js
Install Command: npm ci
Build Command: npm run build
Output Directory: .next
```

Production environment variable:

```env
NEXT_PUBLIC_API_URL=https://api.noted.io/api
```

Add these domains in Vercel after the first successful deployment:

```txt
noted.io
www.noted.io
```

Copy the DNS records Vercel provides into FreeDNS.

### Option 1: Docker Compose (Recommended for Development)

```bash
# Clone/navigate to project
cd ai-study-assistant

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Build and run
docker-compose up -d

# Verify
curl http://localhost:8000/api/health
open http://localhost:3000
```

### Option 2: Heroku Deployment

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create apps
heroku create ai-study-backend
heroku create ai-study-frontend

# Add buildpacks
heroku buildpacks:add heroku/python -a ai-study-backend
heroku buildpacks:add heroku/nodejs -a ai-study-frontend

# Configure environment variables
heroku config:set GOOGLE_API_KEY=your-key -a ai-study-backend
heroku config:set DATABASE_URL=postgresql://... -a ai-study-backend

# Deploy
git push heroku main
```

### Option 3: AWS ECS

```bash
# Push Docker images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -t ai-study-backend ./backend
docker tag ai-study-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/ai-study-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/ai-study-backend:latest

# Similar for frontend

# Use CloudFormation or CDK to provision ECS cluster
```

### Option 4: DigitalOcean App Platform

```bash
# Create app.yaml
cat > app.yaml <<EOF
name: ai-study-assistant
services:
- name: backend
  github:
    repo: your-repo
    branch: main
  dockerfile_path: backend/Dockerfile
  envs:
  - key: DATABASE_URL
    value: ${db.connection_string}
  - key: GOOGLE_API_KEY
    value: ${api_key}

- name: frontend
  github:
    repo: your-repo
    branch: main
  dockerfile_path: frontend/Dockerfile

databases:
- name: db
  engine: PG
  version: "14"
EOF

# Deploy
doctl apps create --spec app.yaml
```

### Option 5: Google Cloud Run

```bash
# Backend deployment
docker build -t gcr.io/PROJECT-ID/ai-study-backend ./backend
docker push gcr.io/PROJECT-ID/ai-study-backend

gcloud run deploy ai-study-backend \
  --image gcr.io/PROJECT-ID/ai-study-backend \
  --platform managed \
  --set-env-vars GOOGLE_API_KEY=your-key

# Frontend deployment
docker build -t gcr.io/PROJECT-ID/ai-study-frontend ./frontend
docker push gcr.io/PROJECT-ID/ai-study-frontend

gcloud run deploy ai-study-frontend \
  --image gcr.io/PROJECT-ID/ai-study-frontend \
  --platform managed
```

## Database Setup

### PostgreSQL RDS (AWS)

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier ai-study-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 20

# Run migrations
psql -h <endpoint> -U admin -d ai_study_assistant -f database/schema.sql
```

### PostgreSQL on DigitalOcean

```bash
# Create managed database via UI
# Get connection string

# Connect and run schema
psql <connection-string> -f database/schema.sql
```

## Environment Variables

### Backend Production

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://host:6379/0

# Security
SECRET_KEY=<strong-random-key-generated>
DEBUG=False

# Google API
GOOGLE_API_KEY=<your-api-key>

# Settings
LOG_LEVEL=INFO
CORS_ORIGINS=https://noted.io,https://www.noted.io
```

### Frontend Production

```env
NEXT_PUBLIC_API_URL=https://api.noted.io/api
```

## SSL/TLS Setup

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

## Monitoring & Logging

### Application Monitoring

```python
# Backend - Add to main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0
)
```

### Logging

```bash
# Backend logs
docker logs ai-study-backend

# Frontend logs
docker logs ai-study-frontend

# Database logs
docker logs ai-study-db
```

### Health Checks

```bash
# Continuous monitoring
while true; do
    curl -f http://localhost:8000/api/health || echo "Backend down"
    sleep 30
done
```

## Performance Optimization

### Frontend

```bash
# Build optimization
npm run build

# Analyze bundle
npm run build -- --analyze
```

### Backend

```python
# Add caching headers
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZIPMiddleware

app.add_middleware(GZIPMiddleware, minimum_size=1000)
```

## Backup Strategy

### Automated Backups

```bash
# Daily PostgreSQL backup
0 2 * * * pg_dump -U postgres ai_study_assistant > /backups/db_$(date +\%Y\%m\%d).sql

# Upload to S3
0 3 * * * aws s3 cp /backups/ s3://my-backups/ai-study/ --recursive
```

### Recovery

```bash
# Restore from backup
psql -U postgres -d ai_study_assistant < /backups/db_20240101.sql
```

## Scaling Strategies

### Horizontal Scaling

```yaml
# Multiple backend instances
backend:
  replicas: 3
  load_balancer: nginx
```

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_document_chunks_embedding ON document_chunks(embedding_id);

-- Enable connection pooling with PgBouncer
```

### Caching Layer

```python
# Use Redis for session caching
from fastapi_sessions.backends.redis import RedisBackend
```

## Security Hardening

### HTTPS Enforcement

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Rate Limiting

```python
# Backend rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest):
    # ...
```

### CORS Configuration

```python
# Only allow frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and push Docker images
        run: |
          docker build -t backend ./backend
          docker build -t frontend ./frontend

      - name: Run tests
        run: |
          docker run backend pytest

      - name: Deploy to production
        run: |
          # Deploy commands
```

## Rollback Procedure

```bash
# Keep previous version available
git tag release-v1.0.0
docker tag ai-study-backend:v1.0.1 ai-study-backend:v1.0.0

# If issues arise, revert
docker run -d -p 8000:8000 ai-study-backend:v1.0.0
```

## Post-Deployment

1. Verify all services are running
2. Run smoke tests
3. Monitor error logs
4. Check performance metrics
5. Update DNS records (if applicable)
6. Communicate to users

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker logs <container-name>

# Restart container
docker restart <container-name>

# Rebuild
docker-compose up -d --build
```

### Database Connection Issues

```bash
# Test connection
psql <connection-string> -c "SELECT 1;"

# Check connection pool
SHOW max_connections;
```

### High Memory Usage

```bash
# Monitor containers
docker stats

# Limit memory
docker run -m 512m ...
```

## Maintenance

### Regular Updates

```bash
# Update dependencies
pip install --upgrade -r requirements.txt
npm update

# Security patches
docker pull postgres:15
docker pull redis:7
```

### Cleanup

```bash
# Remove old images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

**For detailed setup, see [SETUP.md](./SETUP.md)**
