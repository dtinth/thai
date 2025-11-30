// Thai Unicode ranges
const THAI = {
  // Consonants: ก-ฮ
  CONSONANT: "\u0E01-\u0E2E",

  // Tone marks: ่ ้ ๊ ๋
  TONE: "\u0E48-\u0E4B",

  // Upper vowels: ิ ี ึ ื
  UPPER_VOWEL: "\u0E34-\u0E37",

  // Lower vowels: ุ ู
  LOWER_VOWEL: "\u0E38\u0E39",

  // Maitaikhu: ็
  MAITAIKHU: "\u0E47",

  // Mai han akat: ั
  MAI_HAN_AKAT: "\u0E31",

  // Nikhahit: ํ
  NIKHAHIT: "\u0E4D",

  // Sara aa: า
  SARA_AA: "\u0E32",

  // Sara am: ำ
  SARA_AM: "\u0E33",

  // Sara e: เ
  SARA_E: "\u0E40",
};

// All marks that float above/below consonants
const FLOATING_MARKS = `${THAI.UPPER_VOWEL}${THAI.LOWER_VOWEL}${THAI.MAITAIKHU}${THAI.MAI_HAN_AKAT}${THAI.TONE}${THAI.NIKHAHIT}`;

export function normalizeThaiText(text: string) {
  // Process only runs of Thai characters
  return text.replace(/\p{Script=Thai}+/gu, (match) => {
    let result = match;

    // 1. Replace เเ (double sara e) with แ (sara ae)
    result = result.replace(
      new RegExp(`${THAI.SARA_E}${THAI.SARA_E}`, "g"),
      "\u0E41" // แ
    );

    // 2. Remove leading floating marks (shouldn't start a cluster)
    result = result.replace(new RegExp(`^[${FLOATING_MARKS}]+`, "g"), "");

    // 3. Remove duplicate floating marks (keep first occurrence)
    result = result.replace(
      new RegExp(`([${THAI.TONE}])[${THAI.TONE}]+`, "g"),
      "$1"
    );
    result = result.replace(
      new RegExp(`([${THAI.UPPER_VOWEL}])[${THAI.UPPER_VOWEL}]+`, "g"),
      "$1"
    );
    result = result.replace(
      new RegExp(`([${THAI.LOWER_VOWEL}])[${THAI.LOWER_VOWEL}]+`, "g"),
      "$1"
    );
    result = result.replace(
      new RegExp(`([${THAI.MAITAIKHU}])[${THAI.MAITAIKHU}]+`, "g"),
      "$1"
    );

    // 4. Fix tone mark order: consonant + tone + vowel → consonant + vowel + tone
    result = result.replace(
      new RegExp(
        `([${THAI.CONSONANT}])([${THAI.TONE}])([${THAI.UPPER_VOWEL}${THAI.LOWER_VOWEL}${THAI.MAITAIKHU}])`,
        "g"
      ),
      "$1$3$2"
    );

    // 5. Replace nikhahit + sara aa (ํา) with sara am (ำ)
    result = result.replace(
      new RegExp(`${THAI.NIKHAHIT}${THAI.SARA_AA}`, "g"),
      THAI.SARA_AM
    );

    // 6. Fix tone mark after sara am: คำ่ → ค่ำ
    result = result.replace(
      new RegExp(`([${THAI.CONSONANT}])${THAI.SARA_AM}([${THAI.TONE}])`, "g"),
      `$1$2${THAI.SARA_AM}`
    );

    return result;
  });
}
