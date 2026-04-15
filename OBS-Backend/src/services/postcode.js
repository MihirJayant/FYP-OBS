// Postcode Service - Uses Postcodes.io API (Free, No API Key Required)
 
const POSTCODES_IO_BASE = "https://api.postcodes.io";

// Lookup postcode and get coordinates

async function lookupPostcode(postcode) {
  try {
    if (!postcode || typeof postcode !== "string") {
      return { valid: false, error: "Postcode is required" };
    }

    const cleanPostcode = postcode.trim().toUpperCase().replace(/\s+/g, " ");

    const response = await fetch(
      `${POSTCODES_IO_BASE}/postcodes/${encodeURIComponent(cleanPostcode)}`
    );
    const data = await response.json();

    if (data.status === 200 && data.result) {
      const result = data.result;
      return {
        valid: true,
        latitude: result.latitude,
        longitude: result.longitude,
        formatted: result.postcode,
        area: {
          parish: result.parish,
          ward: result.admin_ward,
          district: result.admin_district,
          county: result.admin_county,
          region: result.region,
          country: result.country,
        },
        displayAddress: [
          result.admin_ward,
          result.admin_district,
          result.admin_county || result.region,
          result.postcode,
        ]
          .filter(Boolean)
          .join(", "),
      };
    } else {
      return { valid: false, error: data.error || "Invalid postcode" };
    }
  } catch (error) {
    console.error("Postcode lookup error:", error);
    return { valid: false, error: "Failed to validate postcode" };
  }
}

//Validate postcode only
 
async function validatePostcode(postcode) {
  try {
    if (!postcode) return false;
    const cleanPostcode = postcode.trim().toUpperCase().replace(/\s+/g, " ");

    const response = await fetch(
      `${POSTCODES_IO_BASE}/postcodes/${encodeURIComponent(
        cleanPostcode
      )}/validate`
    );
    const data = await response.json();
    return data.status === 200 && data.result === true;
  } catch (error) {
    return false;
  }
}

// Reverse lookup - get postcode from coordinates
 
async function reversePostcodeLookup(latitude, longitude) {
  try {
    if (!latitude || !longitude) {
      return { success: false, error: "Coordinates are required" };
    }

    const response = await fetch(
      `${POSTCODES_IO_BASE}/postcodes?lon=${longitude}&lat=${latitude}&limit=1`
    );
    const data = await response.json();

    if (data.status === 200 && data.result && data.result.length > 0) {
      const result = data.result[0];
      return {
        success: true,
        postcode: result.postcode,
        distance: result.distance,
        area: {
          ward: result.admin_ward,
          district: result.admin_district,
          county: result.admin_county,
          region: result.region,
        },
      };
    } else {
      return {
        success: false,
        error: "No postcode found for these coordinates",
      };
    }
  } catch (error) {
    return { success: false, error: "Failed to find postcode" };
  }
}

/**
 * Autocomplete postcode suggestions
 */
async function autocompletePostcode(partial) {
  try {
    if (!partial || partial.length < 2) {
      return { success: false, suggestions: [] };
    }

    const cleanPartial = partial.trim().toUpperCase();

    const response = await fetch(
      `${POSTCODES_IO_BASE}/postcodes/${encodeURIComponent(
        cleanPartial
      )}/autocomplete`
    );
    const data = await response.json();

    if (data.status === 200 && data.result) {
      return { success: true, suggestions: data.result };
    } else {
      return { success: false, suggestions: [] };
    }
  } catch (error) {
    return { success: false, suggestions: [] };
  }
}

module.exports = {
  lookupPostcode,
  validatePostcode,
  reversePostcodeLookup,
  autocompletePostcode,
};