/**
 * Turning an address into the one string form this package reads back.
 *
 * @module
 */

import { FIELD_SPECS, THAI_SCRIPT } from "./fields.ts";
import { findProvince } from "./provinces.ts";
import { type Address, isThaiAddress } from "./types.ts";

/**
 * Write an address as a single line.
 *
 * Field *values* are never edited — only labels and separators are added — so
 * {@linkcode parseAddress} reads back exactly what went in. The labels come from
 * the division table: a Bangkok address prints แขวง/เขต even when it was stored
 * as ตำบล/อำเภอ, and prints กรุงเทพมหานคร with no `จังหวัด` in front of it,
 * because it is not one.
 *
 * ```ts
 * formatAddress(thaiAddress({ addressNo: "99/1", subdistrict: "คลองตัน",
 *   district: "วัฒนา", province: "กรุงเทพมหานคร", postalCode: "10110" }));
 * // "เลขที่ 99/1 แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110"
 * ```
 */
export function formatAddress(address: Address): string {
  return isThaiAddress(address) ? formatThai(address) : formatForeign(address);
}

function formatThai(address: Address & { kind: "thai" }): string {
  const division = findProvince(address.province);
  // A province the table doesn't know is still written with its จังหวัด label.
  const words = division?.subdivisionWords ??
    { subdistrict: "ตำบล", district: "อำเภอ" };
  const provinceLabel = division?.label ?? "จังหวัด";
  const parts: string[] = [];
  for (const spec of FIELD_SPECS) {
    const value = address[spec.key].trim();
    if (!value) continue;
    const label = spec.key === "province" ? provinceLabel : spec.label(words);
    // A Thai value follows its label with no space; anything else gets one —
    // and a label that is empty (กรุงเทพมหานคร) gets neither.
    const separator = !label || THAI_SCRIPT.test(value.charAt(0)) ? "" : " ";
    parts.push(`${label}${separator}${value}`);
  }
  const postalCode = address.postalCode.trim();
  if (postalCode) parts.push(postalCode);
  return parts.join(" ");
}

function formatForeign(address: Address & { kind: "foreign" }): string {
  const street = [address.addressNo.trim(), address.road.trim()]
    .filter(Boolean)
    .join(" ");
  return [street, address.city.trim(), address.country.trim()]
    .filter(Boolean)
    .join(", ");
}
