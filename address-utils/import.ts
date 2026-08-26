/**
 * How to read an address that a person or a different system wrote.
 *
 * @module
 */

import { FIELD_SPECS, THAI_SCRIPT } from "./fields.ts";
import { parseForeign } from "./parse.ts";
import { findProvince, PROVINCES, subdivisionWords } from "./provinces.ts";
import { collectThai, recoverBareDivision } from "./scan.ts";
import {
  type ParsedAddress,
  thaiAddress,
  type ThaiAddressField,
  type Warning,
} from "./types.ts";

const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";

/** Remove line breaks and commas, change Thai digits, divide a postal code. */
function normalizeThai(text: string): string {
  return text
    .replace(/[\n\r\t,;]+/g, " ")
    .replace(/[๐-๙]/g, (digit) => String(THAI_DIGITS.indexOf(digit)))
    .replace(/([฀-๿])([0-9]{5})(?=\s|$)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A division name can touch the word in front of it, as in
 * "…เขตบางขุนเทียนกรุงเทพฯ". The package is not sure about this text, therefore the
 * function adds a warning. A name with a space in front of it is different.
 */
function recoverGluedDivision(
  values: Partial<Record<ThaiAddressField, string>>,
  warnings: Warning[],
): void {
  if (values.province) return;
  for (let index = FIELD_SPECS.length - 1; index >= 0; index--) {
    const key = FIELD_SPECS[index]!.key;
    const value = values[key];
    if (!value) continue;
    for (const division of PROVINCES) {
      for (const name of [division.nameTh, ...division.variants]) {
        if (value.length <= name.length || !value.endsWith(name)) continue;
        const rest = value.slice(0, -name.length).trim();
        // But อำเภอเมืองเชียงใหม่ is a district. Its name ends with the name
        // of its province. The province does not touch it.
        if (!rest || rest.endsWith("เมือง")) continue;
        values[key] = rest;
        values.province = name;
        warnings.push({
          code: "unlabelled-text",
          message:
            `"${name}" was stuck to the ${key} and was read as the province.`,
          field: "province",
          text: name,
        });
        return;
      }
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
  // The question is not "is this Bangkok". The question is if the division
  // writes its subdivisions with the other words. That is the subject.
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
 * Read an address from text that this package did not write. A person or a
 * different system wrote that text.
 *
 * The rules of {@linkcode parseAddress} apply: the function always gives you an
 * address, and it does not delete text. But this function does more. It accepts
 * line breaks and commas between the fields. It changes Thai digits to Latin
 * digits. It divides a postal code from the word in front of it. It also finds
 * a division name that has no `จังหวัด` label, and it moves that name out of
 * the field that contains it.
 *
 * A person must examine the result. Therefore the function adds a warning for each
 * value that has no label.
 *
 * ```ts
 * importAddress("99/1 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110").address;
 * // { kind: "thai", addressNo: "99/1", road: "สุขุมวิท", district: "วัฒนา", … }
 * ```
 */
export function importAddress(text: string): ParsedAddress {
  const tidied = text.replace(/\s+/g, " ").trim();
  if (!tidied) return { address: thaiAddress(), warnings: [] };
  // A foreign address has commas between its fields, therefore the commas must
  // stay. A line break replaces a comma that the person did not write.
  if (!THAI_SCRIPT.test(tidied)) {
    return parseForeign(
      text.replace(/[\n\r]+/g, ",").replace(/\s+/g, " ").trim(),
    );
  }

  const normalized = normalizeThai(tidied);
  const { values, warnings } = collectThai(normalized);
  recoverBareDivision(values, warnings);
  recoverGluedDivision(values, warnings);
  checkProvince(values, normalized, warnings);
  return { address: thaiAddress(values), warnings };
}
