// One definition of how a phone number is entered, stored and displayed.
//
// Numbers are stored as 11 digits beginning with 0 - 01712345678 - which is how
// people in Bangladesh write and recognise their own number, and what the API
// validates against.
//
// The confusion this replaces: input fields carried a country-code prefix
// pinned to their left, but the field itself still expected the leading 0. So
// "+880" beside "01712345678" read as +88001712345678, one digit too many,
// while a different form showed "+88" for the same number. Some fields capped
// input at 10 digits even though 11 are required, making them impossible to
// submit.
//
// The resolution: entry fields carry no prefix at all and take the number the
// way people write it. The +880 form appears only where a number is displayed
// back, built by this helper so it is composed the same way every time.

export const PHONE_MAX_LENGTH = 11;
export const PHONE_PLACEHOLDER = "01XXXXXXXXX";
export const PHONE_PATTERN = "[0-9]{11}";

/**
 * Renders a stored number in international form: 01712345678 -> +880 1712345678
 * The leading 0 is a national-dialling prefix and is dropped, not kept, when the
 * country code is added.
 */
export const formatPhoneForDisplay = (phone?: string | null): string => {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";

  const national = digits.replace(/^0+/, "");
  if (!national) return "";

  return `+880 ${national}`;
};
