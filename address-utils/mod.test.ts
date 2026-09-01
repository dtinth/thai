import test from "node:test";
import assert from "node:assert/strict";
import {
  type Address,
  foreignAddress,
  formatAddress,
  importAddress,
  parseAddress,
  PROVINCES,
  relabelSubdivisions,
  subdivisionWords,
  THAI_ADDRESS_FIELDS,
  thaiAddress,
} from "./mod.ts";
import { FIELD_SPECS } from "./fields.ts";

/** Every field value, so a test can look for text without naming the field. */
function values(address: Address): string {
  return Object.entries(address)
    .filter(([key]) => key !== "kind")
    .map(([, value]) => value)
    .join(" ");
}

/**
 * The invariant that matters most: nothing evaporates. Every token of the input
 * survives into some field, once its own label is taken off the front.
 */
function assertNothingLost(input: string, address: Address): void {
  const joined = values(address);
  for (const token of input.split(/[\s,]+/).filter(Boolean)) {
    // Longest label first, exactly as the parser matches them, so หมู่บ้าน is
    // not read as หมู่ + "บ้าน…".
    const label = FIELD_SPECS.flatMap((spec) => spec.accepted)
      .filter((candidate) => token.startsWith(candidate))
      .sort((a, b) => b.length - a.length)[0] ?? "";
    const remainder = token.slice(label.length);
    if (!remainder) continue;
    assert.ok(
      joined.includes(remainder),
      `"${remainder}" disappeared while reading "${input}"`,
    );
  }
}

const FULL_BANGKOK = thaiAddress({
  addressNo: "99/1",
  moo: "2",
  village: "สวนทอง",
  soi: "สุขใจ",
  road: "สุขุมวิท",
  building: "เอบีซี",
  floor: "5",
  room: "501",
  subdistrict: "คลองตัน",
  district: "วัฒนา",
  province: "กรุงเทพมหานคร",
  postalCode: "10110",
});

test("formats a Bangkok address with แขวง/เขต", () => {
  assert.equal(
    formatAddress(FULL_BANGKOK),
    "เลขที่ 99/1 หมู่ที่ 2 หมู่บ้านสวนทอง ซอยสุขใจ ถนนสุขุมวิท อาคารเอบีซี ชั้น 5 " +
      "ห้องเลขที่ 501 แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110",
  );
});

test("formats a provincial address with ตำบล/อำเภอ", () => {
  const address = thaiAddress({
    subdistrict: "สุเทพ",
    district: "เมืองเชียงใหม่",
    province: "เชียงใหม่",
    postalCode: "50200",
  });
  assert.equal(
    formatAddress(address),
    "ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50200",
  );
});

test("writes กรุงเทพมหานคร with no จังหวัด label, in any spelling", () => {
  const address = thaiAddress({
    subdistrict: "แสมดำ",
    district: "บางขุนเทียน",
    province: "กทม.",
  });
  assert.equal(formatAddress(address), "แขวงแสมดำ เขตบางขุนเทียน กทม.");
});

const ROUND_TRIP: readonly [string, Address][] = [
  ["a full Bangkok address", FULL_BANGKOK],
  [
    "a provincial address",
    thaiAddress({
      addressNo: "9",
      moo: "4",
      subdistrict: "บางพลีใหญ่",
      district: "บางพลี",
      province: "สมุทรปราการ",
      postalCode: "10540",
    }),
  ],
  [
    "street fields only, no geo tail",
    thaiAddress({ addressNo: "12", road: "สุขุมวิท" }),
  ],
  [
    "a postal code with no province",
    thaiAddress({
      subdistrict: "คลองตัน",
      district: "วัฒนา",
      postalCode: "10110",
    }),
  ],
  ["a village on its own", thaiAddress({ village: "สวนทอง" })],
  ["กรุงเทพมหานคร on its own", thaiAddress({ province: "กรุงเทพมหานคร" })],
  [
    "an abbreviated Bangkok",
    thaiAddress({
      district: "บางขุนเทียน",
      province: "กทม.",
      postalCode: "10150",
    }),
  ],
  [
    "a province the table has never heard of",
    thaiAddress({
      district: "เมืองใหม่",
      province: "มณฑลพิเศษ",
      postalCode: "10150",
    }),
  ],
  ["a moo on its own", thaiAddress({ moo: "2" })],
  [
    "a soi that contains the word ซอย",
    thaiAddress({
      addressNo: "58-60",
      soi: "พระรามที่ 3 ซอย 29",
      subdistrict: "บางโพงพาง",
      district: "ยานนาวา",
      province: "กรุงเทพมหานคร",
      postalCode: "10120",
    }),
  ],
  [
    "a building name that starts with อาคาร",
    thaiAddress({ building: "อาคารเอบีซี" }),
  ],
  [
    "a foreign address",
    foreignAddress({
      addressNo: "221B",
      road: "Baker Street",
      city: "London",
      country: "United Kingdom",
    }),
  ],
  [
    "a foreign address with no street number",
    foreignAddress({
      road: "Baker Street",
      city: "London",
      country: "United Kingdom",
    }),
  ],
  ["a country on its own", foreignAddress({ country: "Singapore" })],
  [
    "a postal code in Thai digits",
    thaiAddress({
      district: "วัฒนา",
      province: "กรุงเทพมหานคร",
      postalCode: "๑๐๑๑๐",
    }),
  ],
  [
    "a value with 2 spaces in it",
    thaiAddress({ road: "พระราม  4", province: "เชียงใหม่" }),
  ],
  [
    "a foreign address in Thai characters",
    foreignAddress({ city: "โตเกียว", country: "ญี่ปุ่น" }),
  ],
  [
    "a foreign road that starts with a digit",
    foreignAddress({ road: "3rd Avenue", city: "New York", country: "USA" }),
  ],
  [
    "a foreign address with no city",
    foreignAddress({ addressNo: "58-60", country: "United Kingdom" }),
  ],
];

for (const [name, address] of ROUND_TRIP) {
  test(`round-trips ${name}`, () => {
    const text = formatAddress(address);
    const parsed = parseAddress(text);
    assert.deepEqual(parsed.address, address);
    assert.deepEqual(parsed.warnings, []);
    assertNothingLost(text, parsed.address);
  });
}

test("reads a legacy Bangkok address written with ตำบล/อำเภอ, and corrects it", () => {
  const legacy = "เลขที่ 1 ตำบลแสมดำ อำเภอบางขุนเทียน จังหวัดกรุงเทพมหานคร 10150";
  const { address, warnings } = parseAddress(legacy);
  assert.deepEqual(
    address,
    thaiAddress({
      addressNo: "1",
      subdistrict: "แสมดำ",
      district: "บางขุนเทียน",
      province: "กรุงเทพมหานคร",
      postalCode: "10150",
    }),
  );
  assert.deepEqual(warnings, []);
  assert.equal(
    formatAddress(address),
    "เลขที่ 1 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150",
  );
});

test("keeps text that carried no label, and says so", () => {
  const text = "99/1 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา จังหวัดกรุงเทพมหานคร 10110";
  const { address, warnings } = parseAddress(text);
  assert.equal(address.kind === "thai" && address.addressNo, "99/1");
  assert.equal(address.kind === "thai" && address.road, "สุขุมวิท");
  assert.deepEqual(warnings.map((warning) => warning.code), [
    "unlabelled-text",
  ]);
  assertNothingLost(text, address);
});

test("never returns an empty address for non-empty input", () => {
  for (
    const text of [
      "บ้านสวนริมน้ำ",
      "99/1",
      "๑๐๑๕๐",
      "ที่อยู่ไม่ทราบแน่ชัด",
      "58-60 ซอย พระรามที่ 3 ซอย 29",
    ]
  ) {
    const { address } = parseAddress(text);
    assert.notEqual(values(address).trim(), "", `emptied "${text}"`);
    assertNothingLost(text, address);
  }
});

test("keeps the จังหวัด label for the seventy-six that are provinces", () => {
  assert.equal(
    formatAddress(thaiAddress({ province: "เชียงใหม่" })),
    "จังหวัดเชียงใหม่",
  );
  // A division the table does not know keeps the label too, so it stays readable.
  assert.equal(
    formatAddress(thaiAddress({ province: "มณฑลพิเศษ" })),
    "จังหวัดมณฑลพิเศษ",
  );
});

test("keeps the 12 fields for every combination of them", () => {
  // The values contain the difficult data: a label word in a value, 2 spaces,
  // Thai digits, and a Latin value.
  const samples: Record<string, string> = {
    addressNo: "99/1",
    moo: "2",
    village: "สวนทอง",
    soi: "พระรามที่ 3 ซอย 29",
    road: "พระราม  4",
    building: "อาคารเอบีซี",
    floor: "5",
    room: "L5",
    subdistrict: "คลองตัน",
    district: "วัฒนา",
    province: "กรุงเทพมหานคร",
    postalCode: "๑๐๑๑๐",
  };
  let count = 0;
  for (let mask = 0; mask < (1 << THAI_ADDRESS_FIELDS.length); mask++) {
    const init: Record<string, string> = {};
    THAI_ADDRESS_FIELDS.forEach((field, index) => {
      if (mask & (1 << index)) init[field] = samples[field]!;
    });
    const address = thaiAddress(init);
    const text = formatAddress(address);
    const result = parseAddress(text);
    assert.deepEqual(result.address, address, text);
    assert.deepEqual(result.warnings, [], text);
    count++;
  }
  assert.equal(count, 4096);
});

test("a foreign address must have a country", () => {
  // The parser reads a foreign address from the right. Therefore the last part
  // is always the country. An address with no country keeps all of its text,
  // but the last field goes into the country field.
  const { address } = parseAddress(
    formatAddress(foreignAddress({ city: "London" })),
  );
  assert.deepEqual(address, foreignAddress({ country: "London" }));
});

test("reads an empty string as an empty Thai address", () => {
  assert.deepEqual(parseAddress("   ").address, thaiAddress());
  assert.deepEqual(parseAddress("").warnings, []);
});

test("knows the seventy-seven top-level divisions", () => {
  assert.equal(PROVINCES.length, 77);
  assert.equal(new Set(PROVINCES.map((province) => province.code)).size, 77);
  for (
    const spelling of ["กทม.", "กรุงเทพฯ", "กรุงเทพ", "จ.กรุงเทพมหานคร", "Bangkok"]
  ) {
    const words = { subdistrict: "แขวง", district: "เขต" };
    assert.deepEqual(subdivisionWords(spelling), words, spelling);
  }
  // เมืองพัทยา is a special administrative area too and still writes ตำบล/อำเภอ,
  // as does any province the table has never heard of.
  for (const spelling of ["เชียงใหม่", "พัทยา", "ไม่มีจังหวัดนี้"]) {
    const words = { subdistrict: "ตำบล", district: "อำเภอ" };
    assert.deepEqual(subdivisionWords(spelling), words, spelling);
  }
});

// ── importAddress ────────────────────────────────────────────────────────────

test("imports a pasted Bangkok address with no จังหวัด label", () => {
  const text = "99/1 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110";
  const { address, warnings } = importAddress(text);
  assert.deepEqual(
    address,
    thaiAddress({
      addressNo: "99/1",
      road: "สุขุมวิท",
      subdistrict: "คลองตัน",
      district: "วัฒนา",
      province: "กรุงเทพมหานคร",
      postalCode: "10110",
    }),
  );
  // Only the house number: กรุงเทพมหานคร is an exact table match, not a guess.
  assert.deepEqual(warnings.map((warning) => warning.code), [
    "unlabelled-text",
  ]);
  assertNothingLost(text, address);
});

test("keeps a soi value that contains the word ซอย", () => {
  const text =
    "58-60 ซอยพระรามที่ 3 ซอย 29 แขวงบางโพงพาง เขตยานนาวา กรุงเทพมหานคร 10120";
  const { address } = importAddress(text);
  assert.equal(address.kind === "thai" && address.soi, "พระรามที่ 3 ซอย 29");
  assertNothingLost(text, address);
});

test("re-splits a floor and room that arrived inside the building name", () => {
  // What a registry hands over: everything crammed into one field.
  const dirty = thaiAddress({
    addressNo: "111 ทรู ดิจิทัล พาร์ค เวสต์",
    building: "ยูนิคอร์น ชั้น 10 ยูนิต 1015,1018",
    road: "สุขุมวิท",
    subdistrict: "บางจาก",
    district: "พระโขนง",
    province: "กรุงเทพมหานคร",
  });
  const { address } = importAddress(formatAddress(dirty));
  assert.equal(address.kind === "thai" && address.building, "ยูนิคอร์น");
  assert.equal(address.kind === "thai" && address.floor, "10");
  assert.equal(address.kind === "thai" && address.room, "1015 1018");
  assert.equal(address.kind === "thai" && address.road, "สุขุมวิท");
});

test("does not mistake อำเภอเมือง<province> for a glued province", () => {
  const { address } = importAddress("99/1 ต.สุเทพ อ.เมืองเชียงใหม่ 50200");
  assert.equal(address.kind === "thai" && address.district, "เมืองเชียงใหม่");
  assert.equal(address.kind === "thai" && address.province, "");
});

test("splits a province glued to the district", () => {
  const { address } = importAddress("1 แขวงแสมดำ เขตบางขุนเทียนกรุงเทพฯ 10150");
  assert.equal(address.kind === "thai" && address.district, "บางขุนเทียน");
  assert.equal(address.kind === "thai" && address.province, "กรุงเทพฯ");
});

test("normalises Thai digits and unglues a postal code", () => {
  const { address } = importAddress(
    "1 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร๑๐๑๕๐",
  );
  assert.equal(address.kind === "thai" && address.postalCode, "10150");
  assert.equal(address.kind === "thai" && address.province, "กรุงเทพมหานคร");
});

test("flags ตำบล/อำเภอ on a Bangkok address, and formatting corrects it", () => {
  const text = "เลขที่ 1 ตำบลแสมดำ อำเภอบางขุนเทียน กรุงเทพมหานคร 10150";
  const { address, warnings } = importAddress(text);
  assert.ok(warnings.some((warning) => warning.code === "subdivision-wording"));
  assert.equal(
    formatAddress(address),
    "เลขที่ 1 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150",
  );
});

test("flags a province it does not know", () => {
  const { address, warnings } = importAddress(
    "1 ตำบลก อำเภอข จังหวัดมณฑลพิเศษ 10150",
  );
  assert.equal(address.kind === "thai" && address.province, "มณฑลพิเศษ");
  assert.ok(warnings.some((warning) => warning.code === "unknown-province"));
});

test("imports a foreign address", () => {
  const { address } = importAddress(
    "221B Baker Street, London, United Kingdom",
  );
  assert.deepEqual(
    address,
    foreignAddress({
      addressNo: "221B",
      road: "Baker Street",
      city: "London",
      country: "United Kingdom",
    }),
  );
});

test("importAddress never loses text or empties an address", () => {
  for (
    const text of [
      "1448/20 อาคารL5 ซอยลาดพร้าว 87 (จันทราสุข) แขวงคลองจั่น เขตบางกะปิ กรุงเทพมหานคร 10240",
      "99/1 หมู่ 2 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ 10540",
      "เลขที่ 1\nถนนพระราม 4\nแขวงคลองเตย เขตคลองเตย\nกรุงเทพฯ 10110",
      "บ้านสวนริมน้ำ ไม่มีเลขที่",
      "1 ตำบลแสมดำ อำเภอบางขุนเทียน กรุงเทพมหานคร 10150 โทร 02-123-4567",
    ]
  ) {
    const { address } = importAddress(text);
    assert.notEqual(values(address).trim(), "", `emptied "${text}"`);
    assertNothingLost(text, address);
  }
});

// ── relabelSubdivisions ──────────────────────────────────────────────────────

const RELABEL: readonly [string, string, string][] = [
  [
    "corrects a Bangkok address",
    "เลขที่ 1 ตำบลแสมดำ อำเภอบางขุนเทียน จังหวัดกรุงเทพมหานคร 10150",
    "เลขที่ 1 แขวงแสมดำ เขตบางขุนเทียน จังหวัดกรุงเทพมหานคร 10150",
  ],
  [
    "finds the division that has no label",
    "1 ตำบลแสมดำ อำเภอบางขุนเทียน กรุงเทพฯ 10150",
    "1 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพฯ 10150",
  ],
  [
    "writes the short labels in full",
    "1 ต.แสมดำ อ.บางขุนเทียน จ.กรุงเทพมหานคร 10150",
    "1 แขวงแสมดำ เขตบางขุนเทียน จ.กรุงเทพมหานคร 10150",
  ],
  [
    "looks past the name of the country",
    "1 ตำบลแสมดำ อำเภอบางขุนเทียน กรุงเทพมหานคร 10150 ประเทศไทย",
    "1 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150 ประเทศไทย",
  ],
  [
    "looks past a postal code in Thai digits",
    "1 ตำบลแสมดำ อำเภอบางขุนเทียน กรุงเทพมหานคร ๑๐๑๕๐",
    "1 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร ๑๐๑๕๐",
  ],
  [
    "finds a division that touches the word in front of it",
    "1 ตำบลแสมดำ อำเภอบางขุนเทียนกรุงเทพฯ",
    "1 แขวงแสมดำ เขตบางขุนเทียนกรุงเทพฯ",
  ],
];

for (const [name, input, expected] of RELABEL) {
  test(`relabelSubdivisions ${name}`, () => {
    assert.equal(relabelSubdivisions(input), expected);
  });
}

const RELABEL_UNCHANGED: readonly [string, string][] = [
  ["a provincial address", "9 ตำบลบางพลีใหญ่ อำเภอบางพลี จังหวัดสมุทรปราการ 10540"],
  // The one rule that matters most: never the other direction. This address is
  // in Bangkok, but it does not say so, and a guess could make it incorrect.
  ["แขวง and เขต with no division", "1 แขวงแสมดำ เขตบางขุนเทียน 10150"],
  ["แขวง and เขต and no other text", "แขวงคลองตัน เขตวัฒนา 10110"],
  [
    "a road with the name of a division in it",
    "9 ถนนกรุงเทพ-ชลบุรี ตำบลบางแก้ว อำเภอบางพลี จังหวัดสมุทรปราการ",
  ],
  [
    "a building with the name of a division in it",
    "9 อาคารกรุงเทพประกันภัย ตำบลบางพลี อำเภอบางพลี จังหวัดสมุทรปราการ",
  ],
  [
    "a word inside the name of a village",
    "1 หมู่บ้านตำบลทอง แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150",
  ],
  ["no text", ""],
  ["a foreign address", "1 Test Road, Singapore"],
];

for (const [name, input] of RELABEL_UNCHANGED) {
  test(`relabelSubdivisions does not change ${name}`, () => {
    assert.equal(relabelSubdivisions(input), input);
  });
}

test("relabelSubdivisions adds no label and moves no text", () => {
  // Unlike formatAddress(parseAddress(text)), it is not a re-write: a house
  // number with no label keeps no label, and nothing changes its position.
  assert.equal(
    relabelSubdivisions(
      "99/1 ถนนสุขุมวิท ตำบลคลองตัน อำเภอวัฒนา กรุงเทพมหานคร 10110",
    ),
    "99/1 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110",
  );
});
