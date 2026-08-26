/**
 * The ordered label scanner both parsers are built on.
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
 * The next label at or after `from` belonging to a field at or after
 * `minFieldIndex`.
 *
 * Two rules do the work. A label only counts at the start of the string or
 * right after a space, so `"อาคารเอบีซี"` is a building *name*, not a label
 * plus a value. And only fields that come later in the printed order are
 * candidates, so the `ซอย` inside `"ซอยพระรามที่ 3 ซอย 29"` stays part of the
 * soi's value.
 */
export function nextLabel(
  text: string,
  from: number,
  minFieldIndex: number,
): LabelMatch | undefined {
  for (let position = from; position < text.length; position++) {
    if (position > 0 && text.charAt(position - 1) !== " ") continue;
    let best: LabelMatch | undefined;
    for (let index = minFieldIndex; index < FIELD_SPECS.length; index++) {
      for (const label of FIELD_SPECS[index]!.accepted) {
        // Longest wins, so หมู่บ้าน is a village and not หมู่ + "บ้าน…".
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

/** Whether the text carries any label this package recognises. */
export function hasLabel(text: string): boolean {
  return nextLabel(text, 0, 0) !== undefined;
}

interface Segment {
  /** The field this text belongs to, or undefined when it carried no label. */
  key?: ThaiAddressField;
  text: string;
}

/** Cut the text into labelled segments, plus whatever preceded the first label. */
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

/** Field values read out of a Thai address line, with anything worth flagging. */
export interface Collected {
  readonly values: Partial<Record<ThaiAddressField, string>>;
  readonly warnings: Warning[];
}

/**
 * Read labelled values out of a Thai address line.
 *
 * Text that carried no label of its own becomes the house number and is
 * reported, so it is visible in the wrong field rather than gone.
 */
export function collectThai(text: string): Collected {
  const segments = segment(text);
  const warnings: Warning[] = [];

  // The postal code trails the last field with no label of its own. Taking it
  // from whichever field ends the line — not from the province — keeps it out
  // of that field's value when the province is missing.
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
 * Recover a division written with no `จังหวัด` label — which is how
 * กรุงเทพมหานคร is written — from the end of the last field that has content.
 *
 * Exact table match only. When the text it takes had been reported as
 * unlabelled, that report is shortened or dropped, since the text turned out to
 * have a home after all.
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
    // Only the last field with content: a division name is written at the end,
    // and anything earlier is far more likely to be part of a road or a name.
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
