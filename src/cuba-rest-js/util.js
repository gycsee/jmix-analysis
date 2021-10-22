export function base64encode(str) {
  if (typeof btoa === "function") {
    return btoa(str);
  }
  throw new Error("Unable to encode to base64");
}

function serialize(rawParam) {
  if (rawParam == null) {
    return "";
  }
  if (typeof rawParam === "object") {
    return JSON.stringify(rawParam);
  }
  return rawParam;
}

export function encodeGetParams(data) {
  return Object.keys(data)
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(
        serialize(data[key])
      )}`;
    })
    .join("&");
}
