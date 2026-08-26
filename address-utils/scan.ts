/**
 * The scanner that finds the labels in their sequence. Both parsers use it.
 *
 * @module
 */

import { FIELD_SPECS, TRAILING_POSTAL_CODE } from "./fields.ts";
import { splitTrailingDivision } from "./provinces.ts";
import type { ThaiAddressField, Warning } from "./types.ts";

interface LabelMatch {
  readonly fieldIndex: number;
  readonly label: string;
  readonly start: number;
}

/**
 * Find the next label at or after the position `from`. The label must belong to
 * a field at or after `minFieldIndex`.
 *
 * There are 2 rules. A label is a label only at the start of the text or
 * directly after a space. Therefore `"อาคารเอบีซี"` is the name of a building and
 * not a label with a value. Also, only the fields after the field that the
 * parser reads are possible. Therefore the `ซอย` in `"ซอยพระรามที่ 3 ซอย 29"` stays
 * in the value of the soi.
 */
export function nextLabel(
  text: string,
  from: number,
  minFieldIndex: number,
): LabelMatch | undefined {
  for (let position = from; position < text.length; position++) {
    if (position > 0 && !/\s/.test(text.charAt(position - 1))) continue;
    let best: LabelMatch | undefined;
    for (let index = minFieldIndex; index < FIELD_SPECS.length; index++) {
      for (const label of FIELD_SPECS[index]!.accepted) {
        // The longest label wins. หมู่บ้าน is a village, not หมู่ with a value.
        if (
          text.startsWith(label, position) &&
          (best === undefined || label.length > best.label.length)
        ) {
          best = { fieldIndex: index, label, start: position };
        }
      }
    }
    if (best) return best;
  }
  return undefined;
}

/** Tells you if the text contains a label of this package. */
export function hasLabel(text: string): boolean {
  return nextLabel(text, 0, 0) !== undefined;
}

interface Segment {
  /** The field of this text. It is undefined when the text had no label. */
  key?: ThaiAddressField;
  text: string;
}

/** Divide the text into segments with labels, and the text before the first label. */
function segment(text: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  let minFieldIndex = 0;
  let key: ThaiAddressField | undefined;
  for (;;) {
    const match = nextLabel(text, cursor, minFieldIndex);
    if (!match) break;
    segments.push({ key, text: text.slice(cursor, match.start) });
    key = FIELD_SPECS[match.fieldIndex]!.key;
    cursor = match.start + match.label.length;
    minFieldIndex = match.fieldIndex + 1;
  }
  segments.push({ key, text: text.slice(cursor) });
  return segments;
}

/** The field values from a Thai address line, and the warnings. */
export interface Collected {
  readonly values: Partial<Record<ThaiAddressField, string>>;
  readonly warnings: Warning[];
}

/**
 * Read the values that have labels from a Thai address line.
 *
 * Text that has no label becomes the house number, and the function adds a
 * warning. The text is then in an incorrect field, but it is not lost.
 */
export function collectThai(text: string): Collected {
  const segments = segment(text);
  const warnings: Warning[] = [];

  // The postal code comes after the last field and has no label. The function
  // takes it from the field at the end of the line, not from the province.
  // Therefore it does not stay in that field when the address has no province.
  const last = segments[segments.length - 1]!;
  const values: Partial<Record<ThaiAddressField, string>> = {};
  const trailing = TRAILING_POSTAL_CODE.exec(last.text.trim());
  if (trailing) {
    values.postalCode = trailing[2]!;
    last.text = trailing[1]!;
  }

  for (const { key, text: raw } of segments) {
    const value = raw.trim();
    if (!value) continue;
    if (key === undefined) {
      warnings.push({
        code: "unlabelled-text",
        message: unlabelledMessage(value),
        field: "addressNo",
        text: value,
      });
    }
    const field = key ?? "addressNo";
    const existing = values[field];
    values[field] = existing ? `${existing} ${value}` : value;
  }

  return { values, warnings };
}

/**
 * Find a division name that has no `จังหวัด` label. กรุงเทพมหานคร has no label.
 * The function examines the end of the last field that has data.
 *
 * The comparison with the table must be exact. If an `unlabelled-text` warning
 * contains that text, the function makes the warning shorter or removes it,
 * because the text now has a field.
 */
export function recoverBareDivision(
  values: Partial<Record<ThaiAddressField, string>>,
  warnings: Warning[],
): boolean {
  if (values.province) return false;
  for (let index = FIELD_SPECS.length - 1; index >= 0; index--) {
    const key = FIELD_SPECS[index]!.key;
    const value = values[key];
    if (!value) continue;
    // Only the last field that has data. A division name comes at the end.
    // Text before that is usually part of a road name or a different name.
    const split = splitTrailingDivision(value);
    if (!split) return false;
    values[key] = split.rest;
    values.province = split.division;
    forgetUnlabelled(warnings, key, split.division);
    return true;
  }
  return false;
}

function forgetUnlabelled(
  warnings: Warning[],
  key: ThaiAddressField,
  division: string,
): void {
  if (key !== "addressNo") return;
  for (let index = warnings.length - 1; index >= 0; index--) {
    const warning = warnings[index]!;
    if (warning.code !== "unlabelled-text") continue;
    if (!warning.text?.endsWith(division)) continue;
    const rest = warning.text.slice(0, -division.length).trim();
    if (rest) {
      warnings[index] = {
        ...warning,
        text: rest,
        message: unlabelledMessage(rest),
      };
    } else {
      warnings.splice(index, 1);
    }
  }
}

function unlabelledMessage(text: string): string {
  return `"${text}" carried no label of its own and was read as the house number.`;
}
