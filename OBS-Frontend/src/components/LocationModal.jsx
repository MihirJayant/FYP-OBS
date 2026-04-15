import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PostcodeInput from "./PostcodeInput";

// Fix Leaflet marker icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14);
    }
  }, [center, map]);
  return null;
}

const LocationModal = ({ onSave, onClose, loading, initialLat, initialLng }) => {
  const [position, setPosition] = useState(
    initialLat && initialLng
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : null
  );
  const [fetching, setFetching] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [mapCenter, setMapCenter] = useState(null);

  var defaultCenter =
    initialLat && initialLng
      ? [parseFloat(initialLat), parseFloat(initialLng)]
      : [52.9548, -1.1581]; // Nottingham as default

  var handleGetCurrentLocation = function () {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setFetching(true);
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var coords = pos.coords;
        var newPos = { lat: coords.latitude, lng: coords.longitude };
        setPosition(newPos);
        setMapCenter([coords.latitude, coords.longitude]);
        setLocationText("");
        setFetching(false);
      },
      function (err) {
        console.error(err);
        alert("Unable to retrieve your location");
        setFetching(false);
      }
    );
  };

  var handlePostcodeChange = function (postcodeData) {
    var newPos = { lat: postcodeData.latitude, lng: postcodeData.longitude };
    setPosition(newPos);
    setMapCenter([postcodeData.latitude, postcodeData.longitude]);
    setLocationText(postcodeData.address || postcodeData.postcode);
  };

  var handlePostcodeError = function () {
    // Do nothing, the PostcodeInput component shows the error
  };

  var handleConfirm = function () {
    if (!position) {
      alert("Please select a location on the map or enter a postcode");
      return;
    }
    onSave({
      latitude: position.lat,
      longitude: position.lng,
      location: locationText || "Lat: " + position.lat.toFixed(4) + ", Lng: " + position.lng.toFixed(4),
    });
  };

  var handleClose = function () {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className="modal-backdrop-custom"></div>
      <div
        className="modal-container"
        style={{ maxWidth: "600px", width: "95%", position: "relative" }}
      >
        {/* Close button */}
        {onClose && (
          <button
            type="button"
            className="btn-close"
            onClick={handleClose}
            aria-label="Close"
            style={{ position: "absolute", top: "15px", right: "15px" }}
          ></button>
        )}

        <h4 className="fw-bold mb-3">Set Your Location</h4>
        <p className="text-muted small">
          Enter your postcode, use your current location, or click on the map.
        </p>

        {/* Postcode input */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Postcode</label>
          <PostcodeInput
            onChange={handlePostcodeChange}
            onError={handlePostcodeError}
            placeholder="Enter UK postcode (e.g., NG1 4BU)"
          />
          <small className="text-muted">
            Enter a postcode to set your location automatically
          </small>
        </div>

        {/* Map */}
        <div className="mb-3" style={{ height: "250px", width: "100%" }}>
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker position={position} setPosition={setPosition} />
            {mapCenter && <MapUpdater center={mapCenter} />}
          </MapContainer>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <button
            className="btn btn-outline-primary"
            onClick={handleGetCurrentLocation}
            disabled={fetching || loading}
          >
            {fetching ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Locating...
              </>
            ) : (
              <>
                <i className="bi bi-geo-alt-fill me-2"></i>Use My Location
              </>
            )}
          </button>

          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading || !position}
          >
            {loading ? "Saving..." : "Confirm Location"}
          </button>
        </div>
      </div>
    </>
  );
};

export default LocationModal;