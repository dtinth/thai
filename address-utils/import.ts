/**
 * Reading an address written by a human or another system.
 *
 * @module
 */

import { FIELD_SPECS, THAI_SCRIPT } from "./fields.ts";
import { parseForeign } from "./parse.ts";
import { findProvince, PROVINCES, subdivisionWords } from "./provinces.ts";
import { collectThai } from "./scan.ts";
import {
  type ParsedAddress,
  thaiAddress,
  type ThaiAddressField,
  type Warning,
} from "./types.ts";

const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";

/** Line breaks, commas and Thai digits are noise; a glued postal code is not. */
function normalizeThai(text: string): string {
  return text
    .replace(/[\n\r\t,;]+/g, " ")
    .replace(/[๐-๙]/g, (digit) => String(THAI_DIGITS.indexOf(digit)))
    .replace(/([฀-๿])([0-9]{5})(?=\s|$)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a province off the end of a value, when one is written there. */
function splitProvince(
  value: string,
): { province: string; rest: string } | undefined {
  const tokens = value.split(" ");
  for (
    let index = Math.max(0, tokens.length - 3);
    index < tokens.length;
    index++
  ) {
    const candidate = tokens.slice(index).join(" ");
    if (findProvince(candidate)) {
      return { province: candidate, rest: tokens.slice(0, index).join(" ") };
    }
  }
  // Glued to the word before it, as in "…เขตบางขุนเทียนกรุงเทพฯ".
  for (const province of PROVINCES) {
    for (const name of [province.nameTh, ...province.variants]) {
      if (value.length <= name.length || !value.endsWith(name)) continue;
      const rest = value.slice(0, -name.length).trim();
      // …but อำเภอเมืองเชียงใหม่ is a district whose name ends in its province,
      // not a district with the province stuck to it.
      if (rest.endsWith("เมือง")) continue;
      return { province: name, rest };
    }
  }
  return undefined;
}

/** Recover a province that was written with no label of its own. */
function recoverProvince(
  values: Partial<Record<ThaiAddressField, string>>,
  warnings: Warning[],
): void {
  if (values.province) return;
  for (let index = FIELD_SPECS.length - 1; index >= 0; index--) {
    const key = FIELD_SPECS[index]!.key;
    const value = values[key];
    if (!value) continue;
    // Only the last field with content: a province name is written at the end,
    // and anything earlier is far more likely to be part of a road or a name.
    const found = splitProvince(value);
    if (found) {
      values[key] = found.rest;
      values.province = found.province;
      warnings.push({
        code: "unlabelled-text",
        message:
          `"${found.province}" carried no label of its own and was read as the province.`,
        field: "province",
        text: found.province,
      });
    }
    return;
  }
}

function checkProvince(
  values: Partial<Record<ThaiAddressField, string>>,
  text: string,
  warnings: Warning[],
): void {
  const province = values.province;
  if (!province) return;
  if (!findProvince(province)) {
    warnings.push({
      code: "unknown-province",
      message: `"${province}" is not one of the seventy-seven divisions.`,
      field: "province",
      text: province,
    });
    return;
  }
  // Not "is this Bangkok" but "does this province write its subdivisions the
  // other way" — which is the thing the warning is actually about.
  const words = subdivisionWords(province);
  if (
    words.subdistrict !== "ตำบล" && /(?:^| )(?:ตำบล|อำเภอ|ต\.|อ\.)/.test(text)
  ) {
    warnings.push({
      code: "subdivision-wording",
      message:
        `${province} writes ${words.subdistrict}/${words.district}, but this address says ตำบล/อำเภอ; formatting corrects it.`,
      field: "province",
      text: province,
    });
  }
}

/**
 * Read an address from text this package did not write — pasted by a person,
 * or handed over by another system.
 *
 * Same guarantee as {@linkcode parseAddress} — an address always comes back and
 * nothing is dropped — with more work in between: line breaks and commas are
 * treated as separators, Thai digits become ASCII, a postal code glued to the
 * word before it is split off, and a province written with no `จังหวัด` label
 * is recognised from the province table and moved out of the field it landed in.
 *
 * The result is meant to be shown to a person to check, so anything placed by
 * guesswork rather than by an explicit label comes back as a warning.
 *
 * ```ts
 * importAddress("99/1 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110").address;
 * // { kind: "thai", addressNo: "99/1", road: "สุขุมวิท", district: "วัฒนา", … }
 * ```
 */
export function importAddress(text: string): ParsedAddress {
  const tidied = text.replace(/\s+/g, " ").trim();
  if (!tidied) return { address: thaiAddress(), warnings: [] };
  // A foreign address is comma-separated, so its commas have to survive — and a
  // line break stands in for the comma somebody left out.
  if (!THAI_SCRIPT.test(tidied)) {
    return parseForeign(
      text.replace(/[\n\r]+/g, ",").replace(/\s+/g, " ").trim(),
    );
  }

  const normalized = normalizeThai(tidied);
  const { values, warnings } = collectThai(normalized);
  recoverProvince(values, warnings);
  checkProvince(values, normalized, warnings);
  return { address: thaiAddress(values), warnings };
}
