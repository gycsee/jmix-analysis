function base64encode(str) {
  if (typeof btoa === 'function') {
    return btoa(str);
  }
  throw new Error('Unable to encode to base64');
}

function serialize(rawParam) {
  if (rawParam == null) {
    return '';
  }
  if (typeof rawParam === 'object') {
    return JSON.stringify(rawParam);
  }
  return rawParam;
}

function encodeGetParams(data) {
  return Object.keys(data)
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(
        serialize(data[key])
      )}`;
    })
    .join('&');
}

function getBasicAuthHeaders(client, secret, locale = 'en') {
  return {
    Authorization: `Basic ${base64encode(`${client}:${secret}`)}`,
    'Accept-Language': locale,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
}

export { encodeGetParams, getBasicAuthHeaders };
