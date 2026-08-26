/**
 * The table of fields and labels, in sequence. The formatter and the parsers
 * use this same table. Therefore the sequence and the labels have one definition.
 *
 * @module
 */

import type { SubdivisionWords } from "./provinces.ts";
import type { ThaiAddressField } from "./types.ts";

/** One field with a label: the label to write, and the labels to accept. */
export interface FieldSpec {
  readonly key: Exclude<ThaiAddressField, "postalCode">;
  /** The label that this package writes. Bangkok changes 2 of the labels. */
  readonly label: (words: SubdivisionWords) => string;
  /** All labels that give this field, also the short forms. */
  readonly accepted: readonly string[];
}

/**
 * The 11 fields that have a label, in the sequence of a printed Thai address.
 * The postal code comes after them and has no label.
 *
 * The sequence is important. A parser finds only the labels of the fields
 * after the field that it reads. Therefore a value can contain the label word of an
 * earlier field. The parser does not divide the soi `พระรามที่ 3 ซอย 29`,
 * because `ซอย` is not a label at that position.
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

/** A postal code of 5 digits at the end of a value. */
export const TRAILING_POSTAL_CODE = /^(.*?)[\s,]*([0-9]{5})$/;

/** Any Thai character. */
export const THAI_SCRIPT = /[฀-๿]/;
