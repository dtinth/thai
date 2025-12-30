import { expect } from "@std/expect";
import { normalizeThaiText } from "./mod.ts";

const tests = [
  // Rule 1: Double sara e → sara ae
  {
    name: "double sara e: เเกล้ง → แกล้ง",
    input: "\u0E40\u0E40\u0E01\u0E25\u0E49\u0E07", // เเกล้ง
    expected: "\u0E41\u0E01\u0E25\u0E49\u0E07", // แกล้ง
  },
  {
    name: "double sara e: เเม่ → แม่",
    input: "\u0E40\u0E40\u0E21\u0E48", // เเม่
    expected: "\u0E41\u0E21\u0E48", // แม่
  },

  // Rule 2: Leading floating marks
  {
    name: "leading sara u: ุสวัสดี → สวัสดี",
    input: "\u0E38\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35", // ุสวัสดี
    expected: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35", // สวัสดี
  },
  {
    name: "leading tone mark: ่กา → กา",
    input: "\u0E48\u0E01\u0E32", // ่กา
    expected: "\u0E01\u0E32", // กา
  },
  {
    name: "multiple leading marks: ุ็สวัสดี → สวัสดี",
    input: "\u0E38\u0E47\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35",
    expected: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35",
  },

  // Rule 3: Duplicate floating marks
  {
    name: "duplicate maitaikhu: เด็็ก → เด็ก",
    input: "\u0E40\u0E14\u0E47\u0E47\u0E01", // เด็็ก
    expected: "\u0E40\u0E14\u0E47\u0E01", // เด็ก
  },
  {
    name: "duplicate tone mark: ก่่า → ก่า",
    input: "\u0E01\u0E48\u0E48\u0E32", // ก่่า
    expected: "\u0E01\u0E48\u0E32", // ก่า
  },
  {
    name: "duplicate upper vowel: กีี → กี",
    input: "\u0E01\u0E35\u0E35", // กีี
    expected: "\u0E01\u0E35", // กี
  },

  // Rule 4: Tone mark order
  {
    name: "tone before vowel: เข้ียว → เขี้ยว",
    input: "\u0E40\u0E02\u0E49\u0E35\u0E22\u0E27", // เข้ียว (wrong)
    expected: "\u0E40\u0E02\u0E35\u0E49\u0E22\u0E27", // เขี้ยว (correct)
  },
  {
    name: "tone before lower vowel: กุ่ → กุ่",
    input: "\u0E01\u0E48\u0E38", // กุ่ (wrong)
    expected: "\u0E01\u0E38\u0E48", // กุ่ (correct)
  },

  // Rule 5: Nikhahit + sara aa → sara am
  {
    name: "nikhahit+aa to am: คํา → คำ",
    input: "\u0E04\u0E4D\u0E32", // คํา
    expected: "\u0E04\u0E33", // คำ
  },
  {
    name: "nikhahit+aa in word: ทําไม → ทำไม",
    input: "\u0E17\u0E4D\u0E32\u0E44\u0E21", // ทําไม
    expected: "\u0E17\u0E33\u0E44\u0E21", // ทำไม
  },

  // Rule 6: Tone after sara am
  {
    name: "tone after am: คำ่ → ค่ำ",
    input: "\u0E04\u0E33\u0E48", // คำ่ (wrong)
    expected: "\u0E04\u0E48\u0E33", // ค่ำ (correct)
  },
  {
    name: "tone after am: น้ำ้ → น้ำ (with extra tone)",
    input: "\u0E19\u0E33\u0E49", // นำ้ (wrong)
    expected: "\u0E19\u0E49\u0E33", // น้ำ (correct)
  },

  // Mixed text (Thai + non-Thai)
  {
    name: "mixed: Hello เเม่ World → Hello แม่ World",
    input: "Hello \u0E40\u0E40\u0E21\u0E48 World",
    expected: "Hello \u0E41\u0E21\u0E48 World",
  },
  {
    name: "multiple Thai runs",
    input: "\u0E40\u0E40\u0E01 and \u0E40\u0E40\u0E02",
    expected: "\u0E41\u0E01 and \u0E41\u0E02",
  },

  // First tone-mark wins
  {
    name: "first tone-mark wins: ท่้อ → ท่อ",
    input: "ท่้อ",
    expected: "ท่อ",
  },
  {
    name: "first tone-mark wins: ท้่อ → ท้อ",
    input: "ท้่อ",
    expected: "ท้อ",
  },

  // First lower vowel wins
  {
    name: "first lower vowel wins: กุู → กุ",
    input: "กุู",
    expected: "กุ",
  },

  // Edge cases
  {
    name: "already correct: สวัสดี",
    input: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35",
    expected: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35",
  },
  {
    name: "empty string",
    input: "",
    expected: "",
  },
  {
    name: "no Thai text",
    input: "Hello World 123",
    expected: "Hello World 123",
  },
];

for (const test of tests) {
  Deno.test(test.name, () => {
    const output = normalizeThaiText(test.input);
    expect(output).toBe(test.expected);
  });
}
