// Chyby, které server vrací klientovi jako 400 (špatný vstup), ne jako 500.

export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
    this.status = 400;
  }
}
