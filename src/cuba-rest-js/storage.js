/**
 * Simple im-memory storage compatible with localStorage/sessionStorage API.
 */
export class DefaultStorage {
  #items = {};

  get length() {
    return Object.keys(this.#items).length;
  }

  clear() {
    this.#items = {};
  }

  getItem(key) {
    return this.#items[key];
  }

  removeItem(key) {
    delete this.#items[key];
  }

  setItem(key, data) {
    this.#items[key] = data;
  }
}
