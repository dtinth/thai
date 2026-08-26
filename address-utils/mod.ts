/**
 * Thai postal addresses as structured data: twelve fields for a Thai address
 * and four for a foreign one, taken from the Revenue Department's ภ.ง.ด.53 and
 * ภ.ง.ด.54 layouts, with a formatter and parsers that do not lose text.
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
 * // "เลขที่ 99/1 แขวงคลองตัน เขตวัฒนา จังหวัดกรุงเทพมหานคร 10110"
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
  isBangkok,
  type Province,
  PROVINCES,
  type SubdivisionWords,
  subdivisionWords,
} from "./provinces.ts";
export { formatAddress } from "./format.ts";
export { parseAddress } from "./parse.ts";
export { importAddress } from "./import.ts";
