The `@thai/text-cleaner` package provides the `normalizeThaiText` function, which
fixes common Thai Unicode encoding mistakes (misordered tone marks, duplicated
floating marks, `เเ` typed instead of `แ`, etc.) so text renders and compares
consistently.

## Usage

```ts
import { normalizeThaiText } from "@thai/text-cleaner";

normalizeThaiText("เเม่"); // "แม่" (double sara e → sara ae)
normalizeThaiText("เข้ียว"); // "เขี้ยว" (tone mark reordered after the vowel)
```

It only touches runs of Thai script and leaves everything else untouched, so
it's safe to run over mixed-language text.
