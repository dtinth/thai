/**
 * The 77 top-level divisions of Thailand: 76 จังหวัด and also กรุงเทพมหานคร.
 * กรุงเทพมหานคร is not a จังหวัด. It is a metropolitan administration of the
 * same rank. For this reason the DBD API calls the field "CountrySubDivision".
 * The address field keeps the name `province`, because the ภ.ง.ด. form uses
 * that name for the column.
 *
 * Bangkok is the only division with the subdivision names แขวง and เขต. The 76
 * provinces use ตำบล and อำเภอ. This is data in one row of the table, not a
 * rule in the code. The package does not calculate it from the status "special
 * administrative area". เมืองพัทยา has that status, but it uses ตำบล and อำเภอ.
 *
 * @module
 */

/** The 2 subdivision words of a division. */
export interface SubdivisionWords {
  /** ตำบล, or แขวง in Bangkok. */
  readonly subdistrict: "ตำบล" | "แขวง";
  /** อำเภอ, or เขต in Bangkok. */
  readonly district: "อำเภอ" | "เขต";
}

/** One top-level division: a จังหวัด, or กรุงเทพมหานคร. */
export interface Province {
  /** The ISO 3166-2:TH code, for example `"TH-50"`. */
  readonly code: string;
  /** The standard Thai name, for example `"เชียงใหม่"`. */
  readonly nameTh: string;
  /** The name in Latin characters, for example `"Chiang Mai"`. */
  readonly nameEn: string;
  /** Other spellings that occur in addresses, for example `"กทม."`. */
  readonly variants: readonly string[];
  /**
   * The word in front of this name in an address. It is `"จังหวัด"` for a
   * province. It is empty for กรุงเทพมหานคร, which is not a province.
   */
  readonly label: string;
  /** The words that this division uses for its subdivisions. */
  readonly subdivisionWords: SubdivisionWords;
}

const PROVINCIAL: SubdivisionWords = { subdistrict: "ตำบล", district: "อำเภอ" };
const METROPOLITAN: SubdivisionWords = { subdistrict: "แขวง", district: "เขต" };

/** The standard Thai name of Bangkok, which is not a จังหวัด. */
export const BANGKOK = "กรุงเทพมหานคร";

// [ISO code, Thai name, romanized name, variants]
const ROWS: readonly [string, string, string, readonly string[]][] = [
  ["TH-10", BANGKOK, "Bangkok", [
    "กรุงเทพฯ",
    "กรุงเทพ",
    "กทม.",
    "กทม",
    "Krung Thep",
    "Bangkok Metropolis",
  ]],
  ["TH-11", "สมุทรปราการ", "Samut Prakan", []],
  ["TH-12", "นนทบุรี", "Nonthaburi", []],
  ["TH-13", "ปทุมธานี", "Pathum Thani", []],
  ["TH-14", "พระนครศรีอยุธยา", "Phra Nakhon Si Ayutthaya", [
    "อยุธยา",
    "Ayutthaya",
  ]],
  ["TH-15", "อ่างทอง", "Ang Thong", []],
  ["TH-16", "ลพบุรี", "Lopburi", ["Lop Buri"]],
  ["TH-17", "สิงห์บุรี", "Sing Buri", []],
  ["TH-18", "ชัยนาท", "Chai Nat", []],
  ["TH-19", "สระบุรี", "Saraburi", ["Sara Buri"]],
  ["TH-20", "ชลบุรี", "Chon Buri", ["Chonburi"]],
  ["TH-21", "ระยอง", "Rayong", []],
  ["TH-22", "จันทบุรี", "Chanthaburi", []],
  ["TH-23", "ตราด", "Trat", []],
  ["TH-24", "ฉะเชิงเทรา", "Chachoengsao", []],
  ["TH-25", "ปราจีนบุรี", "Prachin Buri", ["Prachinburi"]],
  ["TH-26", "นครนายก", "Nakhon Nayok", []],
  ["TH-27", "สระแก้ว", "Sa Kaeo", []],
  ["TH-30", "นครราชสีมา", "Nakhon Ratchasima", ["โคราช", "Korat"]],
  ["TH-31", "บุรีรัมย์", "Buri Ram", ["Buriram"]],
  ["TH-32", "สุรินทร์", "Surin", []],
  ["TH-33", "ศรีสะเกษ", "Si Sa Ket", ["Sisaket"]],
  ["TH-34", "อุบลราชธานี", "Ubon Ratchathani", ["Ubon"]],
  ["TH-35", "ยโสธร", "Yasothon", []],
  ["TH-36", "ชัยภูมิ", "Chaiyaphum", []],
  ["TH-37", "อำนาจเจริญ", "Amnat Charoen", []],
  ["TH-38", "บึงกาฬ", "Bueng Kan", []],
  ["TH-39", "หนองบัวลำภู", "Nong Bua Lam Phu", ["Nong Bua Lamphu"]],
  ["TH-40", "ขอนแก่น", "Khon Kaen", []],
  ["TH-41", "อุดรธานี", "Udon Thani", ["Udon"]],
  ["TH-42", "เลย", "Loei", []],
  ["TH-43", "หนองคาย", "Nong Khai", []],
  ["TH-44", "มหาสารคาม", "Maha Sarakham", []],
  ["TH-45", "ร้อยเอ็ด", "Roi Et", []],
  ["TH-46", "กาฬสินธุ์", "Kalasin", []],
  ["TH-47", "สกลนคร", "Sakon Nakhon", []],
  ["TH-48", "นครพนม", "Nakhon Phanom", []],
  ["TH-49", "มุกดาหาร", "Mukdahan", []],
  ["TH-50", "เชียงใหม่", "Chiang Mai", ["Chiangmai"]],
  ["TH-51", "ลำพูน", "Lamphun", []],
  ["TH-52", "ลำปาง", "Lampang", []],
  ["TH-53", "อุตรดิตถ์", "Uttaradit", []],
  ["TH-54", "แพร่", "Phrae", []],
  ["TH-55", "น่าน", "Nan", []],
  ["TH-56", "พะเยา", "Phayao", []],
  ["TH-57", "เชียงราย", "Chiang Rai", ["Chiangrai"]],
  ["TH-58", "แม่ฮ่องสอน", "Mae Hong Son", []],
  ["TH-60", "นครสวรรค์", "Nakhon Sawan", []],
  ["TH-61", "อุทัยธานี", "Uthai Thani", []],
  ["TH-62", "กำแพงเพชร", "Kamphaeng Phet", []],
  ["TH-63", "ตาก", "Tak", []],
  ["TH-64", "สุโขทัย", "Sukhothai", []],
  ["TH-65", "พิษณุโลก", "Phitsanulok", []],
  ["TH-66", "พิจิตร", "Phichit", []],
  ["TH-67", "เพชรบูรณ์", "Phetchabun", []],
  ["TH-70", "ราชบุรี", "Ratchaburi", ["Rat Buri"]],
  ["TH-71", "กาญจนบุรี", "Kanchanaburi", []],
  ["TH-72", "สุพรรณบุรี", "Suphan Buri", ["Suphanburi"]],
  ["TH-73", "นครปฐม", "Nakhon Pathom", []],
  ["TH-74", "สมุทรสาคร", "Samut Sakhon", []],
  ["TH-75", "สมุทรสงคราม", "Samut Songkhram", []],
  ["TH-76", "เพชรบุรี", "Phetchaburi", ["Phetburi"]],
  ["TH-77", "ประจวบคีรีขันธ์", "Prachuap Khiri Khan", []],
  ["TH-80", "นครศรีธรรมราช", "Nakhon Si Thammarat", []],
  ["TH-81", "กระบี่", "Krabi", []],
  ["TH-82", "พังงา", "Phang Nga", ["Phangnga"]],
  ["TH-83", "ภูเก็ต", "Phuket", []],
  ["TH-84", "สุราษฎร์ธานี", "Surat Thani", ["Surat"]],
  ["TH-85", "ระนอง", "Ranong", []],
  ["TH-86", "ชุมพร", "Chumphon", []],
  ["TH-90", "สงขลา", "Songkhla", []],
  ["TH-91", "สตูล", "Satun", []],
  ["TH-92", "ตรัง", "Trang", []],
  ["TH-93", "พัทลุง", "Phatthalung", ["Patthalung"]],
  ["TH-94", "ปัตตานี", "Pattani", []],
  ["TH-95", "ยะลา", "Yala", []],
  ["TH-96", "นราธิวาส", "Narathiwat", []],
];

/** All 77 divisions, in the sequence of the ISO codes. Bangkok is first. */
export const PROVINCES: readonly Province[] = ROWS.map(
  ([code, nameTh, nameEn, variants]) => ({
    code,
    nameTh,
    nameEn,
    variants,
    label: nameTh === BANGKOK ? "" : "จังหวัด",
    subdivisionWords: nameTh === BANGKOK ? METROPOLITAN : PROVINCIAL,
  }),
);

const BY_NAME = new Map<string, Province>();
for (const province of PROVINCES) {
  for (const name of [province.nameTh, province.nameEn, ...province.variants]) {
    BY_NAME.set(name.toLowerCase(), province);
  }
}

/** Remove a `จังหวัด` or `จ.` label and the spaces around the name. */
function bare(input: string): string {
  return input.trim().replace(/^(?:จังหวัด|จ\.)\s*/, "").trim();
}

/**
 * Find a division by any of its spellings: Thai, Latin characters, or a short
 * form. A `จังหวัด` or `จ.` label in front of the name is permitted.
 *
 * ```ts
 * findProvince("กทม.")?.nameTh;        // "กรุงเทพมหานคร"
 * findProvince("จ.เชียงใหม่")?.code;   // "TH-50"
 * ```
 */
export function findProvince(input: string): Province | undefined {
  return BY_NAME.get(bare(input).toLowerCase());
}

/**
 * The subdivision words to print for a division: แขวง and เขต for Bangkok,
 * ตำบล and อำเภอ for all other divisions.
 *
 * {@linkcode findProvince} cannot give you this answer for a division that the
 * table does not know. Such a division uses ตำบล and อำเภอ.
 *
 * ```ts
 * subdivisionWords("กทม.");      // { subdistrict: "แขวง", district: "เขต" }
 * subdivisionWords("เชียงใหม่"); // { subdistrict: "ตำบล", district: "อำเภอ" }
 * ```
 */
export function subdivisionWords(province: string): SubdivisionWords {
  return findProvince(province)?.subdivisionWords ?? PROVINCIAL;
}

/**
 * Remove a division name from the end of a value. The function examines the
 * last 1, 2 or 3 words.
 *
 * This lets a parser read กรุงเทพมหานคร again after a write operation, because
 * that name has no `จังหวัด` label in front of it. The comparison with the 77
 * names must be exact.
 */
export function splitTrailingDivision(
  value: string,
): { division: string; rest: string } | undefined {
  const tokens = value.split(" ");
  for (
    let index = Math.max(0, tokens.length - 3);
    index < tokens.length;
    index++
  ) {
    const candidate = tokens.slice(index).join(" ");
    if (findProvince(candidate)) {
      return { division: candidate, rest: tokens.slice(0, index).join(" ") };
    }
  }
  return undefined;
}
