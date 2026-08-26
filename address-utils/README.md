The `@thai/address-utils` package handles Thai postal addresses as structured
data: **twelve fields** for a Thai address and **four** for a foreign one, taken
from the Revenue Department's ภ.ง.ด.53 and ภ.ง.ด.54 layouts — the same fields
those forms ask for, so an address stored this way can fill them in.

```ts
import { formatAddress, parseAddress, thaiAddress } from "@thai/address-utils";

const address = thaiAddress({
  addressNo: "99/1",
  road: "สุขุมวิท",
  subdistrict: "คลองตัน",
  district: "วัฒนา",
  province: "กรุงเทพมหานคร",
  postalCode: "10110",
});

formatAddress(address);
// "เลขที่ 99/1 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา จังหวัดกรุงเทพมหานคร 10110"

parseAddress(formatAddress(address)).address; // the same twelve fields, unchanged
```

## The fields

| Field         | Thai        | ภ.ง.ด. column  |
| ------------- | ----------- | -------------- |
| `addressNo`   | เลขที่        | `ADD_NO`       |
| `moo`         | หมู่ที่         | `MOO_NO`       |
| `village`     | หมู่บ้าน       | `VILLAGE_NAME` |
| `soi`         | ซอย         | `SOI`          |
| `road`        | ถนน         | `STREET_NAME`  |
| `building`    | อาคาร       | `BUILD_NAME`   |
| `floor`       | ชั้นที่         | `FLOOR_NO`     |
| `room`        | ห้องเลขที่     | `ROOM_NO`      |
| `subdistrict` | ตำบล / แขวง | `TAMBON`       |
| `district`    | อำเภอ / เขต | `AMPHUR`       |
| `province`    | จังหวัด       | `PROVINCE`     |
| `postalCode`  | รหัสไปรษณีย์   | `POSTAL_CODE`  |

A foreign address carries `addressNo`, `road`, `city` and `country`, matching
ภ.ง.ด.54's office-location block. Every field is a `string` and always present —
an absent value is `""` — so reading one never needs a fallback. The two shapes
are told apart by `kind`, never by the country field.

## Two parsers, on purpose

`parseAddress` reads this package's own format and nothing else: no tables, no
guessing, an exact inverse of `formatAddress`.

`importAddress` reads text from a person or another system: line breaks and
commas as separators, Thai digits, a postal code glued to the word before it,
and a province written with no `จังหวัด` label in front of it.

Both return the same thing — an address, always, plus warnings:

```ts
interface ParsedAddress {
  address: Address; // never empty for non-empty input
  warnings: readonly Warning[]; // "unlabelled-text" | "unknown-province" | "subdivision-wording"
}
```

Neither ever throws, and neither ever drops text. **Nothing evaporates**: every
character that isn't a label they recognised ends up in some field. The worst
case is a value in the wrong field, where a person reviewing the result can see
it — never a value that quietly disappeared.

```ts
importAddress("99/1 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110");
// address: { addressNo: "99/1", road: "สุขุมวิท", subdistrict: "คลองตัน",
//            district: "วัฒนา", province: "กรุงเทพมหานคร", postalCode: "10110", … }
// warnings: two "unlabelled-text" — the house number and the province carried no label
```

## Bangkok

Thailand has seventy-six จังหวัด plus กรุงเทพมหานคร, which is not a จังหวัด at all
but a metropolitan administration of the same rank — which is why the DBD's API
calls this field "CountrySubDivision". The address field keeps the name
`province`, because that is what the ภ.ง.ด. column is called.

Bangkok is the only one of the seventy-seven whose subdivisions are named แขวง
and เขต; the provinces use ตำบล and อำเภอ. That lives as one row in the table
rather than as a rule spread through the code — and it is deliberately not
derived from "special administrative area", because เมืองพัทยา is one of those too
and still writes ตำบล/อำเภอ.

```ts
subdivisionWords("กทม."); // { subdistrict: "แขวง", district: "เขต" }
subdivisionWords("เชียงใหม่"); // { subdistrict: "ตำบล", district: "อำเภอ" }
findProvince("จ.ภูเก็ต")?.code; // "TH-83"
```

Everything else about a division comes off the row itself — `findProvince`
matches Thai, romanized and abbreviated spellings, with or without a `จังหวัด` /
`จ.` prefix. `subdivisionWords` exists alongside it for the one case a row
cannot answer: a province the table does not know still writes ตำบล/อำเภอ.

Parsing accepts both wordings for either province, so an address written
`ตำบล`/`อำเภอ` in Bangkok — by hand, or by an older version of some other
program — reads back correctly. Formatting then writes the right words, so a
round trip corrects it:

```ts
const wrong = "เลขที่ 1 ตำบลแสมดำ อำเภอบางขุนเทียน จังหวัดกรุงเทพมหานคร 10150";
formatAddress(parseAddress(wrong).address);
// "เลขที่ 1 แขวงแสมดำ เขตบางขุนเทียน จังหวัดกรุงเทพมหานคร 10150"
```

## Field values that contain other fields' labels

Labels are only read in the order an address is printed, so a value containing
an _earlier_ field's label word is safe — `ซอยพระรามที่ 3 ซอย 29` keeps its soi
whole. A value containing a _later_ field's label word does split there, which
is the same rule working in your favour when a registry crams several fields
into one:

```ts
// what an upstream API returned: building, floor and room in one field
const dirty = thaiAddress({ building: "ยูนิคอร์น ชั้น 10 ยูนิต 1015,1018" });
importAddress(formatAddress(dirty)).address;
// building: "ยูนิคอร์น", floor: "10", room: "1015 1018"
```

## What this package does not do

- **No tambon/amphoe database.** Only the seventy-seven divisions are built in
  (a few kilobytes). Reconciling a subdistrict against a postal code needs the
  ~7,400-row table, which belongs somewhere else.
- **No validation function.** Validating an address means parsing it, so the
  parsers report what they noticed and there is nothing else to call.
- **No transliteration**, and no address-line splitting beyond the labels above.

## API

```ts
formatAddress(address: Address): string;
parseAddress(text: string): ParsedAddress;
importAddress(text: string): ParsedAddress;

thaiAddress(init?): ThaiAddress;
foreignAddress(init?): ForeignAddress;
isThaiAddress(address): address is ThaiAddress;
THAI_ADDRESS_FIELDS: readonly ThaiAddressField[];

PROVINCES: readonly Province[];
findProvince(input: string): Province | undefined;
subdivisionWords(province: string): SubdivisionWords;
BANGKOK: string;
```
