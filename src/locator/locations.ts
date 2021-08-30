import {
  formatMiOrKm,
  formatNumber,
  formatPhone,
  getValueFromPath,
} from "./utils";
import { i18n } from "../i18n";
import {
  base_url,
  limit,
  locationInput,
  locationNoun,
  locationNounPlural,
  locationOption,
  locationOptions,
  radius,
} from "./constants";
import { getRequest, startLoading, stopLoading } from "./loader";
import RtfConverter from "@yext/rtf-converter";
import { highlightLocation } from "./map";

export let currentLatitude = 0;
export let currentLongitude = 0;

export function locationJSONtoHTML(entityProfile, index, locationOptions) {
  const getValue = (opt: locationOption) => {
    let val = opt.value;
    if (opt.contentSource === "FIELD") {
      val = getValueFromPath(entityProfile, opt.value);
    }
    return opt.isRtf && !!val ? RtfConverter.toHTML(val) : val;
  };

  const cardTitleValue = getValue(locationOptions.cardTitle);
  const getDirectionsLabelValue = getValue(locationOptions.getDirectionsLabel);
  const viewDetailsLinkTextValue = getValue(
    locationOptions.viewDetailsLinkText
  );
  let cardTitleLinkUrlValue = getValue(locationOptions.cardTitleLinkUrl);
  const hoursValue = getValue(locationOptions.hours);
  const addressValue = getValue(locationOptions.address);
  const crossStreetsValue = getValue(locationOptions.crossStreets);
  const phoneNumberValue = getValue(locationOptions.phoneNumber);
  const availabilityValue = getValue(locationOptions.availability);
  let viewDetailsLinkUrlValue = getValue(locationOptions.viewDetailsLinkUrl);

  let html =
    '<div class="lp-param-results lp-subparam-cardTitle lp-subparam-cardTitleLinkUrl">';
  if (cardTitleLinkUrlValue && cardTitleValue) {
    if (cardTitleLinkUrlValue["url"]) {
      cardTitleLinkUrlValue = cardTitleLinkUrlValue["url"];
    }
    html += `<div class="name hover:underline hover:font-semibold text-ll-red ">
      <a href="${cardTitleLinkUrlValue}">
        ${cardTitleValue} 
      </a>
    </div>`;
  } else if (cardTitleValue) {
    html += `<div class="name hover:underline hover:font-semibold text-ll-red ">
      ${cardTitleValue}
    </div>`;
  }
  html += "</div>";

  //    if (hoursValue) {
  //      const offset = getValueFromPath(entityProfile, "timeZoneUtcOffset");
  //      const parsedOffset = parseTimeZoneUtcOffset(offset);
  //      html += '<div class="lp-param-results lp-subparam-hours">';
  //      html +=
  //        '<div class="open-now-string">' +
  //        formatOpenNowString(hoursValue, parsedOffset) +
  //        "</div>";
  //      html += "</div>";
  //    }

  const localeString = "en-US";
  html += i18n.addressForCountry({
    locale: localeString,
    profile: { address: addressValue, crossStreets: crossStreetsValue },
    regionAbbr: false,
    derivedData: { address: addressValue },
  });

  //    html += '<div class="lp-param-results lp-subparam-crossStreets">';
  //    if (crossStreetsValue) {
  //        html += '<div class="crossStreets">' + crossStreetsValue + "</div>";
  //    }
  //    html += "</div>";

  html += '<div class="lp-param-results lp-subparam-phoneNumber">';
  if (phoneNumberValue) {
    const formattedPhoneNumber = formatPhone(
      phoneNumberValue,
      addressValue.countryCode
    );
    if (formattedPhoneNumber) {
      html += '<div class="phone">' + formattedPhoneNumber + "</div>";
    }
  }
  html += "</div>";

  const singleLineAddress =
    entityProfile.name +
    " " +
    addressValue.line1 +
    " " +
    (addressValue.line2 ? addressValue.line2 + " " : "") +
    addressValue.city +
    " " +
    addressValue.region +
    " " +
    addressValue.postalCode;

  html += `<div class="lp-param-results lp-subparam-getDirectionsLabel">
    <div class="link">
      <a target="_blank"
        href="https://www.google.com/maps/dir/?api=1&destination=${singleLineAddress}"
      >
        ${getDirectionsLabelValue}
      </a>
    </div>
  </div>`;
  html += '<div class="lp-param-results lp-subparam-availability mt-3">';
  if (availabilityValue) {
    html +=
      '<div class="availability">' +
      "<strong>Limited Availability</strong>" +
      "</div>";
  }
  html += "</div>";

  // if (viewDetailsLinkUrlValue && viewDetailsLinkTextValue) {
  //   // Url value is URL object and not url.
  //   if (viewDetailsLinkUrlValue["url"]) {
  //     viewDetailsLinkUrlValue = viewDetailsLinkUrlValue["url"];
  //   }
  //   html += `<div class="lp-param-results lp-subparam-viewDetailsLinkText lp-subparam-viewDetailsLinkUrl">
  //     <div class="lp-param lp-param-viewDetailsLabel link"><strong>
  //       <a href="${viewDetailsLinkUrlValue}">
  //         ${viewDetailsLinkTextValue}
  //       </a>
  //     </strong></div>
  //   </div>`;
  // }

  // Add center column
  html = `<div class="center-column">${html}</div>`;

  // Add left and right column
  if (entityProfile.__distance) {
    html = `<div class="left-column">
      ${index + 1}.
    </div>
    ${html}
    <div class="right-column"><div class="distance">
      ${formatMiOrKm(
        entityProfile.__distance.distanceMiles,
        entityProfile.__distance.distanceKilometers
      )}
    </div></div>`;
  }

  return `<div id="result-${index}" class="result">${html}</div>`;
}

// Renders each location the the result-list-inner html
export function renderLocations(locations, append, viewMore) {
  if (!append) {
    [].slice
      .call(document.querySelectorAll(".result-list-inner") || [])
      .forEach(function (el) {
        el.innerHTML = "";
      });
  }

  // Done separately because the el.innerHTML call overwrites the original html.
  // Need to wait until all innerHTML is set before attaching listeners.
  locations.forEach((location, index) => {
    [].slice
      .call(document.querySelectorAll(".result-list-inner") || [])
      .forEach(function (el) {
        el.innerHTML += locationJSONtoHTML(location, index, locationOptions);
      });
  });

  locations.forEach((_, index) => {
    document
      .getElementById("result-" + index)
      .addEventListener("mouseover", () => {
        highlightLocation(index, false, false);
      });
    document.getElementById("result-" + index).addEventListener("click", () => {
      highlightLocation(index, false, true);
    });
  });

  if (viewMore) {
    [].slice
      .call(document.querySelectorAll(".result-list-inner") || [])
      .forEach(function (el) {
        el.innerHTML +=
          '<div><div class="btn btn-link btn-block">View More</div></div>';
      });
  }
}

function searchDetailMessageForCityAndRegion(total) {
  if (total === 0) {
    return '0 [locationType] found near <strong>"[city], [region]"</strong>';
  } else {
    return '[formattedVisible] of [formattedTotal] [locationType] near <strong>"[city], [region]"</strong>';
  }
}

function searchDetailMessageForArea(total) {
  if (total == 0) {
    return '0 [locationType] found near <strong>"[location]"</strong>';
  } else {
    return '[formattedVisible] of [formattedTotal] [locationType] near <strong>"[location]"</strong>';
  }
}

function searchDetailMessageNoGeo(total) {
  if (total === 0) {
    return "0 [locationType]";
  } else {
    return "[formattedVisible] of [formattedTotal] [locationType]";
  }
}

// Renders details of the search
export function renderSearchDetail(geo, visible, total, queryString) {
  // x of y locations near "New York, NY"
  // x  locations near "New York, NY"
  // x  locations near "New York, NY"

  let locationType = locationNoun;
  if (total === 0 || total > 1) {
    locationType = locationNounPlural;
  }

  let formattedVisible = formatNumber(visible);
  let formattedTotal = formatNumber(total);

  let searchDetailMessage;
  if (geo) {
    if (geo.address.city !== "") {
      searchDetailMessage = searchDetailMessageForCityAndRegion(total);
      searchDetailMessage = searchDetailMessage.replace(
        "[city]",
        geo.address.city
      );
      searchDetailMessage = searchDetailMessage.replace(
        "[region]",
        geo.address.region
      );
    } else {
      let location = "";
      if (geo.address.region) {
        location = geo.address.region;
      } else if (geo.address.country && queryString) {
        location = queryString;
      } else if (geo.address.country) {
        location = geo.address.country;
      }
      if (location !== "") {
        searchDetailMessage = searchDetailMessageForArea(total);
        searchDetailMessage = searchDetailMessage.replace(
          "[location]",
          location
        );
      }
    }
  } else {
    searchDetailMessage = searchDetailMessageNoGeo(total);
  }
  searchDetailMessage = searchDetailMessage.replace(
    "[locationType]",
    locationType
  );
  searchDetailMessage = searchDetailMessage.replace(
    "[formattedVisible]",
    formattedVisible
  );
  searchDetailMessage = searchDetailMessage.replace(
    "[formattedTotal]",
    formattedTotal
  );

  // [].slice
  // .call(document.querySelectorAll(".search-center") || [])
  // .forEach(function (el) {
  //   el.innerHTML = "";
  //  });
  // [].slice
  //   .call(document.querySelectorAll(".search-center") || [])
  //   .forEach(function (el) {
  //     el.innerHTML = searchDetailMessage;
  //   });
}

export function getNearestLocationsByString() {
  const queryString = locationInput.value;
  if (queryString.trim() !== "") {
    var request_url = base_url + "entities/geosearch";
    request_url += "?radius=" + radius;
    request_url += "&location=" + queryString;
    request_url += "&limit=" + limit;
    getRequest(request_url, queryString);
  }
  var url = window.location.href;
  var myStorage = window.sessionStorage;
  sessionStorage.setItem('query', url);
  // console.log("saved " , url);
}

// Get locations by lat lng (automatically fired if the user grants acceess)
function getNearestLatLng(position) {
  [].slice
    .call(document.querySelectorAll(".error-text") || [])
    .forEach(function (el) {
      el.textContent = "";
    });
  currentLatitude = position.coords.latitude;
  currentLongitude = position.coords.longitude;
  let request_url = base_url + "entities/geosearch";
  request_url += "?radius=" + radius;
  request_url +=
    "&location=" + position.coords.latitude + ", " + position.coords.longitude;
  request_url += "&limit=" + limit;
  getRequest(request_url, null);
}

// Gets a list of locations. Only renders if it's a complete list. This avoids a dumb looking map for accounts with a ton of locations.
export function getLocations() {
  const request_url =
    base_url +
    "entities" +
    "?limit=" +
    limit +
    '&sortBy=[{"name":"ASCENDING"}]';
  getRequest(request_url, null);
}

export function getUsersLocation() {
  if (navigator.geolocation) {
    startLoading();
    const error = (error) => {
      [].slice
        .call(document.querySelectorAll(".error-text") || [])
        .forEach(function (el) {
          el.textContent =
            "Unable to determine your location. Please try entering a location in the search bar.";
        });
      stopLoading();
    };
    navigator.geolocation.getCurrentPosition(getNearestLatLng, error, {
      timeout: 10000,
    });
  }
}
