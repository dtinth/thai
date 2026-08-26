/**
 * A Thai postal address as data. A Thai address has 12 fields. A foreign
 * address has 4 fields. The fields come from the Revenue Department forms
 * ภ.ง.ด.53 and ภ.ง.ด.54. The formatter and the parsers do not delete text.
 *
 * ```ts
 * import { formatAddress, parseAddress, thaiAddress } from "@thai/address-utils";
 *
 * const address = thaiAddress({
 *   addressNo: "99/1",
 *   subdistrict: "คลองตัน",
 *   district: "วัฒนา",
 *   province: "กรุงเทพมหานคร",
 *   postalCode: "10110",
 * });
 *
 * const line = formatAddress(address);
 * // "เลขที่ 99/1 แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110"
 *
 * parseAddress(line).address; // the same twelve fields, unchanged
 * ```
 *
 * @module
 */

export {
  type Address,
  type ForeignAddress,
  foreignAddress,
  isThaiAddress,
  type ParsedAddress,
  THAI_ADDRESS_FIELDS,
  type ThaiAddress,
  thaiAddress,
  type ThaiAddressField,
  type Warning,
  type WarningCode,
} from "./types.ts";
export {
  BANGKOK,
  findProvince,
  type Province,
  PROVINCES,
  type SubdivisionWords,
  subdivisionWords,
} from "./provinces.ts";
export { formatAddress } from "./format.ts";
export { parseAddress } from "./parse.ts";
export { importAddress } from "./import.ts";
