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
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return { address: thaiAddress(), warnings: [] };
  if (!hasLabel(normalized) && !THAI_SCRIPT.test(normalized)) {
    return parseForeign(normalized);
  }
  const { values, warnings } = collectThai(normalized);
  // กรุงเทพมหานคร has no label in front of it. Therefore the parser must find the
  // name itself.
  recoverBareDivision(values, warnings);
  return { address: thaiAddress(values), warnings };
}

/**
 * A foreign address has the format `"<no> <road>, <city>, <country>"`. Therefore the
 * parser reads it from the right: first the country, then the city. The
 * remainder is the street. The parser divides the street at the first space
 * only when the first word starts with a digit.
 */
export function parseForeign(text: string): ParsedAddress {
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  const country = parts.at(-1) ?? "";
  const city = parts.length >= 2 ? parts.at(-2)! : "";
  const street = parts.length >= 3 ? parts.slice(0, -2).join(", ") : "";

  let addressNo = "";
  let road = street;
  const space = street.indexOf(" ");
  if (space > 0 && /^[0-9]/.test(street)) {
    addressNo = street.slice(0, space);
    road = street.slice(space + 1).trim();
  }
  return {
    address: foreignAddress({ addressNo, road, city, country }),
    warnings: [],
  };
}
