# Pharmacon

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production hosting

The production container serves both the React site and API from one process. Its SQLite database and uploaded files must be stored on persistent disk.

```bash
export JWT_SECRET='replace-this-with-a-long-unique-secret'
docker compose up --build -d
```

Open `http://localhost:3001`. The named `pharmacon-data` volume preserves the database and uploads across container restarts. For a cloud deployment, attach a persistent volume to `/app/data` or move the database/uploads to managed storage before scaling beyond a single instance.

## Persistence

The following actions write to SQLite: file uploads, versions, deliverables, prescription confirmation, inventory adjustment, refill requests/status changes, and audit events. Demo accounts use password `demo`; change these credentials before a public deployment.
