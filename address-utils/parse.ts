/**
 * Reading back what {@linkcode formatAddress} wrote.
 *
 * @module
 */

import { THAI_SCRIPT } from "./fields.ts";
import { collectThai, hasLabel, recoverBareDivision } from "./scan.ts";
import { foreignAddress, type ParsedAddress, thaiAddress } from "./types.ts";

/**
 * Read an address written by {@linkcode formatAddress}.
 *
 * Total by construction: an address always comes back, and every character of
 * the input that isn't a label this package recognised ends up in some field.
 * Text that carried no label is placed by position and reported as an
 * `unlabelled-text` warning — so the worst case is a value in the wrong field,
 * in plain sight, rather than a value that disappeared. No warnings at all
 * means the text was already in this package's own format.
 *
 * No guessing: the only lookup it does is recognising a division name written
 * with no `จังหวัด` label, which is how กรุงเทพมหานคร is written. For text from
 * somewhere else use {@linkcode importAddress}.
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
  // กรุงเทพมหานคร is written with no label in front of it, so the only way back
  // is to recognise the name itself.
  recoverBareDivision(values, warnings);
  return { address: thaiAddress(values), warnings };
}

/**
 * Foreign addresses are `"<no> <road>, <city>, <country>"`, so they are read
 * from the right: the country last, the city before it, and whatever remains is
 * the street — split at the first token only when that token starts with a digit.
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
