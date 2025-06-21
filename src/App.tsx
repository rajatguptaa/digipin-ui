import React, { useState } from 'react';
import './App.css';
import { getDigiPin, getLatLngFromDigiPin } from 'digipinjs';

function App() {
  // Encode state
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [encodedPin, setEncodedPin] = useState('');
  const [encodeError, setEncodeError] = useState('');

  // Decode state
  const [digipin, setDigipin] = useState('');
  const [decodedCoords, setDecodedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [decodeError, setDecodeError] = useState('');

  // Encode handler
  const handleEncode = (e: React.FormEvent) => {
    e.preventDefault();
    setEncodeError('');
    setEncodedPin('');
    try {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (isNaN(latNum) || isNaN(lngNum)) {
        setEncodeError('Please enter valid numbers for latitude and longitude.');
        return;
      }
      const pin = getDigiPin(latNum, lngNum);
      setEncodedPin(pin);
    } catch (err: any) {
      setEncodeError(err.message || 'Failed to encode DIGIPIN.');
    }
  };

  // Decode handler
  const handleDecode = (e: React.FormEvent) => {
    e.preventDefault();
    setDecodeError('');
    setDecodedCoords(null);
    try {
      const coords = getLatLngFromDigiPin(digipin.trim());
      setDecodedCoords(coords);
    } catch (err: any) {
      setDecodeError(err.message || 'Failed to decode DIGIPIN.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DIGIPIN Encoder & Decoder</h1>
        <div className="digipin-container">
          {/* Encode Section */}
          <section className="digipin-section">
            <h2>Encode (Lat/Lng → DIGIPIN)</h2>
            <form onSubmit={handleEncode} className="digipin-form">
              <input
                type="text"
                placeholder="Latitude (e.g. 28.6139)"
                value={lat}
                onChange={e => setLat(e.target.value)}
                className="digipin-input"
              />
              <input
                type="text"
                placeholder="Longitude (e.g. 77.2090)"
                value={lng}
                onChange={e => setLng(e.target.value)}
                className="digipin-input"
              />
              <button type="submit" className="digipin-btn">Encode</button>
            </form>
            {encodedPin && <div className="digipin-result">DIGIPIN: <b>{encodedPin}</b></div>}
            {encodeError && <div className="digipin-error">{encodeError}</div>}
          </section>

          {/* Decode Section */}
          <section className="digipin-section">
            <h2>Decode (DIGIPIN → Lat/Lng)</h2>
            <form onSubmit={handleDecode} className="digipin-form">
              <input
                type="text"
                placeholder="DIGIPIN (e.g. 39J-438-TJC7)"
                value={digipin}
                onChange={e => setDigipin(e.target.value)}
                className="digipin-input"
              />
              <button type="submit" className="digipin-btn">Decode</button>
            </form>
            {decodedCoords && (
              <div className="digipin-result">
                Latitude: <b>{decodedCoords.latitude}</b><br />
                Longitude: <b>{decodedCoords.longitude}</b>
              </div>
            )}
            {decodeError && <div className="digipin-error">{decodeError}</div>}
          </section>
        </div>
        <footer style={{ marginTop: 32, fontSize: 14, opacity: 0.7 }}>
          <a href="https://github.com/rajatguptaa/digipinjs" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
            Powered by digipinjs
          </a>
        </footer>
      </header>
    </div>
  );
}

export default App;
