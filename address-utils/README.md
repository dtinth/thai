The `@thai/address-utils` package gives you a Thai postal address as data. A
Thai address has 12 fields. A foreign address has 4 fields. The fields come from
the Revenue Department forms ภ.ง.ด.53 and ภ.ง.ด.54. You can use an address in
this shape to complete those forms.

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
// "เลขที่ 99/1 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110"

parseAddress(formatAddress(address)).address; // the same 12 fields, not changed
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

A foreign address has 4 fields: `addressNo`, `road`, `city` and `country`. These
fields are the same as the fields in the office block of the ภ.ง.ด.54 form.

Each field is a string. Each field is always present. A field with no data is an
empty string. You do not need a default value when you read a field.

The `kind` property tells you which of the 2 shapes an address has. The country
field does not have this function.

## Two functions that read text

`parseAddress` reads only the format of this package. It gives you the same
fields that `formatAddress` wrote. It does not try to correct unusual text.

`importAddress` reads text from a person or from a different system. It accepts
line breaks and commas between the fields. It accepts Thai digits. It accepts a
postal code that touches the word in front of it. It also accepts a division
name that has no `จังหวัด` label.

The 2 functions give the same result:

```ts
interface ParsedAddress {
  address: Address; // always an address, also for text the parser does not know
  warnings: readonly Warning[]; // "unlabelled-text" | "unknown-province" | "subdivision-wording"
}
```

Both functions have the same 3 rules:

- They do not throw an error.
- They always give you an address. Text that is not empty does not give you an
  empty address.
- They keep all of the text. Each character that is not a label of this package
  goes into a field.

In the worst condition, a value goes into the incorrect field. A person who
examines the result can see that value and can correct it. The parsers do not
delete text.

If there are no warnings, the text was already in the format of this package.

```ts
importAddress("99/1 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพมหานคร 10110");
// address: { addressNo: "99/1", road: "สุขุมวิท", subdistrict: "คลองตัน",
//            district: "วัฒนา", province: "กรุงเทพมหานคร", postalCode: "10110", … }
// warnings: one "unlabelled-text", because the house number has no label
```

## Bangkok

Thailand has 76 จังหวัด. It also has กรุงเทพมหานคร, which is not a จังหวัด.
กรุงเทพมหานคร is a metropolitan administration of the same rank. For this reason
the DBD API calls the field "CountrySubDivision". The address field keeps the
name `province`, because the ภ.ง.ด. form uses that name for the column.

There are 2 results, and you see both of them in the address that you print:

- The subdivisions of Bangkok have the names แขวง and เขต. The 76 provinces use
  ตำบล and อำเภอ.
- The name กรุงเทพมหานคร has no label in front of it. The label จังหวัด is only for
  the 76 provinces.

These 2 facts are data in one row of the table of divisions. They are not rules
in the code. The package does not calculate them from the status "special
administrative area". เมืองพัทยา has that status, but เมืองพัทยา uses ตำบล and
อำเภอ.

```ts
formatAddress(thaiAddress({ district: "วัฒนา", province: "กรุงเทพมหานคร" }));
// "เขตวัฒนา กรุงเทพมหานคร"   — no จังหวัด, because Bangkok is not one
formatAddress(thaiAddress({ district: "เมืองเชียงใหม่", province: "เชียงใหม่" }));
// "อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่"

subdivisionWords("กทม."); // { subdistrict: "แขวง", district: "เขต" }
subdivisionWords("เชียงใหม่"); // { subdistrict: "ตำบล", district: "อำเภอ" }
findProvince("จ.ภูเก็ต")?.code; // "TH-83"
```

`findProvince` accepts a Thai name, a Latin name and a short name. You can also
write a `จังหวัด` or `จ.` label in front of the name. The row that it gives you
contains the other data. Use `subdivisionWords` for a division that the table
does not know. That division uses ตำบล and อำเภอ.

Both parsers accept ตำบล and อำเภอ for all divisions. The package can read a
Bangkok address that has the incorrect words. `formatAddress` then writes the
correct words. When you read the address and then write it again, the words
become correct:

```ts
const wrong = "เลขที่ 1 ตำบลแสมดำ อำเภอบางขุนเทียน จังหวัดกรุงเทพมหานคร 10150";
formatAddress(parseAddress(wrong).address);
// "เลขที่ 1 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150"
```

## A value that contains the label of a different field

The parsers find the labels in the sequence of the printed address. A value that
contains the label of a field before it is safe. The soi `พระรามที่ 3 ซอย 29`
keeps all of its text, because `ซอย` is not a label at that position.

A parser divides a value that contains the label of a field after it. This
behavior is correct when a different system puts more than one field into one
field:

```ts
// An API gave the building name, the floor and the room in one field.
const dirty = thaiAddress({ building: "ยูนิคอร์น ชั้น 10 ยูนิต 1015,1018" });
importAddress(formatAddress(dirty)).address;
// building: "ยูนิคอร์น", floor: "10", room: "1015 1018"
```

## Limits

- The package does not contain a database of subdistricts and districts. It
  contains only the table of 77 divisions, which is small. A comparison of a
  subdistrict with a postal code needs approximately 7,400 more rows. That data
  belongs in a different package.
- The package has no function to validate an address. To validate an address,
  you must first parse it. The parsers give you the warnings. A second function
  is not necessary.
- The package does not change Thai text to Latin characters.
