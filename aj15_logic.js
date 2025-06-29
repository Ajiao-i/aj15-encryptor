// aj15_logic.js

let wubiMap = new Map();
let reverseWubiMap = new Map();
let dictionaryLoaded = false;

// 加载字典
export async function loadWubiDict(path = "/wubi86_full.txt") {
  const resp = await fetch(path);
  const text = await resp.text();
  const lines = text.split("\n");

  lines.forEach((line) => {
    const [char, code] = line.trim().split(/\s+/);
    if (char && code) {
      wubiMap.set(char, code);
      reverseWubiMap.set(code, char);
    }
  });

  dictionaryLoaded = true;
  console.log(`🔠 Loaded ${wubiMap.size} entries from dictionary`);
}

// 生成斐波那契位移序列
function generateFibShifts(seed, count) {
  const shifts = [seed % 25, (seed + 7) % 25];
  while (shifts.length < count) {
    const next = (shifts.at(-1) + shifts.at(-2)) % 25;
    shifts.push(next);
  }
  return shifts;
}

// 加密函数
export async function aj15_encrypt(text) {
  if (!dictionaryLoaded) await loadWubiDict();

  const utf8chars = extractUTF8Chars(text);
  const shifts = generateFibShifts(34121, utf8chars.length);
  let cipher = "";

  utf8chars.forEach((ch, i) => {
    let wubi = wubiMap.get(ch) || "XX";
    let shift = shifts[i];

    let shifted = "";
    for (let c of wubi) {
      if (/[A-Z]/.test(c)) {
        shifted += String.fromCharCode(
          "A".charCodeAt(0) + ((c.charCodeAt(0) - 65 + shift) % 26)
        );
      } else {
        shifted += c;
      }
    }

    const checksum = [...ch].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 10;
    cipher += shifted + checksum;
  });

  const finalCheck = text.charCodeAt(text.length - 1) % 15;
  return cipher + finalCheck;
}

// 解密函数
export async function aj15_decrypt(cipher) {
  if (!dictionaryLoaded) await loadWubiDict();

  const checkDigit = Number(cipher.at(-1));
  const data = cipher.slice(0, -1);
  let chars = [];

  const blockCount = data.length / 3;
  const shifts = generateFibShifts(34121, blockCount);

  for (let i = 0; i < blockCount; i++) {
    const block = data.slice(i * 3, i * 3 + 3);
    const code = block.slice(0, 2);
    const shift = shifts[i];

    let original = "";
    for (let j = 0; j < 2; j++) {
      const c = code[j];
      if (/[A-Z]/.test(c)) {
        original += String.fromCharCode(
          "A".charCodeAt(0) + ((c.charCodeAt(0) - 65 - shift + 26) % 26)
        );
      } else {
        original += c;
      }
    }

    const char = reverseWubiMap.get(original) || "?";
    chars.push(char);
  }

  const plain = chars.join("");
  if (plain.charCodeAt(plain.length - 1) % 15 !== checkDigit) {
    console.warn("⚠️ 校验和失败，数据可能被篡改");
  }

  return plain;
}

// 提取 UTF-8 汉字
function extractUTF8Chars(str) {
  const result = [];
  for (let i = 0; i < str.length; ) {
    const code = str.charCodeAt(i);
    if (code >= 0x4e00 && code <= 0x9fff) {
      result.push(str[i]);
      i++;
    } else {
      result.push(str[i]);
      i++;
    }
  }
  return result;
}
export const loadDictionary = loadWubiDict;

