/**
 * The ordered field/label table shared by the formatter and the parser, so the
 * order and the vocabulary are defined exactly once.
 *
 * @module
 */

import type { SubdivisionWords } from "./provinces.ts";
import type { ThaiAddressField } from "./types.ts";

/** One labelled field: what to write, and what to accept when reading. */
export interface FieldSpec {
  readonly key: Exclude<ThaiAddressField, "postalCode">;
  /** The label this package writes. Bangkok changes two of them. */
  readonly label: (words: SubdivisionWords) => string;
  /** Every label read back as this field, including abbreviations. */
  readonly accepted: readonly string[];
}

/**
 * The eleven labelled fields, in the order a Thai address is printed. The
 * postal code trails them with no label of its own.
 *
 * Order is load-bearing: the parser only looks for labels of fields that come
 * *after* the one it is reading, so a value containing an earlier field's label
 * word — `ซอย` inside `"พระรามที่ 3 ซอย 29"` — cannot be mistaken for a delimiter.
 */
export const FIELD_SPECS: readonly FieldSpec[] = [
  { key: "addressNo", label: () => "เลขที่", accepted: ["บ้านเลขที่", "เลขที่"] },
  { key: "moo", label: () => "หมู่ที่", accepted: ["หมู่ที่", "หมู่", "ม."] },
  { key: "village", label: () => "หมู่บ้าน", accepted: ["หมู่บ้าน"] },
  { key: "soi", label: () => "ซอย", accepted: ["ซอย", "ซ.", "ตรอก", "แยก"] },
  { key: "road", label: () => "ถนน", accepted: ["ถนน", "ถ."] },
  { key: "building", label: () => "อาคาร", accepted: ["อาคาร", "ตึก"] },
  { key: "floor", label: () => "ชั้น", accepted: ["ชั้นที่", "ชั้น"] },
  { key: "room", label: () => "ห้องเลขที่", accepted: ["ห้องเลขที่", "ห้อง", "ยูนิต"] },
  {
    key: "subdistrict",
    label: (words) => words.subdistrict,
    accepted: ["แขวง", "ตำบล", "ต."],
  },
  {
    key: "district",
    label: (words) => words.district,
    accepted: ["เขต", "อำเภอ", "อ."],
  },
  { key: "province", label: () => "จังหวัด", accepted: ["จังหวัด", "จ."] },
];

/** A five-digit postal code sitting at the end of a value. */
export const TRAILING_POSTAL_CODE = /^(.*?)[\s,]*([0-9]{5})$/;

/** Any Thai character. */
export const THAI_SCRIPT = /[฀-๿]/;
