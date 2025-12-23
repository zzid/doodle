# GitHub Pages Setup Checklist

## Step 1: Verify GitHub Pages is Enabled

1. Go to your repository: https://github.com/zzid/doodle
2. Click on **Settings** (top menu bar)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, make sure:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
   - Click **Save** if you made changes

## Step 2: Verify Deployment

1. Go to the **Actions** tab in your repository
2. Check if there are any recent workflow runs
3. If `yarn deploy` failed, check the error messages

## Step 3: Check gh-pages Branch

1. Go to your repository
2. Click on the branch dropdown (usually shows "main" or "master")
3. Look for `gh-pages` branch
4. If it exists, click on it and verify it has files (especially `index.html`)

## Step 4: Wait for GitHub Pages to Build

- After enabling GitHub Pages, it can take **5-10 minutes** for the site to be available
- Check the Pages settings page - it will show the URL when ready

## Step 5: Access Your Site

Your site should be available at:
- **https://zzid.github.io/doodle**

If you see a 404 error:
- Wait a few more minutes
- Check the Pages settings for any error messages
- Verify the `gh-pages` branch exists and has content

## Step 6: Re-deploy if Needed

If you need to re-deploy:

```bash
yarn deploy
```

Then wait a few minutes and check again.

## Common Issues

### "Site can't be reached" or 404 Error
- **Wait 5-10 minutes** after first deployment
- Verify `gh-pages` branch exists
- Check GitHub Pages settings show the correct branch
- Try accessing: `https://zzid.github.io/doodle/` (with trailing slash)

### Blank Page
- Open browser console (F12) and check for errors
- Verify all assets are loading correctly
- Check if JavaScript is enabled

### Routing Not Working
- The `404.html` file should handle this
- Try accessing routes directly: `https://zzid.github.io/doodle/calendar`

