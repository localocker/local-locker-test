
  var limit = 5;
  var radius = 50;
  const defaultQuery = "Manhattan";
  var locationInput = document.getElementById("location-input");
  var searchButton = document.getElementById("search-location-button");
  var locationNoun = 'Locations';
  var locationNounPlural = 'Locations';

  // Live Api query variables.
  var liveAPIKey = c1be28fe46a4efb864aa9d8583108490;
  var savedFilterId = null;
  var entityTypes = "locations";
  var loadLocationsOnLoad = false;
  var enableAutocomplete = true;
  var base_url = "https://liveapi.yext.com/v2/accounts/me/";
  var useMiles = true;

  function getLocationOptions() {
    return {
    'cardTitle': {
      'value': 'name',
      'contentSource': 'FIELD'
    },
    'cardTitleLinkUrl': { 
        'value': '/',
        'contentSource': 'text'
    },
    'hours': { 
        'value': 'hours',
        'contentSource': 'FIELD'
     },
    'address': { 
        'value': 'address', 
        'contentSource': 'FIELD' 
    },
    'phoneNumber': { 
        'value': 'mainPhone',
        'contentSource': 'FIELD' 
    },
    'getDirectionsLabel': {
      'value': 'Get Directions',
      'contentSource': 'text'
    },
    'coordinates': { 
        'value': '{geocodedCoordinate}', 
        'contentSource': 'FIELD'
    },
    'viewDetailsLinkText': {
      'value': 'View Details',
      'contentSource': 'text'
    },
    'viewDetailsLinkUrl': { 
        'value': '/',
         'contentSource': 'text'
    },
    };
  }
  

  function unescapeHtmlString(html) {
    const dom = new DOMParser().parseFromString(html, "text/html").documentElement.textContent;
    return dom.documentElement ? dom.documentElement.textContent : '';
  }

  // Make sure params are acceptable
  if (limit > 50) limit = 50;
  if (limit < 5) limit = 5;
  if (radius > 500) radius = 500;
  if (radius < 1) limit = 1;
  var selectedLocationIndex = -1;
  var currentLatitude = 0.0;
  var currentLongitude = 0.0;

  var isLoading = false;
  var locations = [];

  searchButton.addEventListener('click', function() {
    getNearestLocationsByString();
  });

  function startLoading() {
    isLoading = true;

    [].slice.call(document.querySelectorAll('.spinner') || []).forEach(function(el){
      el.style.visibility = 'visible';
    });
    [].slice.call(document.querySelectorAll('.search-center') || []).forEach(function(el){
      el.innerHTML = '';
    });
    [].slice.call(document.querySelectorAll('.result-list') || []).forEach(function(el){
      el.style.visibility = 'hidden';
    });
    locationInput.disabled = true;
    [].slice.call(document.querySelectorAll('.search') || []).forEach(function(el){
      el.classList.add('disabled');
    });
  }

  function stopLoading() {
    isLoading = false;

    [].slice.call(document.querySelectorAll('.spinner') || []).forEach(function(el){
      el.style.visibility = 'hidden';
    });
    [].slice.call(document.querySelectorAll('.result-list') || []).forEach(function(el){
      el.style.visibility = 'visible';
    });
    locationInput.disabled = false;
    [].slice.call(document.querySelectorAll('.search') || []).forEach(function(el){
      el.classList.remove('disabled');
    });
  }

  function formatPhone(phoneNumberString, countryCode) {
    if(!libphonenumber.isSupportedCountry(countryCode)){
      return phoneNumberString
    }
    const phoneNumber = libphonenumber.parsePhoneNumberFromString(phoneNumberString, countryCode);
    return phoneNumber.format("NATIONAL");
  }

  function formatNumber(numberString) {
    return numberString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatMiOrKm(miles, kilometers) {
    if (useMiles) {
      return miles.toFixed(0) + " mi.";
    } else {
      return kilometers.toFixed(0) + " km.";
    }
  }

  function timeStringToNumber(timeString) {
    const parts = timeString.split(":");
    const hours = parseInt(parts[0].replace(/\u200E/g, ''),10);
    const minutes = parseInt(parts[1].replace(/\u200E/g, ''),10);
    return hours + minutes / 60;
  }

  // Formats hours function
  // Open · Closes at 5pm
  // Closed · Open at 6am
  function formatOpenNowString(hoursData, utcOffset) {
    const now = getYextTimeWithUtcOffset(utcOffset);

    const tomorrow = new Date(now.getTime() + 60 * 60 * 24 * 1000);
    const yesterday = new Date(now.getTime() - 60 * 60 * 24 * 1000);
    const nowTimeNumber = now.getHours() + now.getMinutes()/60;


    function getIntervalOnDate(date) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

      const dateString = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
      const dayOfWeekString = days[date.getDay()];

      // Check for holiday
      if (hoursData.holidayHours) {
        for (let i = 0; i < hoursData.holidayHours.length; i++) {
          const holiday = hoursData.holidayHours[i];
          if (holiday.date == dateString) {
            if (holiday.openIntervals) {
              return holiday.openIntervals;
            } else if (holiday.isClosed === true) {
              return null; // On holiday but closed
            }
          }
        }
      }

      // Not on holiday
      if (hoursData[dayOfWeekString] && hoursData[dayOfWeekString].openIntervals) {
        return hoursData[dayOfWeekString].openIntervals;
      } else {
        return null;
      }
    }
    const intervalsToday = getIntervalOnDate(now);
    const intervalsTomorrow = getIntervalOnDate(tomorrow);
    const intervalsYesterday = getIntervalOnDate(yesterday);
    let openRightNow = false;
    let currentInterval = null;
    let nextInterval = null;

    if (intervalsYesterday) {
      for (let i = 0; i < intervalsYesterday.length; i++) {
        const interval = intervalsYesterday[i];
        const startIntervalNumber = timeStringToNumber(interval.start);
        const endIntervalNumber = timeStringToNumber(interval.end);

        // If end overflows to the next day (i.e. today).
        if (endIntervalNumber < startIntervalNumber) {
          if (nowTimeNumber < endIntervalNumber) {
            currentInterval = interval;
            openRightNow = true;
          }
        }
      }
    }

    // Assumes no overlapping intervals
    if (intervalsToday) {
      for (let i = 0; i < intervalsToday.length; i++) {
        const interval = intervalsToday[i];
        const startIntervalNumber = timeStringToNumber(interval.start);
        const endIntervalNumber = timeStringToNumber(interval.end);

        // If current time doesn't belong to one of yesterdays interval.
        if (currentInterval == null) {
          if (endIntervalNumber < startIntervalNumber) {
            if (nowTimeNumber >= startIntervalNumber) {
              currentInterval = interval;
              openRightNow = true;
            }
          } else if (nowTimeNumber >= startIntervalNumber
            && nowTimeNumber < endIntervalNumber) {
            currentInterval = interval;
            openRightNow = true;
          }
        }

        if (nextInterval == null) {
          if (startIntervalNumber > nowTimeNumber) {
            nextInterval = interval
          }
        } else {
          if (startIntervalNumber > nowTimeNumber
            && startIntervalNumber < timeStringToNumber(nextInterval.start)) {
            nextInterval = interval;
          }
        }
      }
    }

    let nextIsTomorrow = false;

    // If no more intervals in the day
    if (nextInterval == null) {
      if (intervalsTomorrow) {
        if (intervalsTomorrow.length > 0) {
          nextInterval = intervalsTomorrow[0];
          nextIsTomorrow = true;
        }
      }
    }

    let hoursString = '';

    function formatTime(time) {
      const tempDate = new Date("January 1, 2020 " + time)
      const localeString = 'en-US';
      const tempTime = tempDate.toLocaleTimeString(localeString.replace('_', '-'), { hour: "numeric", minute: "numeric" });
      return tempTime;
    }

    if (nextInterval) {
      if (openRightNow) {
        // Check first for a 24-hour interval, then check for open past midnight
        if (currentInterval.start == '00:00' && currentInterval.end == '23:59') {
          hoursString += '<strong>Open 24 hours</strong>';
        } else if (nextInterval.start == '00:00' && currentInterval.end == '23:59') {
          hoursString += '<strong>Open</strong> · Closes at [closingTime] tomorrow';
          hoursString = hoursString.replace("[closingTime]", formatTime(currentInterval.end));
        } else {
          hoursString +=
            '<strong>Open</strong> · Closes at [closingTime]';
          hoursString = hoursString.replace("[closingTime]", formatTime(currentInterval.end));
        }
      } else {
        if (nextIsTomorrow) {
          hoursString +=
            '<strong>Closed</strong> · Opens at [openingTime] tomorrow';
          hoursString = hoursString.replace("[openingTime]", formatTime(nextInterval.start));
        } else {
          hoursString +=
            '<strong>Closed</strong> · Opens at [openingTime]';
          hoursString = hoursString.replace("[openingTime]", formatTime(nextInterval.start));
        }
      }
    }

    return hoursString;
  }

  function getValueFromPath(object, path) {
    return path.split('.').reduce(
      function(obj, pth) {
        return typeof obj == "undefined"
          || obj == null ? null : obj[pth]
      },
      object
    );
  }

  function processParameterizedRichTextContentMapping(entityProfile, mapping) {
    const fieldValue = getValueFromPath(entityProfile, mapping.value);
    return mapping.isRtf ? RtfConverter.toHTML(fieldValue) : fieldValue
  }

  function getYextTimeWithUtcOffset(entityUtcOffsetSeconds) {
    const now = new Date();
    let utcOffset = 0;
    if (entityUtcOffsetSeconds) {
      utcOffset = entityUtcOffsetSeconds * 1000;
    }
    if (utcOffset !== 0) {
      const localUtcOffset = now.getTimezoneOffset() * 60 * 1000;
      return new Date(now.valueOf() + utcOffset + localUtcOffset);
    }
    return now;
  }

  // Parses an offset formatted like {+/-}{04}:{00}
  function parseTimeZoneUtcOffset(timeString) {
    if (!timeString) {
      return 0;
    }
    const parts = timeString.split(":");
    const hours = parseInt(parts[0].replace(/\u200E/g, ''), 10);
    const minutes = parseInt(parts[1].replace(/\u200E/g, ''), 10);
    if (hours < 0) {
      return -(Math.abs(hours) + minutes / 60) * 60 * 60;
    }
    return (hours + minutes / 60) * 60 * 60;
  }

  function locationJSONtoHTML(entityProfile, index, locationOptions) {
    const cardTitleValue =
      locationOptions.cardTitle.contentSource === 'FIELD'
        ? processParameterizedRichTextContentMapping(entityProfile, locationOptions.cardTitle.value)
        : locationOptions.cardTitle.value.value;

    const getDirectionsLabelValue =
      locationOptions.getDirectionsLabel.contentSource === 'FIELD'
        ? processParameterizedRichTextContentMapping(entityProfile, locationOptions.getDirectionsLabel.value)
        : locationOptions.getDirectionsLabel.value.value;

    const viewDetailsLinkTextValue =
      locationOptions.viewDetailsLinkText.contentSource === 'FIELD'
        ? processParameterizedRichTextContentMapping(entityProfile, locationOptions.viewDetailsLinkText.value)
        : locationOptions.viewDetailsLinkText.value.value;

    let cardTitleLinkUrlValue =
      locationOptions['cardTitleLinkUrl']['contentSource'] === 'FIELD'
        ? getValueFromPath(entityProfile, locationOptions['cardTitleLinkUrl']['value'])
        : locationOptions['cardTitleLinkUrl']['value'];
    const hoursValue =
      locationOptions['hours']['contentSource'] === 'FIELD'
        ? getValueFromPath(entityProfile, locationOptions['hours']['value'])
        : locationOptions['hours']['value'];
    const addressValue =
      locationOptions['address']['contentSource'] === 'FIELD'
        ? getValueFromPath(entityProfile, locationOptions['address']['value'])
        : locationOptions['address']['value'];
    const phoneNumberValue =
      locationOptions['phoneNumber']['contentSource'] === 'FIELD'
        ? getValueFromPath(entityProfile, locationOptions['phoneNumber']['value'])
        : locationOptions['phoneNumber']['value'];
    let viewDetailsLinkUrlValue =
      locationOptions['viewDetailsLinkUrl']['contentSource'] === 'FIELD'
        ? getValueFromPath(entityProfile, locationOptions['viewDetailsLinkUrl']['value'])
        : locationOptions['viewDetailsLinkUrl']['value'];

    let html = '<div class="lp-param-results lp-subparam-cardTitle lp-subparam-cardTitleLinkUrl">';
    if (cardTitleLinkUrlValue && cardTitleValue) {
      if (cardTitleLinkUrlValue['url']) {
          cardTitleLinkUrlValue = cardTitleLinkUrlValue['url']
      }
      html +=
        '<div class="name">'
        + '<a href="' + cardTitleLinkUrlValue + '">'
        + cardTitleValue
        + '</a></div>';
    } else if (cardTitleValue) {
      html += '<div class="name">' + cardTitleValue + '</div>';
    }
    html += '</div>';

    if (hoursValue) {
      const offset = getValueFromPath(entityProfile, 'timeZoneUtcOffset');
      const parsedOffset = parseTimeZoneUtcOffset(offset);
      html += '<div class="lp-param-results lp-subparam-hours">';
      html += '<div class="open-now-string">' + formatOpenNowString(hoursValue, parsedOffset) + '</div>';
      html += '</div>';
    }

    const localeString = 'en-US';
    html += i18n.addressForCountry({locale: localeString, profile: {address: addressValue}, regionAbbr: false, derivedData: {address: addressValue}});

    html += '<div class="lp-param-results lp-subparam-phoneNumber">';
    if (phoneNumberValue) {
      const formattedPhoneNumber = formatPhone(phoneNumberValue, addressValue.countryCode);
      if (formattedPhoneNumber) {
        html += '<div class="phone">' + formattedPhoneNumber + '</div>';
      }
    }
    html += '</div>';

    const singleLineAddress = entityProfile.name + ' ' + addressValue.line1 + ' ' + (addressValue.line2 ? addressValue.line2 + ' ' : '') + addressValue.city + ' ' + addressValue.region + ' ' + addressValue.postalCode;
    html += '<div class="lp-param-results lp-subparam-getDirectionsLabel">';
    html += '<div class="link"><a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=' + singleLineAddress + '">' + getDirectionsLabelValue + '</a></div>';
    html += '</div>'
    if (viewDetailsLinkUrlValue && viewDetailsLinkTextValue) {
      // Url value is URL object and not url.
      if (viewDetailsLinkUrlValue['url']) {
          viewDetailsLinkUrlValue = viewDetailsLinkUrlValue['url'];
      }
      html += '<div class="lp-param-results lp-subparam-viewDetailsLinkText lp-subparam-viewDetailsLinkUrl">';
      html += '<div class="lp-param lp-param-viewDetailsLabel link"><a href="' + viewDetailsLinkUrlValue + '">' + viewDetailsLinkTextValue + '</a></div>';
      html += '</div>'
    }


    // Add center column
    html = '<div class="center-column">' + html + '</div>';

    // Add left and right column
    if (entityProfile.__distance) {
      html = '<div class="left-column">' + (index + 1) + '.</div>' + html + '<div class="right-column"><div class="distance">' + formatMiOrKm(entityProfile.__distance.distanceMiles, entityProfile.__distance.distanceKilometers) + '</div></div>';
    }

    return '<div class="result" onmouseenter="highlightLocation(' + index + ', false, false)" onclick="highlightLocation(' + index + ', false, true)">' + html + '</div>';
  }

  // Renders each location the the result-list-inner html
  function renderLocations(locations, append, viewMore) {
    if (!append) {
      [].slice.call(document.querySelectorAll('.result-list-inner') || []).forEach(function(el){
        el.innerHTML = '';
      });
    }

    for (var index = 0; index < locations.length; index++) {
      var location = locations[index];
      [].slice.call(document.querySelectorAll('.result-list-inner') || []).forEach(function(el){
        el.innerHTML += locationJSONtoHTML(location, index, getLocationOptions());
      });
    }

    if (viewMore) {
      [].slice.call(document.querySelectorAll('.result-list-inner') || []).forEach(function(el){
        el.innerHTML += '<div><div class="btn btn-link btn-block">View More</div></div>';
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
      return '0 [locationType]';
    } else {
        return '[formattedVisible] of [formattedTotal] [locationType]';
    }
  }

  // Renders details of the search
  function renderSearchDetail(geo, visible, total, queryString) {
    // x of y locations near "New York, NY"
    // x  locations near "New York, NY"
    // x  locations near "New York, NY"

    let locationType = locationNoun;
    if (total === 0 || total > 1) {
      if (locationNounPlural !== "") {
        locationType = locationNounPlural;
      } else {
        locationType += "s";
      }
    }

    let formattedVisible = formatNumber(visible);
    let formattedTotal = formatNumber(total);

    let searchDetailMessage;
    if (geo) {
      if (geo.address.city !== '') {
        searchDetailMessage = searchDetailMessageForCityAndRegion(total);
        searchDetailMessage = searchDetailMessage.replace("[city]", geo.address.city);
        searchDetailMessage = searchDetailMessage.replace("[region]", geo.address.region);
      } else {
        let location = '';
        if (geo.address.region) {
          location = geo.address.region;
        } else if (geo.address.country && queryString) {
          location = queryString;
        } else if (geo.address.country) {
          location = geo.address.country;
        }
        if (location !== '') {
          searchDetailMessage = searchDetailMessageForArea(total);
          searchDetailMessage = searchDetailMessage.replace("[location]", location);
        }
      }
    } else {
      searchDetailMessage = searchDetailMessageNoGeo(total);
    }
    searchDetailMessage = searchDetailMessage.replace("[locationType]", locationType);
    searchDetailMessage = searchDetailMessage.replace("[formattedVisible]", formattedVisible);
    searchDetailMessage = searchDetailMessage.replace("[formattedTotal]", formattedTotal);

    [].slice.call(document.querySelectorAll('.search-center') || []).forEach(function(el){
      el.innerHTML = '';
    });
    [].slice.call(document.querySelectorAll('.search-center') || []).forEach(function(el){
      el.innerHTML = searchDetailMessage;
    });
  }

  function getRequest(request_url, queryString) {

    // Add query string to URL
    if (queryString !== null) {
      const newUrl = window.location.href.replace(/(\?.*)?$/, '?q=queryString'.replace('queryString', queryString));
      if (window.history.state && window.history.state.queryString !== queryString) {
        window.history.pushState({'queryString': queryString}, '', newUrl);
      } else {
        window.history.replaceState({'queryString': queryString}, '', newUrl);
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

    $.ajax({
      url: request_url,
      type: "GET",
      timeout: 5000,
      success: function (data) {
        locations = [];
        for (var i = 0; i < data.response.entities.length; i++) {
          var location = data.response.entities[i];

          // Add location distance if it exists
          if (data.response.distances) {
            location.__distance = data.response.distances[i];
          }
          locations.push(location);
        }
        // Update Panel
        renderLocations(locations, false, false);
        renderSearchDetail(data.response.geo, locations.length, data.response.count, queryString);

        // Update Map
        addMarkersToMap(locations);

        if (locations.length == 0) {
          centerOnGeo(data.response.geo);
        }
        [].slice.call(document.querySelectorAll('.error-text') || []).forEach(function(el){
          el.textContent = '';
        });
        stopLoading();
      },
      error: function (request, status, error) {
        stopLoading();
        if (request.responseJSON && request.responseJSON.meta.errors.length > 0) {
          alert(request.responseJSON.meta.errors[0]["message"]);
        } else if (status === "timeout"){
          alert('Unable to retrieve results. Please wait a few seconds and'
                  + ' try again.');
        }
        else {
          alert('Invalid Live API Key');
        }
      }
    })
  }

  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.queryString) {
      locationInput.value = e.state.queryString;
      getNearestLocationsByString();
    }
  });

  window.addEventListener('load', function() {
    const params = getQueryParamsFromUrl();
    const queryString = params['q'] || defaultQuery;
    locationInput.value = decodeURI(queryString);
    getNearestLocationsByString();
  });

  function getQueryParamsFromUrl() {
    let params = {};
    window.location.href.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      function(match, key, value) {
        params[key] = decodeURI(value);
    });
    return params;
  }

  function getNearestLocationsByString() {
    const queryString = locationInput.value;
    if (queryString.trim() !== "") {
      var request_url = this.base_url + "entities/geosearch";
      request_url += "?radius=" + radius;
      request_url += "&location=" + queryString;
      request_url += "&limit=" + limit;
      this.getRequest(request_url, queryString);
    } else {
      // Error Message
    }
  }

  // Get locations by lat lng (automatically fired if the user grants acceess)
  function getNearestLatLng(position) {
    [].slice.call(document.querySelectorAll('.error-text') || []).forEach(function(el){
      el.textContent = '';
    });
    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;
    var request_url = this.base_url + "entities/geosearch";
    request_url += "?radius=" + radius;
    request_url += "&location=" + position.coords.latitude + ", " + position.coords.longitude;
    request_url += "&limit=" + limit;
    this.getRequest(request_url, null);
  }

  // Gets a list of locations. Only renders if it's a complete list. This avoids a dumb looking map for accounts with a ton of locations.
  function getLocations() {
    var request_url = this.base_url + "entities" + "?limit=" + limit + '&sortBy=[{"name":"ASCENDING"}]';
    this.getRequest(request_url, null);
  }

  locationInput.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
      getNearestLocationsByString();
    }
  });

  function getUsersLocation() {
    if (navigator.geolocation) {
      startLoading();
      function error(error) {
        [].slice.call(document.querySelectorAll('.error-text') || []).forEach(function(el){
          el.textContent = 'Unable to determine your location. Please try entering a location in the search bar.';
        });
        stopLoading();
      }
      navigator.geolocation.getCurrentPosition(getNearestLatLng, error, { timeout: 10000 });
    }
  }

  // Map Configuration
  var markers = [];

  function centerOnGeo(geo) {
    var lat, lng;
    if (geo && geo.coordinate) {
      lat = geo.coordinate.latitude;
      lng = geo.coordinate.longitude;
    } else {
      lat = currentLatitude;
      lng = currentLongitude;
    }
    [].slice.call(document.querySelectorAll('.error-text') || []).forEach(function(el){
      el.textContent = '';
    });
    map.setCenter({ lat: lat, lng: lng });
    map.setZoom(7);
  }

  let pinStyles;
  let marker_icon;
  let selected_marker_icon;

  function addMarkersToMap(locations) {
    bounds = new google.maps.LatLngBounds();

    for (let index = 0; index < markers.length; index++) {
      var marker = markers[index];
      marker.setMap(null);
    }
    markers = [];
    

    const coordinates = { 'value': 'geocodedCoordinate', 'contentSource': 'FIELD' };

    
      pinStyles = {
        fill: '#ea4236', //default google red
        stroke: '#fff',
        text: '#fff',
        fill_selected: 'yellow',
        stroke_selected: 'gold',
        text_selected: 'blue'
      };
   

    
    marker_icon = {
      // default google pin path
      path: 'M 7.75 -37.5 c -4.5 -4 -11 -4 -15.5 0 c -4.5 3.5 -6 10 -3 15 l 5 8.5 c 2.5 4 4.5 8 5 13 l 1 1 l 0.5 -1 s 0 0 0 0 c 0.5 -4.5 2.5 -8.5 5 -12.5 l 5 -9 c 3 -5 1.5 -11.5 -3 -15',
      fillColor: pinStyles.fill,
      scale: 1.1,
      fillOpacity: 1,
      strokeColor: pinStyles.stroke,
      strokeWeight: 1,
      labelOrigin: new google.maps.Point(0,-25)
    }

    selected_marker_icon = {
      path: 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
      fillColor: pinStyles.fill_selected,
      fillOpacity: 0.8,
      scale: 0.75,
      strokeColor: pinStyles.stroke_selected,
      strokeWeight: 1,
      labelOrigin: new google.maps.Point(0,-25),
    };

    for (let index = 0; index < locations.length; index++) {
      var location = locations[index];
      let coordinatesValue = coordinates['value'];
      coordinatesValue  = coordinates['contentSource'] === 'FIELD' ? getValueFromPath(location, coordinatesValue) : coordinatesValue;
      if (coordinatesValue) {
        marker = new google.maps.Marker({
          position: { lat: coordinatesValue.latitude, lng: coordinatesValue.longitude },
          map: map,
          icon: marker_icon,
          label: {
            text: String(index + 1),
            color: pinStyles.text
          },
          optimized: false
        });

        selected_marker = new google.maps.Marker({
          position: { lat: coordinatesValue.latitude, lng: coordinatesValue.longitude },
          map: map,
          icon: selected_marker_icon,
          label: {
            text: String(index + 1),
            color: pinStyles.text_selected
          },
          optimized: false
        });

        selected_marker.setVisible(false);

        bounds.extend(marker.position);

        google.maps.event.addListener(marker, 'click', function () {
          highlightLocation(index, true, false);
        });

        google.maps.event.addListener(selected_marker, 'click', function () {
          highlightLocation(index, true, false);
        });

        google.maps.event.addListener(marker, 'mouseover', function () {
          highlightLocation(index, false, false);
        });

        markers.push(marker);
      }
    };

    map.fitBounds(bounds);
  }

  function scrollToRow(index) {
      let result = [].slice.call(document.querySelectorAll('.result') || [])[0];
      let offset = [].slice.call(document.querySelectorAll('.result') || [])[index].offsetTop - result.offsetTop;
      [].slice.call(document.querySelectorAll('.result-list') || []).forEach(function(el){
        el.scrollTop = offset;
      });
  }

  function highlightLocation(index, shouldScrollToRow, shouldCenterMap) {
    if (selectedLocationIndex == index) {
      // No Change (just center map or scroll)
      if (shouldCenterMap) {
        map.setCenter(marker.position);
      }

      if (shouldScrollToRow) {
        scrollToRow(index)
      }
    } else {
      const prevIndex = selectedLocationIndex;
      selectedLocationIndex = index;

      [].slice.call(document.querySelectorAll('.result') || []).forEach(function(el){
        el.classList.remove('selected');
      });
      [].slice.call(document.querySelectorAll('.result')[index].classList.add('selected') || []);

      if (shouldScrollToRow) {
        scrollToRow(index)
      }

      // Update Map
      if (prevIndex !== -1) {
        const prevMarker = markers[prevIndex];
        // Breifly disables mouseevents to prevent infinite mouseover looping for overlapped markers
        prevMarker.setClickable(false);
        prevMarker.setIcon(marker_icon);
        prevMarker.setLabel({text: String(prevIndex + 1), color: pinStyles.text})
        prevMarker.setZIndex(null);

        setTimeout(function() {
          prevMarker.setClickable(true)
        }, 50)
      }

      const selectedMarker = markers[selectedLocationIndex];
      selectedMarker.setIcon(selected_marker_icon)
      selectedMarker.setLabel({text: String(selectedLocationIndex + 1), color: pinStyles.text_selected})
      selectedMarker.setZIndex(999);

      if (shouldCenterMap) {
        map.setCenter(marker.position);
      }
    }
  }

  // Autocomplete
  function autocompleteChanged() {
    // Clicked result
    if (!isLoading) {
      getNearestLocationsByString();
    }
  }

  function hexToRgb(hex) {
    const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16)
    }
  }

  // Postive values >> lighten
  // Negative values >> darken
  function changeColor(hex, amt) {
    const rgb = hexToRgb(hex);

    Object.keys(rgb).forEach(function(key) {
      let c = rgb[key];
      // Add amt to color value, min/max at 0/255
      c += amt;
      if (c > 255) c = 255;
      else if (c < 0) c = 0;

      // Convert RGB value back to hex string
      rgb[key] = ((c.toString(16).length==1) ? "0"+c.toString(16) : c.toString(16));
    });

    return '#' + rgb.r + rgb.g + rgb.b;
  }

  function getCustomPinColor(hex) {
    // Converts hex to RGB values
    const rgb = hexToRgb(hex);

    // Calcs perceived brightness using the sRGB Luma method
    const lightness = (rgb.r * 0.2126 + rgb.g * 0.7152 + rgb.b * 0.0722) / 255;
    const isDark = lightness < 0.5;

    if (isDark) {
      return {
        fill: hex,
        stroke: '#fff',
        text: '#fff',
        fill_selected: changeColor(hex, 150),
        stroke_selected: hex,
        text_selected: '#000'
      }
    } else {
      const darker = changeColor(hex, -150);
      return {
        fill: hex,
        stroke: darker,
        text: '#000',
        fill_selected: darker,
        stroke_selected: '#fff',
        text_selected: '#fff'
      }
    }
  }

  if (loadLocationsOnLoad) {
    getLocations();
  }
