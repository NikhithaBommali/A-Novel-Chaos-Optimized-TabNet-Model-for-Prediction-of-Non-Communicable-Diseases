# Fixing Vercel Deployment (404 Not Found)

## The Issue
Your Vercel deployment shows `404: NOT_FOUND` because Vercel is looking for the build output in the root directory, but your Next.js application lives in the `UI` folder.

## The Fix
1.  **Go to Vercel Dashboard** -> Select Project -> **Settings** -> **General**.
2.  Find **Root Directory** section.
3.  Click **Edit** and change it to `UI`.
4.  **Save**.
5.  Go to **Deployments** tab -> Click the latest failed/successful deployment -> **Redeploy**.

## Environment Variables
Ensure you add the following Environment Variable in Vercel Settings:
- `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://your-api.onrender.com`).

## Verification
After redeploying, verify the deployment URL works. The 404 error should be gone.
