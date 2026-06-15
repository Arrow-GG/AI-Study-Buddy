# noted.io Deployment Runbook

This project is set up for:

- Frontend: `https://noted.io` and `https://www.noted.io`
- Backend API: `https://api.noted.io/api`

## Step 1: DNS

At your domain registrar, set the nameservers to FreeDNS:

```txt
freedns1.registrar-servers.com
freedns2.registrar-servers.com
freedns3.registrar-servers.com
freedns4.registrar-servers.com
freedns5.registrar-servers.com
```

After nameservers propagate, create these DNS records in FreeDNS:

```txt
noted.io        -> frontend host
www.noted.io    -> frontend host
api.noted.io    -> backend host
```

Use the exact A/CNAME values supplied by your hosting providers.

## Step 2: Backend Environment

Set these on the backend host:

```env
DEBUG=False
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB
SECRET_KEY=<long-random-secret>
CORS_ORIGINS=https://noted.io,https://www.noted.io
GOOGLE_API_KEY=<optional-gemini-key>
GEMINI_MODEL=gemini-1.5-pro
EMBEDDING_MODEL=all-MiniLM-L6-v2
UPLOAD_DIR=/app/uploads
LOG_LEVEL=INFO
```

Backend health checks:

```txt
https://api.noted.io/api/health
https://api.noted.io/api/capabilities
```

## Step 3: Frontend Environment

Deploy the frontend on Vercel:

1. Import the Git repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Keep Framework Preset as **Next.js**.
4. Set the Production environment variable below.
5. Deploy.

Set this before building the frontend:

```env
NEXT_PUBLIC_API_URL=https://api.noted.io/api
```

Important: `NEXT_PUBLIC_API_URL` is baked into the Next.js build.

Vercel settings:

```txt
Root Directory: frontend
Install Command: npm ci
Build Command: npm run build
Output Directory: .next
```

After Vercel gives you a deployment URL, add these domains in Vercel:

```txt
noted.io
www.noted.io
```

Then copy Vercel's required DNS records into FreeDNS.

## Step 4: Production Smoke Test

After deployment:

1. Open `https://noted.io`.
2. Create an account at `/auth`.
3. Upload a `.txt` file or paste text on `/upload`.
4. Confirm the document shows `completed`.
5. Open API docs at `https://api.noted.io/api/docs`.
6. Check `https://api.noted.io/api/capabilities`.

## Step 5: DNS Checklist

Do not point DNS at `127.0.0.1` or `localhost`.

Use:

```txt
@     frontend provider root/apex target
www   frontend provider www target
api   backend provider target
```

## Deployment Notes

- Use Postgres in production. SQLite is only a fallback for local development.
- File uploads need persistent storage. If the backend host has ephemeral disks, attach persistent volume storage or switch uploads to object storage.
- Set a strong `SECRET_KEY`; the backend refuses production startup with the default secret.
- Keep `CORS_ORIGINS` limited to `https://noted.io,https://www.noted.io`.
