export const limit = 5;
export const radius = 50;
export const defaultQuery = "10012";
export const locationInput = <HTMLInputElement>(
  document.getElementById("location-input")
);
export const searchButton = document.getElementById("search-location-button");
export const useMyLocation = document.getElementById("useLocation");
export const locationNoun = "Locations";
export const locationNounPlural = "Locations";

// Live Api query variables
export const liveAPIKey = "c1be28fe46a4efb864aa9d8583108490";
export const savedFilterId = "551464658";
export const entityTypes = "location";
export const loadLocationsOnLoad = false;
export const enableAutocomplete = true;
export const base_url = "https://liveapi.yext.com/v2/accounts/me/";
export const useMiles = true;

export type locationOption = {
  // The value of the content, either a field name or a constant value
  value: string;
  // Determines where this value comes from. Generally either FIELD or text.
  contentSource: string;
  // Determines whether the content defined in value should be parsed as RTF.
  isRtf: boolean | undefined;
};

export const locationOptions = {
  cardTitle: {
    value: "c_locationNickname",
    contentSource: "FIELD",
    isRtf: true,
  },
  cardTitleLinkUrl: {
    value: "slug",
    contentSource: "FIELD",
  },
  hours: {
    value: "hours",
    contentSource: "FIELD",
  },
  address: {
    value: "address",
    contentSource: "FIELD",
  },
  crossStreets: {
    value: "c_crossStreets",
    contentSource: "FIELD",
  },
  availability: {
    value: "c_limitedAvailability",
    contentSource: "FIELD",
  },
  phoneNumber: {
    value: "mainPhone",
    contentSource: "FIELD",
  },
  heroImageThumbnail: {
    value: "c_heroImageThumbnail",
    contentSource: "FIELD",
  },
  getDirectionsLabel: {
    value: "Get Directions",
    contentSource: "text",
    isRtf: true,
  },
  coordinates: {
    value: "geocodedCoordinate",
    contentSource: "FIELD",
  },
  viewDetailsLinkText: {
    value: "View Details",
    contentSource: "text",
  },
  viewDetailsLinkUrl: {
    value: "/",
    contentSource: "text",
  },
};
