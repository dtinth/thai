/**
 * How to write an address as text. This package reads back this same format.
 *
 * @module
 */

import { FIELD_SPECS, THAI_SCRIPT } from "./fields.ts";
import { findProvince } from "./provinces.ts";
import { type Address, isThaiAddress } from "./types.ts";

/**
 * Write an address as one line of text.
 *
 * This function does not change the value of a field. It only adds the labels
 * and the spaces. Therefore {@linkcode parseAddress} gives you the same values
 * again.
 *
 * The labels come from the table of divisions. A Bangkok address gets แขวง and
 * เขต, also when the data contains ตำบล and อำเภอ. The name กรุงเทพมหานคร gets
 * no `จังหวัด` label, because กรุงเทพมหานคร is not a province.
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
  // A division that the table does not know keeps its จังหวัด label.
  const words = division?.subdivisionWords ??
    { subdistrict: "ตำบล", district: "อำเภอ" };
  const provinceLabel = division?.label ?? "จังหวัด";
  const parts: string[] = [];
  for (const spec of FIELD_SPECS) {
    const value = address[spec.key].trim();
    if (!value) continue;
    const label = spec.key === "province" ? provinceLabel : spec.label(words);
    // A Thai value comes directly after its label. A different value gets a
    // space. An empty label (กรุงเทพมหานคร) gets no space.
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
