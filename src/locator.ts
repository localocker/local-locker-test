import {
  defaultQuery,
  enableAutocomplete,
  loadLocationsOnLoad,
  locationInput,
  searchButton,
  useMyLocation
} from "./locator/constants";
import { getLocations, getNearestLocationsByString, getUsersLocation } from "./locator/locations";
import { getQueryParamsFromUrl } from "./locator/utils";
import { isLoading } from "./locator/loader";
// @ts-ignore
import google from "google";



searchButton.addEventListener("click", function () {
  getNearestLocationsByString();
  // const locationInput = (<HTMLInputElement>document.getElementById('location-input')).value;
  // var isValidZip = /(^\d{5}$)/.test(locationInput);
  // if (isValidZip) {
  //   console.log(isValidZip, locationInput);
  //   getNearestLocationsByString();
  // }
  // else{
  //   console.log("else", isValidZip, locationInput);
  // }
});

useMyLocation.addEventListener("click", function () {
  getUsersLocation();
  // const locationInput = (<HTMLInputElement>document.getElementById('location-input')).value;
  // var isValidZip = /(^\d{5}$)/.test(locationInput);
  // if (isValidZip) {
  //   console.log(isValidZip, locationInput);
  //   getNearestLocationsByString();
  // }
  // else{
  //   console.log("else", isValidZip, locationInput);
  // }
});

window.addEventListener("popstate", function (e) {
  if (e.state && e.state.queryString) {
    locationInput.value = e.state.queryString;
    getNearestLocationsByString();
  }
});

window.addEventListener("load", function () {
  const params = getQueryParamsFromUrl();
  const queryString = params["q"] || defaultQuery;
  locationInput.value = decodeURI(queryString);
  getNearestLocationsByString();
});

locationInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    getNearestLocationsByString();
    // const locationInput = (<HTMLInputElement>document.getElementById('location-input')).value;
    // var isValidZip = /(^\d{5}$)/.test(locationInput);
    // if (isValidZip) {
    //   console.log(isValidZip, locationInput);
    //   getNearestLocationsByString();
    // }
    // else{
    //   console.log("else", isValidZip, locationInput);
    // }
  }
});

if (loadLocationsOnLoad) {
  getLocations();
}

if (enableAutocomplete) {
  const autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("location-input"),
    {
      options: {
        //types: ["(regions)"],
        componentRestrictions: {'country': "us"}
      },
    }
  );
  autocomplete.addListener("place_changed", () => {
    if (!isLoading) {
      getNearestLocationsByString();
      // const locationInput = (<HTMLInputElement>document.getElementById('location-input')).value;
      // var isValidZip = /(^\d{5}$)/.test(locationInput);
      // if (isValidZip) {
      //   console.log(isValidZip, locationInput);
      //   getNearestLocationsByString();
      // }
      // else{
      //   console.log("else", isValidZip, locationInput);
      //   var errorText = document.getElementById("error-text-section");
      //   errorText.innerHTML = "";
      //   const p = document.createElement("p");
      //   const node = document.createTextNode("Please enter valid ZIP code.");
      //   p.appendChild(node);
      //   errorText.appendChild(p);
      // }
    }
  });
}
