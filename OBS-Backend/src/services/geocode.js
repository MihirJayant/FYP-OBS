// @ts-nocheck
async function geocodeAddress(address) {
  if (!address) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}&limit=1`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "online-bidding-app" },
  });
  if (!resp.ok) throw new Error("Geocode failed");
  const data = await resp.json();
  if (!data[0]) return null;
  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    display_name: data[0].display_name,
  };
}
module.exports = { geocodeAddress };