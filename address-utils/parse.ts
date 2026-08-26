/**
 * How to read the text that {@linkcode formatAddress} writes.
 *
 * @module
 */

import { THAI_SCRIPT } from "./fields.ts";
import { collectThai, hasLabel, recoverBareDivision } from "./scan.ts";
import { foreignAddress, type ParsedAddress, thaiAddress } from "./types.ts";

/**
 * Read an address that {@linkcode formatAddress} wrote.
 *
 * This function always gives you an address. Each character that is not a
 * label of this package goes into a field. Text that has no label goes into a
 * field by its position, and the function adds an `unlabelled-text` warning.
 * In the worst condition, a value goes into the incorrect field, where a
 * person can see it. The function does not delete text.
 *
 * If there are no warnings, the text was already in the format of this
 * package.
 *
 * The function does not try to correct unusual text. It makes only one
 * comparison with the table of divisions: it finds a division name that has no
 * `จังหวัด` label, because กรุงเทพมหานคร has no label. For text from a
 * different system, use {@linkcode importAddress}.
 *
 * ```ts
 * parseAddress("เลขที่ 99/1 แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110").address;
 * // { kind: "thai", addressNo: "99/1", subdistrict: "คลองตัน", … }
 * ```
 */
export function parseAddress(text: string): ParsedAddress {
  // The spaces in a value stay as they are. Only the ends are removed.
  const trimmed = text.trim();
  if (!trimmed) return { address: thaiAddress(), warnings: [] };
  if (isForeignText(trimmed)) return parseForeign(trimmed);
  const { values, warnings } = collectThai(trimmed);
  // กรุงเทพมหานคร has no label in front of it. Therefore the parser must find the
  // name itself.
  recoverBareDivision(values, warnings);
  return { address: thaiAddress(values), warnings };
}

/**
 * Text with no label of this package. A foreign address has commas between its
 * fields. A Thai address with no label is one name, for example the name of a
 * division. Therefore text with 2 or more parts between commas is foreign, also
 * when the text is in Thai characters.
 */
function isForeignText(text: string): boolean {
  if (hasLabel(text)) return false;
  if (text.split(",").filter((part) => part.trim()).length >= 2) return true;
  return !THAI_SCRIPT.test(text);
}

/** A word like "3rd" or "42nd" is part of the name of a road, not a number. */
function isOrdinal(word: string): boolean {
  return /^[0-9]+(st|nd|rd|th)$/i.test(word);
}

/**
 * A foreign address has the format `"<no> <road>, <city>, <country>"`. Therefore
 * the parser reads it from the right: first the country, then the city. The
 * remainder is the street. A text with only 2 parts is not clear: the parser
 * reads the first part as the street when it starts with a digit, and as the
 * city when it does not.
 */
export function parseForeign(text: string): ParsedAddress {
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  const country = parts.at(-1) ?? "";
  let city = "";
  let street = "";
  if (parts.length >= 3) {
    city = parts.at(-2)!;
    street = parts.slice(0, -2).join(", ");
  } else if (parts.length === 2) {
    if (/^[0-9]/.test(parts[0]!)) street = parts[0]!;
    else city = parts[0]!;
  }

  let addressNo = "";
  let road = "";
  const space = street.indexOf(" ");
  const first = space > 0 ? street.slice(0, space) : street;
  if (/^[0-9]/.test(first) && !isOrdinal(first)) {
    addressNo = first;
    road = space > 0 ? street.slice(space + 1).trim() : "";
  } else {
    road = street;
  }
  return {
    address: foreignAddress({ addressNo, road, city, country }),
    warnings: [],
  };
}
