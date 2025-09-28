# 🚀 Deployment Guide

## Quick Setup for GitHub Pages

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `battle-royale-shooter`
4. Make it **Public** (required for free GitHub Pages)
5. Don't initialize with README (we already have files)

### Step 2: Upload Your Files
1. **Option A - GitHub Web Interface:**
   - Click "uploading an existing file"
   - Drag and drop all your game files
   - Commit changes

2. **Option B - Git Command Line:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/battle-royale-shooter.git
   git push -u origin main
   ```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select "Deploy from a branch"
5. Choose **main** branch
6. Click **Save**

### Step 4: Access Your Game
- Your game will be live at: `https://YOURUSERNAME.github.io/battle-royale-shooter/`
- It may take 5-10 minutes to deploy
- You'll get an email when it's ready

## 🎮 Sharing Your Game

Once deployed, you can share your game with anyone by sending them the GitHub Pages URL!

## 🔄 Updating Your Game

To update your game:
1. Make changes to your local files
2. Commit and push to GitHub
3. GitHub Pages will automatically update

## 📱 Mobile Testing

Test your game on mobile devices:
- Share the GitHub Pages URL
- Open in mobile browser
- Touch controls should appear automatically

## 🎯 Custom Domain (Optional)

You can use a custom domain:
1. Buy a domain name
2. Add CNAME file to your repository
3. Configure DNS settings
4. Update GitHub Pages settings

## 🐛 Troubleshooting

**Game not loading?**
- Check browser console for errors
- Ensure all files are uploaded
- Wait 10 minutes for GitHub Pages to update

**Mobile controls not working?**
- Clear browser cache
- Try different mobile browser
- Check if JavaScript is enabled

**Performance issues?**
- Close other browser tabs
- Try on different device
- Check internet connection

## 🎉 You're Done!

Your game is now live and playable by anyone with the URL!
