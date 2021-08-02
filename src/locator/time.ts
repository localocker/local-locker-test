// Formats hours function
// Open · Closes at 5pm
// Closed · Open at 6am
export function formatOpenNowString(hoursData, utcOffset) {
  const now = getYextTimeWithUtcOffset(utcOffset);

  const tomorrow = new Date(now.getTime() + 60 * 60 * 24 * 1000);
  const yesterday = new Date(now.getTime() - 60 * 60 * 24 * 1000);
  const nowTimeNumber = now.getHours() + now.getMinutes() / 60;

  const intervalsToday = getIntervalOnDate(now, hoursData);
  const intervalsTomorrow = getIntervalOnDate(tomorrow, hoursData);
  const intervalsYesterday = getIntervalOnDate(yesterday, hoursData);
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
        } else if (
          nowTimeNumber >= startIntervalNumber &&
          nowTimeNumber < endIntervalNumber
        ) {
          currentInterval = interval;
          openRightNow = true;
        }
      }

      if (nextInterval == null) {
        if (startIntervalNumber > nowTimeNumber) {
          nextInterval = interval;
        }
      } else {
        if (
          startIntervalNumber > nowTimeNumber &&
          startIntervalNumber < timeStringToNumber(nextInterval.start)
        ) {
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

  let hoursString = "";

  if (nextInterval) {
    if (openRightNow) {
      // Check first for a 24-hour interval, then check for open past midnight
      if (currentInterval.start == "00:00" && currentInterval.end == "23:59") {
        hoursString += "<strong>Open 24 hours</strong>";
      } else if (
        nextInterval.start == "00:00" &&
        currentInterval.end == "23:59"
      ) {
        hoursString +=
          "<strong>Open</strong> · Closes at [closingTime] tomorrow";
        hoursString = hoursString.replace(
          "[closingTime]",
          formatTime(currentInterval.end)
        );
      } else {
        hoursString += "<strong>Open</strong> · Closes at [closingTime]";
        hoursString = hoursString.replace(
          "[closingTime]",
          formatTime(currentInterval.end)
        );
      }
    } else {
      if (nextIsTomorrow) {
        hoursString +=
          "<strong>Closed</strong> · Opens at [openingTime] tomorrow";
        hoursString = hoursString.replace(
          "[openingTime]",
          formatTime(nextInterval.start)
        );
      } else {
        hoursString += "<strong>Closed</strong> · Opens at [openingTime]";
        hoursString = hoursString.replace(
          "[openingTime]",
          formatTime(nextInterval.start)
        );
      }
    }
  }

  return hoursString;
}

function formatTime(time) {
  const tempDate = new Date("January 1, 2020 " + time);
  const localeString = "en-US";
  return tempDate.toLocaleTimeString(localeString.replace("_", "-"), {
    hour: "numeric",
    minute: "numeric",
  });
}

function timeStringToNumber(timeString: string): number {
  const parts = timeString.split(":");
  const hours = parseInt(parts[0].replace(/\u200E/g, ""), 10);
  const minutes = parseInt(parts[1].replace(/\u200E/g, ""), 10);
  return hours + minutes / 60;
}

function getYextTimeWithUtcOffset(entityUtcOffsetSeconds: number): Date {
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
  const hours = parseInt(parts[0].replace(/\u200E/g, ""), 10);
  const minutes = parseInt(parts[1].replace(/\u200E/g, ""), 10);
  if (hours < 0) {
    return -(Math.abs(hours) + minutes / 60) * 60 * 60;
  }
  return (hours + minutes / 60) * 60 * 60;
}

function getIntervalOnDate(date, hoursData) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const dateString =
    year +
    "-" +
    (month < 10 ? "0" + month : month) +
    "-" +
    (day < 10 ? "0" + day : day);
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
