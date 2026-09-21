import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { createLocationPickerIcon } from '../../utils/mapIcons.js';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]); }
  });
  return position ? <Marker position={position} icon={createLocationPickerIcon()} /> : null;
};

export const LocationPicker = ({ value, onChange }) => {
  const [pos, setPos] = useState(value ? [value.lat, value.lng] : [11.0168, 76.9558]);
  const handleChange = (newPos) => {
    setPos(newPos);
    onChange({ lat: newPos[0], lng: newPos[1] });
  };
  return (
    <div className="space-y-2">
      <div className="h-64 rounded-xl overflow-hidden border border-slate-200">
        <MapContainer center={pos} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={pos} setPosition={handleChange} />
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500">Click on map to set precise location. Current: {pos[0].toFixed(5)}, {pos[1].toFixed(5)}</p>
    </div>
  );
};
