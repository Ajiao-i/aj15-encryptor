let WUBI_DICT = {};        // 词组 => 编码
let REVERSE_DICT = {};     // 编码 => 词组
let MAX_WORD_LENGTH = 1;   // 最长词组字数（如“劳苦功高”为4）

// ✅ 同步标记，确保字典加载完再运行加解密
let isDictLoaded = false;

// 异步加载词组五笔字典
export async function loadWubiDict() {
  const res = await fetch("wubi_phrases.txt");
  const text = await res.text();
  const lines = text.trim().split("\n");

  WUBI_DICT = {};
  REVERSE_DICT = {};
  MAX_WORD_LENGTH = 1;

  for (const line of lines) {
    const [phrase, code] = line.trim().split(/\s+/);
    if (phrase && code) {
      WUBI_DICT[phrase] = code;
      REVERSE_DICT[code] = phrase;
      MAX_WORD_LENGTH = Math.max(MAX_WORD_LENGTH, phrase.length);
    }
  }

  isDictLoaded = true;
}

// 分割 UTF-8 字符串为单个字符（支持汉字）
function splitUTF8Chars(str) {
  const chars = [];
  for (let i = 0; i < str.length;) {
    const code = str.codePointAt(i);
    const ch = String.fromCodePoint(code);
    chars.push(ch);
    i += ch.length;
  }
  return chars;
}

// 斐波那契位移生成器（取模 25）
function generateFibShifts(seed, count) {
  const shifts = [seed % 25, (seed + 7) % 25];
  while (shifts.length < count) {
    const next = (shifts[shifts.length - 1] + shifts[shifts.length - 2]) % 25;
    shifts.push(next);
  }
  return shifts;
}

// ✅ 加密函数（必须保证字典已加载）
export function aj15_encrypt(input) {
  if (!isDictLoaded) throw new Error("五笔字典尚未加载");

  const chars = splitUTF8Chars(input);
  const shifts = generateFibShifts(34121, chars.length * 2);
  let i = 0, shiftIndex = 0;
  let encrypted = "";

  while (i < chars.length) {
    let match = null;
    for (let len = Math.min(MAX_WORD_LENGTH, chars.length - i); len >= 1; len--) {
      const candidate = chars.slice(i, i + len).join("");
      if (WUBI_DICT[candidate]) {
        match = candidate;
        break;
      }
    }

    if (!match) match = chars[i];

    const code = WUBI_DICT[match] || "XX";
    const shift = shifts[shiftIndex++];
    let shifted = "";

    for (const c of code) {
      if (/[A-Z]/.test(c)) {
        const s = ((c.charCodeAt(0) - 65 + shift) % 26) + 65;
        shifted += String.fromCharCode(s);
      } else {
        shifted += c;
      }
    }

    const checksum = [...match].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 10;
    encrypted += shifted + checksum;

    i += match.length;
  }

  const globalCheck = chars[chars.length - 1].charCodeAt(0) % 15;
  encrypted += globalCheck.toString();
  return encrypted;
}

// ✅ 解密函数
export function aj15_decrypt(cipher) {
  if (!isDictLoaded) throw new Error("五笔字典尚未加载");

  const segments = [];
  const globalCheckDigit = cipher.slice(-1);
  const body = cipher.slice(0, -1);
  const blockCount = body.length / 3;

  const shifts = generateFibShifts(34121, blockCount);
  for (let i = 0; i < blockCount; i++) {
    const block = body.slice(i * 3, i * 3 + 3);
    const code = block.slice(0, 2);
    const shift = shifts[i];
    let decoded = "";

    for (const c of code) {
      if (/[A-Z]/.test(c)) {
        const d = ((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65;
        decoded += String.fromCharCode(d);
      } else {
        decoded += c;
      }
    }

    segments.push(decoded);
  }

  let result = "";
  for (const code of segments) {
    const phrase = REVERSE_DICT[code];
    if (phrase) {
      result += phrase;
    } else {
      result += "�";  // 未知编码，标为乱码
    }
  }

  const lastChar = result[result.length - 1];
  const verify = lastChar.charCodeAt(0) % 15;
  if (verify.toString() !== globalCheckDigit) {
    console.warn("⚠️ 校验失败，密文可能已损坏或被篡改");
  }

  return result;
}
