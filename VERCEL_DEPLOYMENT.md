# Vercel Deployment Guide

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Migrate to Next.js"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your `doodle` repository
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (root of repo)
   - **Build Command**: `yarn build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `yarn install` (auto-detected)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production: `vercel --prod`

## Configuration

### Environment Variables

If you need environment variables:
1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add any required variables
4. Redeploy

### Custom Domain

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Build Settings

The project is configured with:
- **Framework**: Next.js 14
- **Node Version**: 18.x (auto-detected)
- **Build Command**: `yarn build`
- **Output Directory**: `.next` (handled by Next.js)

## Notes

- **No base path needed**: Vercel deploys to root domain, so `/doodle` base path is disabled
- **Automatic HTTPS**: Vercel provides SSL certificates automatically
- **CDN**: All assets are served via Vercel's global CDN
- **Automatic deployments**: Every push to main branch triggers a new deployment
- **Preview deployments**: Pull requests get automatic preview URLs

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node version compatibility (18.x recommended)

### Routes Not Working

- Ensure all routes are in `app/` directory
- Check that `'use client'` directive is used for client components
- Verify no React Router imports remain

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Check that Emotion styles are working
- Verify global CSS is imported in `app/layout.tsx`

