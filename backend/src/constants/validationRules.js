// Single source of truth for the field rules that both the API and the signup
// form enforce.
//
// This exists because the same rule kept being written out in several places
// and then drifting apart, which always surfaces the same way: the form accepts
// something, the API refuses it, and the person gets two contradictory messages
// for one mistake. The password rule was spelled out in seven places, the phone
// rule in six with three of them disagreeing, and the name rule allowed two
// characters in the browser while the server demanded three.
//
// Mirrored by exported constants in frontend/src/utils/validation.ts. If you
// change something here, change it there too.

// --- password --------------------------------------------------------------

const PASSWORD_MIN_LENGTH = 8;

// Composition only: length is checked separately so a short password reports
// "too short" rather than the full composition sentence.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;

const PASSWORD_LENGTH_MESSAGE = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;

const PASSWORD_MESSAGE =
  "Password must contain at least one uppercase letter, one lowercase letter, and one number";

// --- name ------------------------------------------------------------------

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;

const NAME_MESSAGE = `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`;

// --- phone -----------------------------------------------------------------
//
// Stored as 11 digits beginning with 0, the form people in Bangladesh write.
// See frontend/src/utils/phone.ts for how it is displayed back.

const PHONE_LENGTH = 11;
const PHONE_PATTERN = /^\d{11}$/;
const PHONE_MESSAGE = `Phone number must be ${PHONE_LENGTH} digits`;

module.exports = {
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_LENGTH_MESSAGE,
  PASSWORD_MESSAGE,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MESSAGE,
  PHONE_LENGTH,
  PHONE_PATTERN,
  PHONE_MESSAGE,
};
