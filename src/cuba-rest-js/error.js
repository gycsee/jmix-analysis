export class CubaRestError extends Error {
  response;

  name = "CubaRestError";

  constructor({ message, response }) {
    super(message);
    if (response !== undefined) {
      this.response = response;
    }
  }
}
