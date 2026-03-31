# Render + Vercel Deployment

## Architecture

- `Render` hosts the FastAPI backend from `API/`
- `Render PostgreSQL` stores users, predictions, datasets, and uploaded records
- `Vercel` hosts the Next.js frontend from `UI/`

## 1. Push The Project

1. Create a GitHub repository.
2. Push this project to GitHub.
3. Make sure the repo includes:
   - `API/`
   - `UI/`
   - `render.yaml`

## 2. Deploy Backend On Render

### Option A: Blueprint

1. Log in to Render.
2. Choose `New` -> `Blueprint`.
3. Select this repository.
4. Render will detect [render.yaml](/Users/nikhithabommali/Final%20Year%20project/chaos_tabnet_model/render.yaml).
5. Create the resources.

### Option B: Manual

1. Create a PostgreSQL database in Render.
2. Create a `Web Service`.
3. Use these values:
   - Root Directory: `API`
   - Runtime: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Backend Environment Variables

Set these in Render:

```env
DATABASE_URL=postgresql://...
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

### Backend Check

After deployment, open:

- `https://your-render-service.onrender.com/`
- `https://your-render-service.onrender.com/docs`

The root URL should return a JSON success message.

## 3. Deploy Frontend On Vercel

1. Log in to Vercel.
2. Import the same GitHub repository.
3. Set the project root directory to `UI`.
4. Add this environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

5. Deploy the project.

## 4. Update CORS In Render

After Vercel gives you the final frontend URL:

1. Copy the deployed Vercel URL.
2. Update `CORS_ORIGINS` in Render.
3. Redeploy the backend.

Example:

```env
CORS_ORIGINS=https://your-app.vercel.app
```

If you use multiple domains, separate them with commas.

## 5. Production Test Checklist

1. Open the frontend URL.
2. Sign up a user.
3. Log in as user.
4. Run a prediction.
5. Confirm result charts load.
6. Confirm analytics page loads.
7. Sign up or log in as admin.
8. Upload a CSV dataset.
9. Confirm dataset appears in admin dashboard.
10. Confirm experimental results section loads.

## Important Notes

- Uploaded CSV data is stored in PostgreSQL, which is safe for Render deployment.
- Local dataset-file-based regeneration only works in production if those dataset CSV files are committed into the repository or the generator is changed to use database uploads.
- Free Render services may sleep after inactivity, so the first request can be slow.
- The frontend depends on `NEXT_PUBLIC_API_URL`, so make sure it points to the deployed backend and not `localhost`.
