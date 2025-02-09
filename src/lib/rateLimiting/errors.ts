export class RateLimitError extends Error {
  constructor() {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
  }
}

export class UnauthorisedAccessError extends Error {
  constructor() {
    super("Unauthorised Access");
    this.name = "UnauthorisedAccess";
  }
}

// TODO provide translations
export class InsufficientDataError extends Error {
  constructor() {
    super("Insufficient Data");
    this.name = "InsufficientData";
  }
}

export class R2StorageLimitExceededError extends Error {
  constructor() {
    super("R2StorageLimitExceeded");
    this.name = "Storage limit exceeded";
  }
}

export class UniqueConstaintError extends Error {
  constructor() {
    super("UniqueConstraint");
    this.name = "Unique Constraint Failed";
  }
}
