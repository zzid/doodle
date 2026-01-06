# Doodle

A React-based web application featuring various utility tools and interactive components, including event calendars, symbol calculators, and animation examples.

## About the Code

This project is built with:
- **Next.js 14** with App Router and TypeScript
- **React 18** for UI components
- **Emotion** for styled components
- **Framer Motion** for animations
- **Day.js** for date manipulation
- **Zustand** for state management
- **Tailwind CSS** for utility styling

### Project Structure

```
app/
├── layout.tsx        # Root layout with theme provider
├── page.tsx         # Home page (/)
├── exp-coupon/
│   └── page.tsx     # /exp-coupon route
├── event-2408/
│   └── page.tsx     # /event-2408 route
└── ...              # Other routes
src/
├── components/       # Reusable UI components
├── features/         # Feature modules
│   ├── event-2408/  # Event tracking components
│   ├── event-2412/  # Event calendar components
│   ├── exp-coupon/  # Experience coupon calculator
│   ├── motions/     # Animation examples
│   └── symbol/      # Symbol calculation tools
├── pages/           # Page components (used by app routes)
├── layout/          # Layout components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
└── styles/          # Global styles
```

### Key Features

- **Event Calendar**: Interactive calendar with event tracking and cumulative count system
- **Symbol Calculator**: Tools for calculating symbol advantages and forces
- **Experience Coupon Calculator**: Utility for experience coupon calculations
- **Animation Examples**: Various motion and animation demonstrations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager

### Installation

```bash
yarn install
```

### Development

Run the app in development mode:

```bash
yarn dev
```

The app will open at [http://localhost:3030](http://localhost:3030).

### Building for Production

Build the app for production:

```bash
yarn build
```

This creates an optimized production build in the `.next` folder.

## Deployment

This app can be deployed to various platforms:

### Deploy to Vercel (Recommended)

**Quick Steps:**

1. **Push your code to GitHub** (if not already done)
2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
3. **Click "Add New Project"** and import your repository
4. **Vercel auto-detects Next.js** - no configuration needed
5. **Click "Deploy"** - your app will be live in ~2 minutes

**Features:**
- ✅ Automatic deployments on every push
- ✅ Preview deployments for pull requests
- ✅ Free tier with excellent performance
- ✅ Global CDN and automatic HTTPS
- ✅ Zero configuration required

Your app will be available at `https://your-project.vercel.app`

**For detailed instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

### Deploy to GitHub Pages

For static export to GitHub Pages:

1. **Update `next.config.js`** to enable static export:
   ```js
   output: 'export',
   images: { unoptimized: true },
   ```

2. **Deploy the app**:
   ```bash
   yarn deploy
   ```
   This command will:
   - Build the app for production with static export
   - Deploy the `out` folder to the `gh-pages` branch

3. **Enable GitHub Pages** (if not already enabled):
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select the `gh-pages` branch
   - Click "Save"

4. **Access your deployed app**:
   - Your app will be available at: `https://zzid.github.io/doodle`
   - It may take a few minutes for the changes to be live

### Deployment Notes

- The base path is configured as `/doodle` for production builds (GitHub Pages)
- For Vercel deployment, the base path is automatically handled
- Static export (GitHub Pages) has limitations: no API routes, ISR, or server components

## Available Scripts

### `yarn dev`

Runs the app in development mode at `http://localhost:3030`.

### `yarn build`

Builds the app for production. The output will be in the `.next` folder.

### `yarn start`

Starts the production server (requires `yarn build` first).

### `yarn deploy`

Builds and deploys the app to GitHub Pages (requires static export configuration).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/)
- [Emotion Documentation](https://emotion.sh/docs/introduction)
- [Framer Motion Documentation](https://www.framer.com/motion/)
