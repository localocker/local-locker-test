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
import axios from "axios";

var valid = true;

const onSearch = async (address) => {
  const addressInfo = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDZNQlSlEIkFAct5VzUtsP4dSbvOr2bE18`
  );
  if (
    addressInfo?.data?.results[0]?.types &&
    addressInfo.data.results[0].types.some(
      (type) =>
        type === "street_address" ||
        type === "geocode" ||
        type === "postal_code" ||
        type === "premise" ||
        type === "intersection" ||
        type === "route"
    )
  ) {
    valid = true;
    getNearestLocationsByString();
  } else {
      [].slice
        .call(document.querySelectorAll(".error-text") || [])
        .forEach(function (el) {
          el.textContent =
            "Please enter a ZIP code or address.";
        });
    }
  };


searchButton.addEventListener("click", function () {
  const queryString = locationInput.value;
  onSearch(queryString);
  //getNearestLocationsByString();

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
    const queryString = locationInput.value;
    onSearch(queryString);
    valid = false;
   // getNearestLocationsByString();

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
  else if (e.key === "Backspace" || e.key === "Delete") {
    [].slice
    .call(document.querySelectorAll(".error-text") || [])
    .forEach(function (el) {
      el.textContent =
        "";
    });
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

      if (valid) {
        getNearestLocationsByString();
      }

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
