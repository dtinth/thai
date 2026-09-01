/**
 * How to correct the subdivision words in an address that is already text.
 *
 * @module
 */

import { findProvince, PROVINCES, subdivisionWords } from "./provinces.ts";

/**
 * Text at the end that is not part of the name of a division: spaces, commas,
 * a postal code, and the name of the country.
 */
const TAIL_NOISE = /(?:[\s,]|[0-9๐-๙]{5}|ประเทศไทย|ไทย|Thailand)+$/i;

/** A division with its own label, as in "จังหวัดสมุทรปราการ" or "จ.เชียงใหม่". */
const LABELLED_DIVISION = /(?:^|(?<=\s))(?:จังหวัด|จ\.)\s*(\S+)/;

/** The 4 words that a province uses for its subdivisions. */
const PROVINCIAL_WORDS = /(?:^|(?<=\s))(ตำบล|อำเภอ|ต\.|อ\.)/g;

/** The division of an address that is text, as the address writes it. */
function divisionOf(text: string): string {
  const labelled = LABELLED_DIVISION.exec(text);
  if (labelled) return labelled[1] ?? "";
  const tokens = text.trim().replace(TAIL_NOISE, "").trim().split(/\s+/);
  const last = tokens.at(-1) ?? "";
  if (findProvince(last)) return last;
  // A division can touch the word in front of it: "…เขตบางขุนเทียนกรุงเทพฯ".
  for (const division of PROVINCES) {
    for (const name of [division.nameTh, ...division.variants]) {
      if (last.length > name.length && last.endsWith(name)) return name;
    }
  }
  return last;
}

/**
 * Correct ตำบล and อำเภอ to แขวง and เขต in an address that is already text,
 * when the address is in a division that uses แขวง and เขต.
 *
 * Use this for text that you cannot make into fields: a value from a different
 * system, or an old value in a database. The function changes only those 2
 * words. It does not move the other text, and it does not add a label.
 *
 * The function changes the words in one direction only. It never makes แขวง
 * into ตำบล, because an address that does not give its division would then get
 * the incorrect words from a guess.
 *
 * ```ts
 * relabelSubdivisions("1 ตำบลแสมดำ อำเภอบางขุนเทียน กรุงเทพมหานคร 10150");
 * // "1 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150"
 * relabelSubdivisions("1 แขวงแสมดำ เขตบางขุนเทียน 10150"); // no change
 * ```
 */
export function relabelSubdivisions(text: string): string {
  if (!text) return text;
  const words = subdivisionWords(divisionOf(text));
  if (words.subdistrict === "ตำบล") return text;
  return text.replace(
    PROVINCIAL_WORDS,
    (
      label,
    ) => (label === "ตำบล" || label === "ต."
      ? words.subdistrict
      : words.district),
  );
}
