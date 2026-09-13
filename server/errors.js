// Chyby, které server vrací klientovi s konkrétním HTTP stavem.
// Zpráva jde uživateli, proto česky.

/** Chyba s libovolným HTTP stavem (404, 405, 409, 413…). */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Špatný vstup od klienta → 400. */
export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
    this.status = 400;
  }
}
