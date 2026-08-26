/**
 * The address shapes, taken from the Revenue Department's ภ.ง.ด.53 / ภ.ง.ด.54
 * layouts: twelve fields for a Thai address, four for a foreign one.
 *
 * Every field is a plain `string` and is always present — an absent value is
 * `""`, never `undefined` — so reading a field never needs a fallback.
 *
 * @module
 */

/** A Thai postal address, in the twelve fields of the ภ.ง.ด.53 DETAIL block. */
export interface ThaiAddress {
  readonly kind: "thai";
  /** เลขที่ — house/building number (`ADD_NO`). */
  readonly addressNo: string;
  /** หมู่ที่ — village group number (`MOO_NO`). */
  readonly moo: string;
  /** หมู่บ้าน — village or estate name (`VILLAGE_NAME`). */
  readonly village: string;
  /** ซอย — lane; also where ตรอก and แยก land (`SOI`). */
  readonly soi: string;
  /** ถนน — road (`STREET_NAME`). */
  readonly road: string;
  /** อาคาร — building name (`BUILD_NAME`). */
  readonly building: string;
  /** ชั้นที่ — floor (`FLOOR_NO`). */
  readonly floor: string;
  /** ห้องเลขที่ — room or unit number (`ROOM_NO`). */
  readonly room: string;
  /** ตำบล in most provinces, แขวง in Bangkok (`TAMBON`). */
  readonly subdistrict: string;
  /** อำเภอ in most provinces, เขต in Bangkok (`AMPHUR`). */
  readonly district: string;
  /** จังหวัด, or กรุงเทพมหานคร, which is not one (`PROVINCE`). */
  readonly province: string;
  /** รหัสไปรษณีย์ — five digits (`POSTAL_CODE`). */
  readonly postalCode: string;
}

/** A non-Thai address, in the four fields of ภ.ง.ด.54's office-location block. */
export interface ForeignAddress {
  readonly kind: "foreign";
  /** เลขที่ — street number. */
  readonly addressNo: string;
  /** ถนน — street. */
  readonly road: string;
  /** เมือง — city. */
  readonly city: string;
  /** ประเทศ — country. */
  readonly country: string;
}

/** Either address shape. Discriminate on {@linkcode ThaiAddress.kind}. */
export type Address = ThaiAddress | ForeignAddress;

/** The twelve Thai fields in the order a Thai address is conventionally printed. */
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

/** One of the twelve Thai field names. */
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
 * Build a complete {@linkcode ThaiAddress}; omitted fields become `""`.
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

/** Build a complete {@linkcode ForeignAddress}; omitted fields become `""`. */
export function foreignAddress(
  init: Partial<Omit<ForeignAddress, "kind">> = {},
): ForeignAddress {
  return { ...EMPTY_FOREIGN, ...init, kind: "foreign" };
}

/** Whether `address` is a Thai address. */
export function isThaiAddress(address: Address): address is ThaiAddress {
  return address.kind === "thai";
}

/** What a parser noticed while reading text that was not quite our own format. */
export type WarningCode =
  /** Text carried no label of its own and was placed by position. */
  | "unlabelled-text"
  /** The province is not one of the seventy-eight the table knows. */
  | "unknown-province"
  /** ตำบล/อำเภอ was written for a Bangkok address; formatting will correct it. */
  | "subdivision-wording";

/** A single remark about how text was read. Never fatal — an address is always returned. */
export interface Warning {
  /** Stable identifier; localize off this rather than off {@linkcode Warning.message}. */
  readonly code: WarningCode;
  /** English, human-readable. */
  readonly message: string;
  /** The field the remark concerns, when it concerns one. */
  readonly field?: string;
  /** The fragment of input the remark concerns, when there is one. */
  readonly text?: string;
}

/** What both parsers return: an address, always, plus anything worth a second look. */
export interface ParsedAddress {
  /** Never empty for non-empty input — at worst a value sits in the wrong field. */
  readonly address: Address;
  /** Empty exactly when the text was already in this package's own format. */
  readonly warnings: readonly Warning[];
}
