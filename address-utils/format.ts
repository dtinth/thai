/**
 * Turning an address into the one string form this package reads back.
 *
 * @module
 */

import { FIELD_SPECS, THAI_SCRIPT } from "./fields.ts";
import { subdivisionWords } from "./provinces.ts";
import { type Address, isThaiAddress } from "./types.ts";

/**
 * Write an address as a single line.
 *
 * Field *values* are never edited — only labels and separators are added — so
 * {@linkcode parseAddress} reads back exactly what went in. The two subdivision
 * labels come from the province, which is how a Bangkok address prints แขวง/เขต
 * even when it was stored as ตำบล/อำเภอ.
 *
 * ```ts
 * formatAddress(thaiAddress({ addressNo: "99/1", subdistrict: "คลองตัน",
 *   district: "วัฒนา", province: "กรุงเทพมหานคร", postalCode: "10110" }));
 * // "เลขที่ 99/1 แขวงคลองตัน เขตวัฒนา จังหวัดกรุงเทพมหานคร 10110"
 * ```
 */
export function formatAddress(address: Address): string {
  return isThaiAddress(address) ? formatThai(address) : formatForeign(address);
}

function formatThai(address: Address & { kind: "thai" }): string {
  const words = subdivisionWords(address.province);
  const parts: string[] = [];
  for (const spec of FIELD_SPECS) {
    const value = address[spec.key].trim();
    if (!value) continue;
    // A Thai value follows its label with no space, the way Thai addresses are
    // printed ("ตำบลสุเทพ"); anything else gets one ("เลขที่ 99/1").
    const separator = THAI_SCRIPT.test(value.charAt(0)) ? "" : " ";
    parts.push(`${spec.label(words)}${separator}${value}`);
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
