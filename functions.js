export function getTodaysDate() {
  var date = new Date();
  var dateStr =
    ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
    ("00" + date.getDate()).slice(-2) + "/" +
    date.getFullYear() + " " +
    ("00" + date.getHours()).slice(-2) + ":" +
    ("00" + date.getMinutes()).slice(-2) + ":" +
    ("00" + date.getSeconds()).slice(-2);
  return dateStr
}

export function checkType(o, method) {
  if (method === 1) {
    if (o.list_type === "seen") {
      return true
    }
    return false;
  } else {
    if (o.list_type === "watchlist") {
      return true
    }
    return false;
  }
}