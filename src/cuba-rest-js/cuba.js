import * as semver from "semver";

import { DefaultStorage } from "./storage";
import { base64encode, encodeGetParams } from "./util";
import { CubaRestError } from "./error";

const apps = [];

/**
 * Retrieve previously initialized app by name.
 * @param {string} appName
 * @returns {CubaApp | null}
 */
export function getApp(appName) {
  const nameToSearch = appName == null ? "" : appName;
  // eslint-disable-next-line no-restricted-syntax
  for (const app of apps) {
    if (app.name === nameToSearch) {
      return app;
    }
  }
  return null;
}

export function getBasicAuthHeaders(client, secret, locale = "en") {
  return {
    "Accept-Language": locale,
    Authorization: `Basic ${base64encode(`${client}:${secret}`)}`,
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  };
}

export function matchesVersion(versionToTest, versionToMatch) {
  const semverToTest = semver.coerce(versionToTest);
  if (!semverToTest) {
    // versionToTest cannot be converted to semver
    return false;
  }

  const semverToMatch = semver.coerce(versionToMatch);
  if (!semverToMatch) {
    // versionToMatch cannot be converted to semver
    throw new Error(
      `Cannot determine required REST API version: value ${versionToMatch} cannot be converted to semver`
    );
  }

  return semver.gte(semverToTest, semverToMatch);
}

export function removeApp(appName) {
  const app = getApp(appName);
  if (!app) {
    throw new Error("App is not found");
  }
  app.cleanup();
  apps.splice(apps.indexOf(app), 1);
}

const throwNormolizedCubaRestError = (e) => {
  throw e.name === "CubaRestError"
    ? e
    : new CubaRestError({ message: e.message });
};

export class CubaApp {
  #NOT_SUPPORTED_BY_API_VERSION = "Not supported by current REST API version";

  #REST_TOKEN_STORAGE_KEY = "cubaAccessToken";

  #USER_NAME_STORAGE_KEY = "cubaUserName";

  #LOCALE_STORAGE_KEY = "cubaLocale";

  messagesCache;

  enumsCache;

  tokenExpiryListeners = [];

  messagesLoadingListeners = [];

  enumsLoadingListeners = [];

  localeChangeListeners = [];

  constructor(
    name = "",
    apiUrl = "/app/rest/",
    restClientId = "client",
    restClientSecret = "secret",
    defaultLocale = "zh",
    storage = new DefaultStorage(),
    apiVersion
  ) {
    this.name = name;
    this.apiUrl = apiUrl;
    this.restClientId = restClientId;
    this.restClientSecret = restClientSecret;
    this.defaultLocale = defaultLocale;
    this.storage = storage;
    this.apiVersion = apiVersion;
  }

  get restApiToken() {
    return this.storage.getItem(`${this.name}_${this.#REST_TOKEN_STORAGE_KEY}`);
  }

  set restApiToken(token) {
    this.storage.setItem(`${this.name}_${this.#REST_TOKEN_STORAGE_KEY}`, token);
  }

  get locale() {
    const storedLocale = this.storage.getItem(
      `${this.name}_${this.#LOCALE_STORAGE_KEY}`
    );
    return storedLocale || this.defaultLocale;
  }

  set locale(locale) {
    this.storage.setItem(`${this.name}_${this.#LOCALE_STORAGE_KEY}`, locale);
    this.localeChangeListeners.forEach((l) => l(this.locale));
  }

  // eslint-disable-next-line class-methods-use-this
  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject(
      new CubaRestError({ message: response.statusText, response })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  isTokenExpiredResponse(resp) {
    return resp && resp.status === 401;
    // && resp.responseJSON
    // && resp.responseJSON.error === 'invalid_token';
  }

  fetch(method, path, data, fetchOptions) {
    let url = `${this.apiUrl}rest/${path}`;
    const settings = {
      method,
      headers: {
        "Accept-Language": this.locale,
      },
      ...fetchOptions,
    };
    if (this.restApiToken) {
      settings.headers.Authorization = `Bearer ${this.restApiToken}`;
    }
    if (
      settings.method === "POST" ||
      settings.method === "PUT" ||
      settings.method === "DELETE"
    ) {
      settings.body = data;
      settings.headers["Content-Type"] = "application/json; charset=UTF-8";
    }
    if (settings.method === "GET" && data && Object.keys(data).length > 0) {
      url += `?${encodeGetParams(data)}`;
    }
    const handleAs = fetchOptions ? fetchOptions.handleAs : undefined;
    switch (handleAs) {
      case "text":
        settings.headers.Accept = "text/html";
        break;
      case "json":
        settings.headers.Accept = "application/json";
        break;
      case "formData":
        settings.headers.Accept = "application/json";
        delete settings.headers["Content-Type"];
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
          case "text":
            return resp.text();
          case "blob":
            return resp.blob();
          case "json":
            return resp.json();
          case "raw":
            return resp;
          default:
            return resp.text();
        }
      })
      .catch(throwNormolizedCubaRestError);
  }

  /**
   * Logs in user and stores token in provided storage.
   * @param {string} login
   * @param {string} password
   * @param {LoginOptions} options You can use custom endpoints e.g. {tokenEndpoint:'ldap/token'}.
   * @returns {Promise<{access_token: string}>}
   */
  login(login, password, tenant, options) {
    if (login == null) {
      login = "";
    }
    if (password == null) {
      password = "";
    }
    const headers = this._getBasicAuthHeaders();
    if (tenant) {
      // 多租户标识
      headers["X-TENANT-CODE"] = tenant;
    }
    const fetchOptions = {
      method: "POST",
      headers,
      body: `grant_type=password&username=${encodeURIComponent(
        login
      )}&password=${encodeURIComponent(password)}`,
    };
    const endpoint =
      options && options.tokenEndpoint ? options.tokenEndpoint : "oauth/token";
    const loginRes = fetch(`${this.apiUrl}${endpoint}`, fetchOptions)
      .then(this.checkStatus)
      .then((resp) => resp.json())
      .then((data) => {
        this.restApiToken = data.access_token;
        return data;
      })
      .catch(throwNormolizedCubaRestError);
    return loginRes;
  }

  logout() {
    return this.revokeToken(this.restApiToken);
  }

  revokeToken(token) {
    const fetchOptions = {
      method: "POST",
      headers: this._getBasicAuthHeaders(),
      body: `token=${encodeURIComponent(token)}`,
    };
    this.clearAuthData();
    return fetch(`${this.apiUrl}oauth/revoke`, fetchOptions)
      .then(this.checkStatus)
      .catch(throwNormolizedCubaRestError);
  }

  loadEntities(entityName, options, fetchOptions) {
    return this.fetch("GET", `entities/${entityName}`, options, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  loadEntitiesWithCount(entityName, options, fetchOptions) {
    let count;
    const optionsWithCount = { ...options, returnCount: true };
    return this.fetch("GET", `entities/${entityName}`, optionsWithCount, {
      handleAs: "raw",
      ...fetchOptions,
    })
      .then((response) => {
        count = parseInt(response.headers.get("X-Total-Count"), 10);
        return response.json();
      })
      .then((result) => ({ result, count }));
  }

  searchEntities(entityName, entityFilter, options, fetchOptions) {
    let path = `entities/${entityName}`;
    let method = "GET";
    let data = { ...options };
    if (
      entityFilter &&
      entityFilter.conditions &&
      entityFilter.conditions.length > 0
    ) {
      path = `entities/${entityName}/search`;
      method = "POST";
      data = JSON.stringify({ ...options, filter: entityFilter });
    }
    return this.fetch(method, path, data, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  searchEntitiesWithPost(entityName, entityFilter, options, fetchOptions) {
    const data = { ...options };
    let path = `entities/${entityName}`;
    if (
      entityFilter &&
      entityFilter.conditions &&
      entityFilter.conditions.length > 0
    ) {
      data.filter = entityFilter;
      path = `entities/${entityName}/search`;
    }
    return this.fetch("POST", path, JSON.stringify(data), {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  searchEntitiesWithCount(entityName, entityFilter, options, fetchOptions) {
    let count;
    let path = `entities/${entityName}`;
    let method = "GET";
    let data = {
      ...options,
      returnCount: true,
    };
    if (
      entityFilter &&
      entityFilter.conditions &&
      entityFilter.conditions.length > 0
    ) {
      path = `entities/${entityName}/search`;
      method = "POST";
      data = JSON.stringify({
        ...options,
        filter: entityFilter,
        returnCount: true,
      });
    }
    return this.fetch(method, path, data, {
      handleAs: "raw",
      ...fetchOptions,
    })
      .then((response) => {
        count = parseInt(response.headers.get("X-Total-Count"), 10);
        return response.json();
      })
      .then((result) => ({ result, count }));
  }

  loadEntity(entityName, id, options, fetchOptions) {
    return this.fetch("GET", `entities/${entityName}/${id}`, options, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  deleteEntity(entityName, id, fetchOptions) {
    return this.fetch(
      "DELETE",
      `entities/${entityName}/${id}`,
      null,
      fetchOptions
    );
  }

  deleteEntities(entityName, ids, fetchOptions) {
    return this.fetch(
      "DELETE",
      `entities/${entityName}`,
      JSON.stringify(ids),
      fetchOptions
    );
  }

  commitEntity(entityName, entity, fetchOptions) {
    if (entity.id > 0) {
      return this.fetch(
        "PUT",
        `entities/${entityName}/${entity.id}`,
        JSON.stringify(entity),
        { handleAs: "json", ...fetchOptions }
      );
    }
    return this.fetch(
      "POST",
      `entities/${entityName}`,
      JSON.stringify(entity),
      { handleAs: "json", ...fetchOptions }
    );
  }

  commitEntity2(entityName, entities, fetchOptions) {
    return this.fetch(
      "POST",
      `entities/${entityName}`,
      JSON.stringify(entities),
      { handleAs: "json", ...fetchOptions }
    );
  }

  createEntity(entityName, entity, fetchOptions) {
    return this.fetch(
      "POST",
      `entities/${entityName}`,
      JSON.stringify({ ...entity, id: -1 }),
      { handleAs: "json", ...fetchOptions }
    );
  }

  createEntities(entityName, options, fetchOptions) {
    return this.fetch(
      "POST",
      `entities/${entityName}`,
      JSON.stringify(options),
      {
        handleAs: "json",
        ...fetchOptions,
      }
    );
  }

  loadService(serviceName, methodName, params, fetchOptions) {
    return this.fetch("GET", `services/${serviceName}/${methodName}`, params, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  loadServices(serviceName, fetchOptions) {
    return this.fetch("GET", `services/${serviceName}`, null, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  invokeService(serviceName, methodName, params, fetchOptions) {
    const serializedParams = params != null ? JSON.stringify(params) : null;
    return this.fetch(
      "POST",
      `services/${serviceName}/${methodName}`,
      serializedParams,
      {
        handleAs: "json",
        ...fetchOptions,
      }
    );
  }

  downloadService(serviceName, methodName, params, fetchOptions) {
    const serializedParams = params != null ? JSON.stringify(params) : null;
    let filename;
    let type;
    return this.fetch(
      "POST",
      `services/${serviceName}/${methodName}`,
      serializedParams,
      {
        handleAs: "raw",
        ...fetchOptions,
      }
    )
      .then(async (response) => {
        type = response.headers.get("content-type");
        const contentDisposition = response.headers.get("content-disposition");
        filename = decodeURIComponent(contentDisposition?.split("=")[1]);
        return response.blob();
      })
      .then((blob) => {
        return { blob, type, filename };
      });
  }

  uploadService(serviceName, methodName, params, fetchOptions) {
    return this.fetch("POST", `${serviceName}/${methodName}`, params, {
      handleAs: "formData",
      ...fetchOptions,
    });
  }

  invokePutService(serviceName, methodName, params, fetchOptions) {
    const serializedParams = params != null ? JSON.stringify(params) : null;
    return this.fetch(
      "PUT",
      `services/${serviceName}/${methodName}`,
      serializedParams,
      {
        handleAs: "json",
        ...fetchOptions,
      }
    );
  }

  query(entityName, queryName, params, fetchOptions) {
    return this.fetch("GET", `queries/${entityName}/${queryName}`, params, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  queryWithCount(entityName, queryName, params, fetchOptions) {
    let count;
    const paramsWithCount = { ...params, returnCount: true };
    return this.fetch(
      "GET",
      `queries/${entityName}/${queryName}`,
      paramsWithCount,
      { handleAs: "raw", ...fetchOptions }
    )
      .then((response) => {
        count = parseInt(response.headers.get("X-Total-Count"), 10);
        return response.json();
      })
      .then((result) => ({ result, count }));
  }

  queryCount(entityName, queryName, params, fetchOptions) {
    return this.fetch(
      "GET",
      `queries/${entityName}/${queryName}/count`,
      params,
      fetchOptions
    );
  }

  loadMetadata(fetchOptions) {
    return this.fetch("GET", "metadata/entities", null, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  loadEntityMetadata(entityName, fetchOptions) {
    return this.fetch("GET", `metadata/entities/${entityName}`, null, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  loadEntityViews(entityName, fetchOptions) {
    return this.fetch("GET", `metadata/entities/${entityName}/views`, null, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  loadEntityView(entityName, viewName, fetchOptions) {
    return this.fetch(
      "GET",
      `metadata/entities/${entityName}/views/${viewName}/`,
      null,
      { handleAs: "json", ...fetchOptions }
    );
  }

  loadEntitiesMessages(fetchOptions) {
    const fetchRes = this.fetch("GET", "messages/entities", null, {
      handleAs: "json",
      ...fetchOptions,
    });
    fetchRes.then((messages) => {
      this.messagesCache = messages;
      this.messagesLoadingListeners.forEach((l) => l(messages));
    });
    return fetchRes;
  }

  loadEnums(fetchOptions) {
    const fetchRes = this.fetch("GET", "metadata/enums", null, {
      handleAs: "json",
      ...fetchOptions,
    });
    fetchRes.then((enums) => {
      this.enumsCache = enums;
      this.enumsLoadingListeners.forEach((l) => l(enums));
    });
    return fetchRes;
  }

  loadEnumsMessages(fetchOptions) {
    const fetchRes = this.fetch("GET", "messages/enums", null, {
      handleAs: "json",
      ...fetchOptions,
    });
    fetchRes.then((messages) => {
      this.messagesCache = messages;
      this.messagesLoadingListeners.forEach((l) => l(messages));
    });
    return fetchRes;
  }

  getPermissions(fetchOptions) {
    return this.fetch("GET", "permissions", null, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  getRoles(fetchOptions) {
    return this.fetch("GET", "roles", null, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  getUserInfo(fetchOptions) {
    return this.fetch("GET", "api/userInfo", null, {
      handleAs: "json",
      ...fetchOptions,
    });
  }

  getFileUploadURL() {
    return `${this.apiUrl}files`;
  }

  getFile(id, fetchOptions) {
    return this.fetch("GET", `files/${id}`, null, {
      handleAs: "blob",
      ...fetchOptions,
    });
  }

  onLocaleChange(c) {
    this.localeChangeListeners.push(c);
    return () =>
      this.localeChangeListeners.splice(
        this.localeChangeListeners.indexOf(c),
        1
      );
  }

  onTokenExpiry(c) {
    this.tokenExpiryListeners.push(c);
    return () =>
      this.tokenExpiryListeners.splice(this.tokenExpiryListeners.indexOf(c), 1);
  }

  onEnumsLoaded(c) {
    this.enumsLoadingListeners.push(c);
    return () =>
      this.enumsLoadingListeners.splice(
        this.enumsLoadingListeners.indexOf(c),
        1
      );
  }

  onMessagesLoaded(c) {
    this.messagesLoadingListeners.push(c);
    return () =>
      this.messagesLoadingListeners.splice(
        this.messagesLoadingListeners.indexOf(c),
        1
      );
  }

  cleanup() {
    this.storage.clear();
  }

  /**
   * @since CUBA REST JS 0.7.0, Generic REST API 7.2.0
   */
  setSessionLocale() {
    return this.requestIfSupported("7.2.0", () =>
      this.fetch("PUT", "user-session/locale")
    );
  }

  /**
   * Returns REST API version number without performing side effects
   *
   * @returns REST API version number
   */
  getApiVersion(fetchOptions) {
    return this.fetch("GET", "version", null, {
      handleAs: "text",
      ...fetchOptions,
    });
  }

  /**
   * Updates stored REST API version number (which is used in feature detection mechanism)
   * with a value acquired by making a request to a version endpoint, and returns an updated value.
   *
   * @returns REST API version number
   */
  refreshApiVersion() {
    return this.getApiVersion()
      .then((version) => {
        this.apiVersion = version;
        return this.apiVersion;
      })
      .catch((err) => {
        if (err && err.response && err.response.status === 404) {
          // REST API doesn't have a version endpoint.
          // It means that version is less than 7.2.0 where feature detection was first introduced.
          // Return version as '0' so that comparison with a required version always result
          // in actual version being less than required version.
          this.apiVersion = "0";
          return this.apiVersion;
        }
        throw err;
      });
  }

  async requestIfSupported(minVersion, requestCallback = () => {}) {
    if (await this.isFeatureSupported(minVersion)) {
      return requestCallback();
    }
    return Promise.reject(this.#NOT_SUPPORTED_BY_API_VERSION);
  }

  async isFeatureSupported(minVersion) {
    if (!this.apiVersion) {
      await this.refreshApiVersion();
    }
    return matchesVersion(this.apiVersion, minVersion);
  }

  _getBasicAuthHeaders() {
    return getBasicAuthHeaders(
      this.restClientId,
      this.restClientSecret,
      this.locale
    );
  }

  clearAuthData() {
    this.storage.removeItem(`${this.name}_${this.#REST_TOKEN_STORAGE_KEY}`);
    this.storage.removeItem(`${this.name}_${this.#USER_NAME_STORAGE_KEY}`);
  }
}

/**
 * Initializes app.
 * @param {AppConfig} config
 * @returns {CubaApp}
 */
export function initializeApp(config = {}) {
  if (getApp(config.name) != null) {
    throw new Error("Cuba app is already initialized");
  }
  const cubaApp = new CubaApp(
    config.name,
    config.apiUrl,
    config.restClientId,
    config.restClientSecret,
    config.defaultLocale,
    config.storage,
    config.apiVersion
  );
  apps.push(cubaApp);
  return cubaApp;
}
