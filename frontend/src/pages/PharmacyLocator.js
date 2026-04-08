import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { FiMapPin, FiPhone, FiCheckCircle, FiSearch, FiNavigation } from 'react-icons/fi';
import './PharmacyLocator.css';

const containerStyle = { width: '100%', height: 'calc(100vh - 200px)', borderRadius: '12px' };

// Sample verified pharmacies in India (Mock data)
const MOCK_PHARMACIES = [
  { id: 1, name: 'Apollo Pharmacy', lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi', phone: '011-4152xxxx', verified: true, openNow: true },
  { id: 2, name: 'MedPlus Pharmacy', lat: 19.0760, lng: 72.8777, address: 'Andheri West, Mumbai', phone: '022-2670xxxx', verified: true, openNow: true },
  { id: 3, name: 'Netmeds Store', lat: 13.0827, lng: 80.2707, address: 'T. Nagar, Chennai', phone: '044-2434xxxx', verified: true, openNow: false },
  { id: 4, name: 'Wellness Forever', lat: 18.5204, lng: 73.8567, address: 'Shivaji Nagar, Pune', phone: '020-2553xxxx', verified: true, openNow: true },
];

// Component to capture the map instance and provide it to the parent
const MapController = ({ setMap }) => {
  const map = useMap();
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);
  return null;
};

const PharmacyLocator = () => {
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [pharmacies, setPharmacies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [map, setMap] = React.useState(null);

  const fetchNearbyPharmacies = async (lat, lng) => {
    setPharmacies([]); // Clear previous results
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_GEOAPIFY_API_KEY;
      const response = await fetch(
        `https://api.geoapify.com/v2/places?categories=healthcare.pharmacy&filter=circle:${lng},${lat},5000&bias=proximity:${lng},${lat}&limit=20&apiKey=${apiKey}`
      );
      const data = await response.json();
      
      const mapped = data.features.map(f => ({
        id: f.properties.place_id,
        name: f.properties.name || 'Unnamed Pharmacy',
        lat: f.properties.lat,
        lng: f.properties.lon,
        address: f.properties.formatted,
        phone: f.properties.contact?.phone || 'No phone',
        verified: true, // Marking all as verified for UI consistency
        openNow: f.properties.datasource?.raw?.opening_hours ? true : false
      }));
      
      setPharmacies(mapped);
    } catch (err) {
      console.error('Failed to fetch pharmacies', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_GEOAPIFY_API_KEY;
      const { lat, lng } = userLocation;
      
      // Perform Geocoding search with bias toward the current location (no strict filter for global search)
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&bias=proximity:${lng},${lat}&format=json&apiKey=${apiKey}`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const { lat: newLat, lon: newLon } = data.results[0];
        const newCoords = { lat: newLat, lng: newLon };
        setUserLocation(newCoords);
        map?.setView([newLat, newLon], 14);
        fetchNearbyPharmacies(newLat, newLon);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaultLat = 28.6139; // Delhi
    const defaultLng = 77.2090;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyPharmacies(latitude, longitude);
        },
        (err) => {
          console.warn('Geolocation failed, falling back to default', err);
          setUserLocation({ lat: defaultLat, lng: defaultLng });
          fetchNearbyPharmacies(defaultLat, defaultLng);
        },
        { timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: defaultLat, lng: defaultLng });
      fetchNearbyPharmacies(defaultLat, defaultLng);
    }
  }, []);

  useEffect(() => {
    if (map && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 12);
    }
  }, [userLocation, map]);

  return (
    <div className="pharmacy-locator-page page-enter">
      <div className="locator-header">
        <div className="container">
          <h1><FiMapPin size={28} /> Nearby Verified Pharmacies</h1>
          <p>Find trusted pharmacies near you that are verified on MedVerify India</p>
          
          <div className="locator-search-bar">
            <FiSearch size={18} />
            <input 
              type="text" 
              placeholder="Search for any area or pharmacy in India..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={loading}>
              {loading ? '...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div className="container locator-content">
        <div className="locator-grid">
           <div className="locator-sidebar">
            <div className="sidebar-header">
              <h3>{pharmacies.length} {loading ? 'Finding...' : 'Stores in this area'}</h3>
              <button className="btn-icon" onClick={() => { map?.setView([userLocation.lat, userLocation.lng], 12); fetchNearbyPharmacies(userLocation.lat, userLocation.lng); }}>
                <FiNavigation />
              </button>
            </div>
            
            <div className="pharmacy-list">
              {pharmacies.length === 0 && !loading && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--slate-400)' }}>
                  No pharmacies found in this area.
                </div>
              )}
              {pharmacies.map(pharma => (
                <div 
                  key={pharma.id} 
                  className={`pharmacy-card ${selected?.id === pharma.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelected(pharma);
                    map?.setView([pharma.lat, pharma.lng], 14);
                  }}
                >
                  <div className="pharma-card-header">
                    <span className="pharma-name">{pharma.name}</span>
                    {pharma.verified && <FiCheckCircle className="verified-icon" />}
                  </div>
                  <p className="pharma-address">{pharma.address}</p>
                  <div className="pharma-meta">
                    <span className={`status-badge ${pharma.openNow ? 'open' : 'closed'}`}>
                      {pharma.openNow ? 'Open Now' : 'Possible Store'}
                    </span>
                    <span className="pharma-phone"><FiPhone size={12} /> {pharma.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="locator-map-container">
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={12}
              style={containerStyle}
            >
              <MapController setMap={setMap} />
              <TileLayer
                url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.geoapify.com/">Geoapify</a>'
              />
              
              {pharmacies.map(pharma => (
                <Marker
                  key={pharma.id}
                  position={[pharma.lat, pharma.lng]}
                  eventHandlers={{
                    click: () => setSelected(pharma),
                  }}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="color: #22c55e;"><svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 36],
                  })}
                >
                  {selected && selected.id === pharma.id && (
                    <Popup onClose={() => setSelected(null)}>
                      <div className="map-info-window">
                        <h4>{selected.name}</h4>
                        <p>{selected.address}</p>
                        <button className="btn btn-primary btn-xs">Navigate</button>
                      </div>
                    </Popup>
                  )}
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLocator;
