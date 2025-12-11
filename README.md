# BoardEase -  PWA

A Progressive Web App (PWA) for boarding house management with offline capabilities, built with React + Vite.

## 🚀 Features

- ✅ **Progressive Web App (PWA)** - Install on any device
- ✅ **Offline Support** - Works without internet connection
- ✅ **Auto-Updates** - Automatic service worker updates
- ✅ **Stripe Payment Integration** - Secure payment processing
- ✅ **Supabase Backend** - Real-time database and authentication
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Admin Dashboard** - Comprehensive management interface

## 📦 Tech Stack

- **Frontend**: React 19 + Vite 7
- **Styling**: TailwindCSS 4
- **PWA**: vite-plugin-pwa + Workbox
- **Routing**: React Router DOM 7
- **Backend**: Supabase
- **Payments**: Stripe
- **Deployment**: Vercel

## 🛠️ Installation

### Prerequisites

- Node.js >= 20.0.0
- npm >= 8.0.0

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd boardease-new
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

4. **Generate PWA Icons**

Place your logo in `public/` folder and generate icons:
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `apple-touch-icon.png` (180x180px)
- `mask-icon.svg` (SVG format)

You can use [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) to create these.

## 🏃 Running the App

### Development Mode
```bash
npm run dev
```
Visit `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Click the install icon (➕) in the address bar
2. Or go to menu → Install BoardEase

### Mobile (iOS Safari)
1. Tap the Share button
2. Select "Add to Home Screen"
3. Tap "Add"

### Mobile (Android Chrome)
1. Tap the menu (⋮)
2. Select "Install app" or "Add to Home Screen"

## 🔄 PWA Features

### Offline Functionality
- App shell cached for offline access
- API responses cached with NetworkFirst strategy
- Automatic cache management with Workbox
- Offline detector shows connection status

### Auto-Updates
- Service worker checks for updates automatically
- Users notified when new version available
- One-click update with automatic reload
- No manual refresh needed

### Caching Strategy

**App Shell**: `CacheFirst`
- All static assets (JS, CSS, HTML, images)

**Stripe API**: `NetworkFirst`
- Cache duration: 1 hour
- Max 10 entries

**Supabase API**: `NetworkFirst`
- Cache duration: 5 minutes
- Max 50 entries

## 🚢 Deployment

### Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables** in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`

4. **Configure vercel.json** (already included):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 📂 Project Structure

```
boardease-new/
├── api/
│   └── create-payment-intent.js    # Serverless payment API
├── public/
│   ├── pwa-192x192.png            # PWA icons
│   ├── pwa-512x512.png
│   ├── apple-touch-icon.png
│   └── mask-icon.svg
├── src/
│   ├── components/
│   │   ├── admin/                 # Admin dashboard
│   │   ├── OfflineDetector.jsx    # PWA offline detector
│   │   ├── payment.jsx            # Stripe payment
│   │   └── ...
│   ├── contexts/
│   │   └── authcontext.jsx        # Auth provider
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point + PWA register
│   └── index.css                  # Tailwind imports
├── .env                           # Environment variables
├── vite.config.js                 # Vite + PWA config
├── vercel.json                    # Vercel deployment config
└── package.json
```

## 🔐 Authentication

The app uses Supabase authentication with protected routes:

- **Public**: `/`, `/login`, `/signup`
- **Protected**: `/profile`, `/payment/*`
- **Admin Only**: `/admin/*`

## 💳 Payment Integration

Stripe integration with PHP (Philippine Peso) currency:
- Secure payment processing
- Payment intent creation
- Success/failure handling
- Order tracking

## 🐛 Troubleshooting

### PWA not installing
- Make sure you're using HTTPS (or localhost)
- Check all manifest icons exist
- Verify service worker is registered in DevTools

### Service Worker not updating
- Clear browser cache
- Unregister old service workers in DevTools
- Check for console errors

### Offline mode not working
- Ensure service worker is active
- Check Network tab shows cached responses
- Verify workbox configuration

## 📝 License

[Your License Here]

## 👥 Credits

**BoardEase**
- Boarding house management system
- Progressive Web App implementation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ by BoardEase**