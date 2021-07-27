import {
  CountryCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { useMiles } from "./constants";

export function unescapeHtmlString(html: string): string {
  const dom = new DOMParser().parseFromString(html, "text/html");
  return dom.documentElement ? dom.documentElement.textContent : "";
}

export function formatPhone(
  phoneNumberString: string,
  countryCode: CountryCode
): string {
  if (!isSupportedCountry(countryCode)) {
    return phoneNumberString;
  }
  const phoneNumber = parsePhoneNumberFromString(
    phoneNumberString,
    countryCode
  );
  return phoneNumber.format("NATIONAL");
}

export function formatNumber(numberString) {
  return numberString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatMiOrKm(miles: number, kilometers: number): string {
  if (useMiles) {
    return miles.toFixed(0) + " mi.";
  } else {
    return kilometers.toFixed(0) + " km.";
  }
}

export function getValueFromPath(object, path: string) {
  return path.split(".").reduce(function (obj, pth) {
    return typeof obj == "undefined" || obj == null ? null : obj[pth];
  }, object);
}

export function getQueryParamsFromUrl() {
  let params = {};
  window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    (match, key, value) => (params[key] = decodeURI(value))
  );
  return params;
}

export function scrollToRow(index) {
  let result = [].slice.call(document.querySelectorAll(".result") || [])[0];
  let offset =
    [].slice.call(document.querySelectorAll(".result") || [])[index].offsetTop -
    result.offsetTop;
  [].slice
    .call(document.querySelectorAll(".result-list") || [])
    .forEach(function (el) {
      el.scrollTop = offset;
    });
}
