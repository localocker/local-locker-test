function seed() {
    return Date.now() + Math.floor(1000 * Math.random());
  }
  
  function pixelURL(data) {
    data.v = seed();
    let p = '//www.yext-pixel.com/store_pagespixel?product=sites';
    for (var key in data) {
      if (data.hasOwnProperty(key) && !!data[key]) {
        p += `&${key}=${encodeURIComponent(data[key])}`;
      }
    }
  
    return p;
  }
  
  window.trackAnalytics = (businessId, siteId, entityId) => {
    if (isStaging()) {
      return;
    }
  
    var jsonData = {
      'pagesReferrer': window.document.referrer,
      'pageurl': window.location.pathname,
      'eventType': "pageview",
      'businessids': businessId,
      'siteId': siteId,
      'ids': entityId
    };
      
    var pixel = pixelURL(jsonData);
    const px = document.createElement("img");
    px.src = pixel;
    px.style.width = '0';
    px.style.height = '0';
    px.style.position = 'absolute';
    px.alt = '';
    document.body.appendChild(px);
  };