# DIGIPIN UI - Encoder & Decoder

A modern, responsive web application for encoding and decoding India's Digital Postal Index Number (DIGIPIN) system. Built with React, TypeScript, and the official [digipinjs](https://github.com/rajatguptaa/digipinjs) library.

## 🌐 Live Demo

**[Try the DIGIPIN UI here](https://digipin-ui.onrender.com/)**

## 📖 About DIGIPIN

DIGIPIN (Digital PIN) is a 10-character alphanumeric geocode developed by the Department of Posts, India. It provides a precise, user-friendly way to encode geographic coordinates that can be easily shared and decoded back to latitude/longitude pairs.

Each DIGIPIN corresponds to a ~4×4 m grid, ensuring precise positioning for:
- **E-commerce deliveries** - Accurate last-mile delivery
- **Emergency services** - Quick response with exact location
- **Navigation** - Precise location sharing
- **Address management** - Digital address standardization

## ✨ Features

- **🔢 Encode Coordinates**: Convert latitude/longitude to DIGIPIN codes
- **📍 Decode DIGIPIN**: Convert DIGIPIN codes back to coordinates
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **⚡ Real-time Processing**: Instant encoding/decoding with no server calls
- **🛡️ Error Handling**: Comprehensive validation and error messages
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations
- **🌍 Browser Compatible**: Works in all modern browsers

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajatguptaa/digipin-ui.git
   cd digipin-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Encoding Coordinates to DIGIPIN

1. Enter the **latitude** (e.g., `28.6139` for Delhi)
2. Enter the **longitude** (e.g., `77.2090` for Delhi)
3. Click **"Encode"**
4. Get your **DIGIPIN** (e.g., `39J-438-TJC7`)

### Decoding DIGIPIN to Coordinates

1. Enter the **DIGIPIN** code (e.g., `39J-438-TJC7`)
2. Click **"Decode"**
3. Get the **latitude** and **longitude** coordinates

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: CSS3 with modern design patterns
- **DIGIPIN Logic**: [digipinjs](https://github.com/rajatguptaa/digipinjs) library
- **Build Tool**: Create React App
- **Deployment**: Netlify
- **Browser Support**: All modern browsers

## 📁 Project Structure

```
digipin-ui/
├── public/
│   ├── _redirects          # Netlify SPA routing
│   └── index.html
├── src/
│   ├── App.tsx            # Main application component
│   ├── App.css            # Application styles
│   └── index.tsx          # Application entry point
├── netlify.toml           # Netlify deployment config
└── package.json
```

## 🔧 Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App

### Browser Compatibility

The app is configured to work with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🌍 DIGIPIN Coverage

DIGIPIN covers all of India with coordinates:
- **Latitude**: 2.5°N to 38.5°N
- **Longitude**: 63.5°E to 99.5°E

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Department of Posts, Government of India](https://www.indiapost.gov.in/vas/Pages/digipin.aspx) for the DIGIPIN system
- [digipinjs](https://github.com/rajatguptaa/digipinjs) library for the core DIGIPIN logic
- [Create React App](https://create-react-app.dev/) for the development framework
- [Netlify](https://netlify.com/) for hosting and deployment

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [DIGIPIN documentation](https://www.indiapost.gov.in/vas/Pages/digipin.aspx)
- Visit the [digipinjs repository](https://github.com/rajatguptaa/digipinjs)

---

**Made with ❤️ for India's Digital Address System**
