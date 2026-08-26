/**
 * The 2 address shapes. They come from the Revenue Department forms ภ.ง.ด.53
 * and ภ.ง.ด.54. A Thai address has 12 fields. A foreign address has 4 fields.
 *
 * Each field is a string, and each field is always present. A field with no
 * data is an empty string, never `undefined`. You do not need a default value
 * when you read a field.
 *
 * @module
 */

/** A Thai postal address in the 12 fields of the ภ.ง.ด.53 DETAIL block. */
export interface ThaiAddress {
  readonly kind: "thai";
  /** เลขที่, the number of the house or the building (`ADD_NO`). */
  readonly addressNo: string;
  /** หมู่ที่, the number of the village group (`MOO_NO`). */
  readonly moo: string;
  /** หมู่บ้าน, the name of the village or the estate (`VILLAGE_NAME`). */
  readonly village: string;
  /** ซอย, the lane. A ตรอก and a แยก also go here (`SOI`). */
  readonly soi: string;
  /** ถนน, the road (`STREET_NAME`). */
  readonly road: string;
  /** อาคาร, the name of the building (`BUILD_NAME`). */
  readonly building: string;
  /** ชั้นที่, the floor (`FLOOR_NO`). */
  readonly floor: string;
  /** ห้องเลขที่, the number of the room or the unit (`ROOM_NO`). */
  readonly room: string;
  /** ตำบล in the provinces, แขวง in Bangkok (`TAMBON`). */
  readonly subdistrict: string;
  /** อำเภอ in the provinces, เขต in Bangkok (`AMPHUR`). */
  readonly district: string;
  /** จังหวัด, or กรุงเทพมหานคร, which is not a จังหวัด (`PROVINCE`). */
  readonly province: string;
  /** รหัสไปรษณีย์, 5 digits (`POSTAL_CODE`). */
  readonly postalCode: string;
}

/** A foreign address in the 4 fields of the office block of the ภ.ง.ด.54 form. */
export interface ForeignAddress {
  readonly kind: "foreign";
  /** เลขที่, the number in the street. */
  readonly addressNo: string;
  /** ถนน, the street. */
  readonly road: string;
  /** เมือง, the city. */
  readonly city: string;
  /** ประเทศ, the country. */
  readonly country: string;
}

/** One of the 2 address shapes. The `kind` property tells you which one. */
export type Address = ThaiAddress | ForeignAddress;

/** The 12 Thai fields in the sequence of a printed Thai address. */
export const THAI_ADDRESS_FIELDS = [
  "addressNo",
  "moo",
  "village",
  "soi",
  "road",
  "building",
  "floor",
  "room",
  "subdistrict",
  "district",
  "province",
  "postalCode",
] as const satisfies readonly (keyof Omit<ThaiAddress, "kind">)[];

/** The name of one of the 12 Thai fields. */
export type ThaiAddressField = (typeof THAI_ADDRESS_FIELDS)[number];

const EMPTY_THAI: ThaiAddress = {
  kind: "thai",
  addressNo: "",
  moo: "",
  village: "",
  soi: "",
  road: "",
  building: "",
  floor: "",
  room: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
};

const EMPTY_FOREIGN: ForeignAddress = {
  kind: "foreign",
  addressNo: "",
  road: "",
  city: "",
  country: "",
};

/**
 * Make a complete {@linkcode ThaiAddress}. A field that you do not give becomes
 * an empty string.
 *
 * ```ts
 * thaiAddress({ addressNo: "99/1", province: "เชียงใหม่" });
 * ```
 */
export function thaiAddress(
  init: Partial<Omit<ThaiAddress, "kind">> = {},
): ThaiAddress {
  return { ...EMPTY_THAI, ...init, kind: "thai" };
}

/** Make a complete {@linkcode ForeignAddress}. Fields that you do not give become empty. */
export function foreignAddress(
  init: Partial<Omit<ForeignAddress, "kind">> = {},
): ForeignAddress {
  return { ...EMPTY_FOREIGN, ...init, kind: "foreign" };
}

/** Tells you if `address` is a Thai address. */
export function isThaiAddress(address: Address): address is ThaiAddress {
  return address.kind === "thai";
}

/** What a parser found in text that is not in the format of this package. */
export type WarningCode =
  /** The text had no label. The parser used its position. */
  | "unlabelled-text"
  /** The division is not one of the 77 divisions in the table. */
  | "unknown-province"
  /** A Bangkok address contains ตำบล or อำเภอ. A write operation corrects it. */
  | "subdivision-wording";

/** One remark about the text. The parser always gives you an address. */
export interface Warning {
  /** The identifier does not change. Use it, not {@linkcode Warning.message}, for other languages. */
  readonly code: WarningCode;
  /** English text for a person to read. */
  readonly message: string;
  /** The field of the remark, if the remark is about one field. */
  readonly field?: string;
  /** The part of the text that the remark is about, if there is one. */
  readonly text?: string;
}

/** What both parsers give you: always an address, and the warnings. */
export interface ParsedAddress {
  /** Text that is not empty always gives an address that is not empty. */
  readonly address: Address;
  /** This list is empty when the text was already in the format of this package. */
  readonly warnings: readonly Warning[];
}
