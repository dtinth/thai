/**
 * The seventy-seven provinces plus Bangkok, and the subdivision words each one
 * uses.
 *
 * Bangkok is the only province whose subdivisions are named แขวง and เขต;
 * everywhere else they are ตำบล and อำเภอ. That is a property of one row in
 * this table, not a rule scattered through the code — and it is deliberately
 * not derived from "is a special administrative area", because เมืองพัทยา is
 * one too and still writes ตำบล/อำเภอ.
 *
 * @module
 */

/** The two subdivision words a province uses. */
export interface SubdivisionWords {
  /** ตำบล, or แขวง in Bangkok. */
  readonly subdistrict: "ตำบล" | "แขวง";
  /** อำเภอ, or เขต in Bangkok. */
  readonly district: "อำเภอ" | "เขต";
}

/** One province. */
export interface Province {
  /** ISO 3166-2:TH code, e.g. `"TH-50"`. */
  readonly code: string;
  /** Canonical Thai name, e.g. `"เชียงใหม่"`. */
  readonly nameTh: string;
  /** Romanized name, e.g. `"Chiang Mai"`. */
  readonly nameEn: string;
  /** Other spellings seen in the wild, e.g. `"กทม."` for Bangkok. */
  readonly variants: readonly string[];
  /** The words this province uses for its subdivisions. */
  readonly subdivisionWords: SubdivisionWords;
}

const PROVINCIAL: SubdivisionWords = { subdistrict: "ตำบล", district: "อำเภอ" };
const METROPOLITAN: SubdivisionWords = { subdistrict: "แขวง", district: "เขต" };

/** Canonical Thai name of Bangkok. */
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

/** Every province, in ISO code order. Bangkok is first. */
export const PROVINCES: readonly Province[] = ROWS.map(
  ([code, nameTh, nameEn, variants]) => ({
    code,
    nameTh,
    nameEn,
    variants,
    subdivisionWords: nameTh === BANGKOK ? METROPOLITAN : PROVINCIAL,
  }),
);

const BY_NAME = new Map<string, Province>();
for (const province of PROVINCES) {
  for (const name of [province.nameTh, province.nameEn, ...province.variants]) {
    BY_NAME.set(name.toLowerCase(), province);
  }
}

/** Drop a `จังหวัด` / `จ.` prefix and surrounding whitespace. */
function bare(input: string): string {
  return input.trim().replace(/^(?:จังหวัด|จ\.)\s*/, "").trim();
}

/**
 * Look a province up by any of its spellings — Thai, romanized, abbreviated,
 * with or without a `จังหวัด` / `จ.` prefix.
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
 * The subdivision words to print for a province — แขวง/เขต for Bangkok,
 * ตำบล/อำเภอ for everything else.
 *
 * The one thing {@linkcode findProvince} cannot give you: a province the table
 * does not know still needs an answer, and it is ตำบล/อำเภอ.
 *
 * ```ts
 * subdivisionWords("กทม.");      // { subdistrict: "แขวง", district: "เขต" }
 * subdivisionWords("เชียงใหม่"); // { subdistrict: "ตำบล", district: "อำเภอ" }
 * ```
 */
export function subdivisionWords(province: string): SubdivisionWords {
  return findProvince(province)?.subdivisionWords ?? PROVINCIAL;
}
