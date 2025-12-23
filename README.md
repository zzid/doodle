# Doodle

A React-based web application featuring various utility tools and interactive components, including event calendars, symbol calculators, and animation examples.

## About the Code

This project is built with:
- **React 18** with TypeScript
- **Create React App** with CRACO for custom configuration
- **React Router** for client-side routing
- **Emotion** for styled components
- **Framer Motion** for animations
- **Day.js** for date manipulation
- **Zustand** for state management
- **Tailwind CSS** for utility styling

### Project Structure

```
src/
├── components/       # Reusable UI components
├── features/         # Feature modules
│   ├── event-2408/  # Event tracking components
│   ├── event-2412/  # Event calendar components
│   ├── exp-coupon/  # Experience coupon calculator
│   ├── motions/     # Animation examples
│   └── symbol/      # Symbol calculation tools
├── pages/           # Page components
├── layout/          # Layout components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
└── routes.tsx       # Route configuration
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
yarn start
```

The app will open at [http://localhost:3030](http://localhost:3030).

### Building for Production

Build the app for production:

```bash
yarn build
```

This creates an optimized production build in the `build` folder.

## Deployment

This app is configured for deployment to GitHub Pages.

### Deploy to GitHub Pages

1. **Deploy the app**:
   ```bash
   yarn deploy
   ```
   This command will:
   - Build the app for production
   - Deploy the `build` folder to the `gh-pages` branch

2. **Enable GitHub Pages** (if not already enabled):
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select the `gh-pages` branch
   - Click "Save"

3. **Access your deployed app**:
   - Your app will be available at: `https://zzid.github.io/doodle`
   - It may take a few minutes for the changes to be live

### Deployment Notes

- The router is configured with basename `/doodle` for production builds
- A `404.html` file is included to handle client-side routing on GitHub Pages
- The `homepage` field in `package.json` is set to the GitHub Pages URL

## Available Scripts

### `yarn start`

Runs the app in development mode at `http://localhost:3030`.

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn test`

Launches the test runner in interactive watch mode.

### `yarn deploy`

Builds and deploys the app to GitHub Pages.

### `yarn eject`

**Note: This is a one-way operation. Once you `eject`, you can't go back!**

Ejects from Create React App, giving you full control over the build configuration.

## Learn More

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
