// formats firestore timestamps into human readable strings
export function formatFSTimestamp(timestamp, method) {

  const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
  const date = new Date(milliseconds);

  if (method === 1) {
    // Format the date as DD/MM/YYYY hh:mm:ss
    const formatter = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = formatter.formatToParts(date);

    const day = parts.find((part) => part.type === 'day').value;
    const month = parts.find((part) => part.type === 'month').value;
    const year = parts.find((part) => part.type === 'year').value;
    const hour = parts.find((part) => part.type === 'hour').value;
    const minute = parts.find((part) => part.type === 'minute').value;
    const second = parts.find((part) => part.type === 'second').value;

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  } else if (method === 2) {
    // Format the date as "Mon DD, YYYY"
    const formatter = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    // Get the formatted date string
    const formattedDate = formatter.format(date);
    // Replace any leading zero with a space for single-digit days
    const formattedDay = formattedDate.replace(/^0/, ' ');

    return formattedDay;
  } else if (method === 3) {

    // Format the date using Intl.DateTimeFormat
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);

    return formattedDate;
  }
}

export function transformErrorMessage(errorMessage) {
  // Find the last occurrence of "/"
  const lastIndex = errorMessage.lastIndexOf('/');

  if (lastIndex !== -1) {
    // Extract the substring after the last "/"
    let transformedString = errorMessage.substring(lastIndex + 1);

    // Capitalize the first letter of the transformed string
    transformedString = transformedString.charAt(0).toUpperCase() + transformedString.slice(1);

    // Remove hyphens from the transformed string
    transformedString = transformedString.replace(/-/g, ' ');

    return transformedString;
  } else {
    return errorMessage; // No "/" found, return the original string
  }
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getDateWeekAgo() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return sevenDaysAgo
}

export function formatGenres(genre_ids, genreCodes) {
  const genres = [];

  genre_ids.forEach((id) => {
    const matchingGenre = genreCodes.find((genre) => genre.value === id);
    if (matchingGenre) {
      genres.push(matchingGenre.text);
    }
  });

  return genres.join(", ");
}

export function formatTime(totalMinutes, method) {
  if (method === "DHM") {

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const remainingMinutes = totalMinutes % 60;

    let timeString = '';

    if (days > 0) {
      timeString += `${days} days `;
    }

    if (hours > 0) {
      timeString += `${hours} hours `;
    }

    if (remainingMinutes > 0 || timeString === '') {
      timeString += `${remainingMinutes} minutes`;
    }

    return timeString.trim();
  } else if (method === "H") {
    const hours = Math.round(totalMinutes / 60);
    return `${hours} hours`;
  }else if (method === "H2") {
    const hours = Math.round(totalMinutes / 60);
    return hours
  }
}

export function calculateAverage(arr) {
  if (arr.length === 0) {
    return 0; // handle the case where the array is empty to avoid division by zero
  }

  const sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  const average = sum / arr.length;
  const roundedAverage = average.toFixed(2); // Round to two decimal places
  return roundedAverage;
}

export function timestampToDateString(firestoreTimestamp) {
  const date = firestoreTimestamp.toDate();
    
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
