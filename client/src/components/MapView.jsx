import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, DEFAULT_RADIUS_KM } from '../utils/constants';
import { BLOOD_TYPE_COLORS } from '../utils/constants';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createDotIcon = (color, size = 14) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px; height:${size}px; border-radius:50%;
      background:${color}; border:2px solid #fff;
      box-shadow: 0 0 8px ${color}80, 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const createHospitalIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px; height:28px; border-radius:6px;
      background:#3b82f6; border:2px solid #fff;
      display:flex; align-items:center; justify-content:center;
      font-size:14px; box-shadow:0 2px 8px rgba(59,130,246,0.5);
    ">🏥</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createBloodBankIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px; height:28px; border-radius:50%;
      background:#DC143C; border:2px solid #fff;
      display:flex; align-items:center; justify-content:center;
      font-size:13px; box-shadow:0 0 12px rgba(220,20,60,0.5);
    ">🩸</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

/** Pan map to new center on prop change.
 * Depends on PRIMITIVE lat/lng values, not the array reference,
 * so Leaflet's setView is only called when coordinates actually change.
 */
const MapController = ({ center, zoom }) => {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], zoom || DEFAULT_MAP_ZOOM);
    }
  }, [lat, lng, zoom]);
  return null;
};

/** Capture map click events and forward via onMapClick({ lat, lng }) */
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

/**
 * Full Leaflet map component for the Blood Connect platform.
 *
 * @param {object} props
 * @param {[number,number]} props.center - [lat, lng]
 * @param {number} props.zoom
 * @param {number} props.radiusKm - Radius circle around center
 * @param {Array} props.donors - [{_id, name, bloodType, location}]
 * @param {Array} props.bloodBanks - [{_id, name, inventory, location}]
 * @param {Array} props.requests - [{_id, patientName, bloodType, hospital, location}]
 * @param {function} props.onMapClick - Called with { lat, lng } when map is clicked
 * @param {string} props.height - CSS height string
 */
const MapView = ({
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  radiusKm = DEFAULT_RADIUS_KM,
  donors = [],
  bloodBanks = [],
  requests = [],
  onMapClick,
  height = '450px',
}) => {
  return (
    <div style={{ height, borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        <MapController center={center} zoom={zoom} />

        {/* Map click handler — only mounted when onMapClick prop is provided */}
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        {/* Radius circle */}
        {radiusKm > 0 && (
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{ color: 'rgba(220,20,60,0.6)', fillColor: 'rgba(220,20,60,0.05)', weight: 1 }}
          />
        )}

        {/* Blood Request markers */}
        {requests.map((req) => {
          const coords = req.location?.coordinates;
          if (!coords) return null;
          const [lng, lat] = coords;
          return (
            <Marker key={req._id} position={[lat, lng]} icon={createHospitalIcon()}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
                  <div style={{ fontWeight: 700, color: '#DC143C', marginBottom: 4 }}>🚨 {req.bloodType} Needed</div>
                  <div style={{ fontSize: 13, marginBottom: 2 }}><strong>{req.patientName}</strong></div>
                  <div style={{ fontSize: 12, color: '#999' }}>{req.hospital?.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{req.units} units · {req.urgency}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Donor markers */}
        {donors.map((donor) => {
          const coords = donor.location?.coordinates;
          if (!coords) return null;
          const [lng, lat] = coords;
          const color = BLOOD_TYPE_COLORS[donor.bloodType]?.color || '#10b981';
          return (
            <Marker key={donor._id} position={[lat, lng]} icon={createDotIcon(color)}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{donor.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>Blood Type: {donor.bloodType}</div>
                  <div style={{ fontSize: 12, color: '#10b981' }}>✓ Eligible to donate</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Blood Bank markers */}
        {bloodBanks.map((bank) => {
          const coords = bank.location?.coordinates;
          if (!coords) return null;
          const [lng, lat] = coords;
          return (
            <Marker key={bank._id} position={[lat, lng]} icon={createBloodBankIcon()}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>🩸 {bank.name}</div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{bank.address?.city}, {bank.address?.state}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>📞 {bank.phone}</div>
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].filter(bt => bank.inventory?.[bt]?.units > 0).map(bt => (
                      <span key={bt} style={{ fontSize: 11, background: 'rgba(220,20,60,0.15)', color: '#DC143C', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                        {bt}: {bank.inventory[bt].units}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
