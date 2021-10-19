import {
  entityTypes,
  liveAPIKey,
  locationInput,
  savedFilterId,
} from "./constants";
import { renderLocations, renderSearchDetail } from "./locations";
import { addMarkersToMap, centerOnGeo } from "./map";

export let isLoading = false;

export function startLoading() {
  // console.log("start loading");
  isLoading = true;

  [].slice
    .call(document.querySelectorAll(".spinner") || [])
    .forEach(function (el) {
      el.style.visibility = "visible";
    });
  //[].slice
  //.call(document.querySelectorAll(".search-center") || [])
  //.forEach(function (el) {
  //  el.innerHTML = "";
  // });
  [].slice
    .call(document.getElementsByClassName("result") || [])
    .forEach(function (el) {
      // el.style.visibility = "hidden";
      el.innerHTML = '<div class="skeleton h-6 flex-grow mx-4 my-10"></div>';
    });
  locationInput.disabled = true;
  [].slice
    .call(document.querySelectorAll(".search") || [])
    .forEach(function (el) {
      el.classList.add("disabled");
    });
}

export function stopLoading() {
  isLoading = false;

  [].slice
    .call(document.querySelectorAll(".spinner") || [])
    .forEach(function (el) {
      el.style.visibility = "hidden";
    });
  [].slice
    .call(document.querySelectorAll(".result-list") || [])
    .forEach(function (el) {
      el.style.visibility = "visible";
    });
  locationInput.disabled = false;
  [].slice
    .call(document.querySelectorAll(".search") || [])
    .forEach(function (el) {
      el.classList.remove("disabled");
    });
}

export function getRequest(request_url, queryString) {
  // Add query string to URL
  if (queryString !== null) {
    const newUrl = window.location.href.replace(
      /(\?.*)?$/,
      "?q=queryString".replace("queryString", queryString)
    );
    if (
      window.history.state &&
      window.history.state.queryString !== queryString
    ) {
      window.history.pushState({ queryString: queryString }, "", newUrl);
    } else {
      window.history.replaceState({ queryString: queryString }, "", newUrl);
    }
  }

  startLoading();
  request_url += "&api_key=" + liveAPIKey;
  request_url += "&v=" + "20181201";
  request_url += "&resolvePlaceholders=true";

  if (entityTypes) {
    request_url += "&entityTypes=" + entityTypes;
  }

  if (savedFilterId) {
    request_url += "&savedFilterIds=" + savedFilterId;
  }

  fetch(request_url, { method: "GET" })
    .then((res) => res.json())
    .then(function (data) {
      if (data.meta.errors && data.meta.errors.length > 0) {
        alert(data.meta.errors[0]["message"]);
      }
      const locations = [];

      // Cases where API returns 0 locations
      if (data.response.entities.length == 0) {
        [].slice
        .call(document.querySelectorAll(".error-text") || [])
        .forEach(function (el) {
          el.textContent = "No results in this location.";
        });
        stopLoading();
        [].slice
        .call(document.querySelectorAll(".result-list") || [])
        .forEach(function (el) {
          el.style.visibility = "hidden";
        });
      } else {
          for (let i = 0; i < data.response.entities.length; i++) {
            const location = data.response.entities[i];
    
            // Add location distance if it exists
            if (data.response.distances) {
              location.__distance = data.response.distances[i];
            }
            locations.push(location);
          }
          // Update Panel
          renderLocations(locations, false, false);
          renderSearchDetail(
            data.response.geo,
            locations.length,
            data.response.count,
            queryString
          );
    
          // Update Map
          addMarkersToMap(locations);
    
          if (locations.length == 0) {
            centerOnGeo(data.response.geo);
          }
          [].slice
            .call(document.querySelectorAll(".error-text") || [])
            .forEach(function (el) {
              el.textContent = "";
            });
          stopLoading();
      }
    })
    .catch((err) => {
      alert("There was an error");
      console.error(err);
    });
}
