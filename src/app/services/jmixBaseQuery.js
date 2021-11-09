import { encodeGetParams } from './utils'

class JmixRestError extends Error {
  response;

  name = 'JmixRestError';

  constructor({ message, response }) {
    super(message);
    if (response !== undefined) {
      this.response = response;
    }
  }
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject(
    new JmixRestError({ message: response.statusText, response })
  );
}

function throwNormolizedJmixRestError(e) {
  return e.name === 'JmixRestError'
    ? e
    : new JmixRestError({ message: e.message });
}

const jmixBaseQuery = ({ baseUrl } = { baseUrl: '' }) => async (params) => {
  try {
    if (typeof params === 'string') {
      return fetch(`${baseUrl}${params}`)
        .then(checkStatus)
        .then((resp) => resp.json())
        .then()
        .catch(throwNormolizedJmixRestError);
    } else {
      const { method, path, data, fetchOptions } = params;
      let url = `${this.apiUrl}rest/${path}`;
      const settings = {
        method,
        headers: {
          'Accept-Language': this.locale,
        },
        ...fetchOptions,
      };
      if (this.restApiToken) {
        settings.headers.Authorization = `Bearer ${this.restApiToken}`;
      }
      if (
        settings.method === 'POST' ||
        settings.method === 'PUT' ||
        settings.method === 'DELETE'
      ) {
        settings.body = data;
        settings.headers['Content-Type'] = 'application/json; charset=UTF-8';
      }
      if (settings.method === 'GET' && data && Object.keys(data).length > 0) {
        url += `?${encodeGetParams(data)}`;
      }
      const handleAs = fetchOptions ? fetchOptions.handleAs : undefined;
      switch (handleAs) {
        case 'text':
          settings.headers.Accept = 'text/html';
          break;
        case 'json':
          settings.headers.Accept = 'application/json';
          break;
        case 'formData':
          settings.headers.Accept = 'application/json';
          delete settings.headers['Content-Type'];
          break;
        default:
          break;
      }

      const fetchRes = fetch(url, settings).then(this.checkStatus);

      fetchRes.catch((error) => {
        if (this.isTokenExpiredResponse(error.response)) {
          this.clearAuthData();
          this.tokenExpiryListeners.forEach((l) => l());
        }
      });

      return fetchRes
        .then((resp) => {
          if (resp.status === 204) {
            return resp.text();
          }

          switch (handleAs) {
            case 'text':
              return resp.text();
            case 'blob':
              return resp.blob();
            case 'json':
              return resp.json();
            case 'raw':
              return resp;
            default:
              return resp.text();
          }
        })
        .catch(throwNormolizedJmixRestError);
    }
  } catch (axiosError) {
    let err = axiosError;
    return {
      error: { status: err.response?.status, data: err.response?.data },
    };
  }
};
