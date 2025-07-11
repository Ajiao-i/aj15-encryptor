let WUBI_DICT = {};
let REVERSE_DICT = {};
let MAX_WORD_LENGTH = 1;

// 异步加载五笔词组字典
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
}

// UTF-8安全切分（支持中文字符）
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

// 斐波那契位移
function generateFibShifts(seed, count) {
  const shifts = [seed % 25, (seed + 7) % 25];
  while (shifts.length < count) {
    const next = (shifts[shifts.length - 1] + shifts[shifts.length - 2]) % 25;
    shifts.push(next);
  }
  return shifts;
}

// ✅ 加密函数
export function aj15_encrypt(text) {
  const chars = splitUTF8Chars(text);
  const result = [];
  const shifts = generateFibShifts(34121, chars.length * 2);

  let i = 0, k = 0;
  while (i < chars.length) {
    let matched = null;

    for (let len = MAX_WORD_LENGTH; len >= 1; len--) {
      const phrase = chars.slice(i, i + len).join("");
      if (WUBI_DICT[phrase]) {
        matched = phrase;
        break;
      }
    }

    if (!matched) {
      matched = chars[i];
    }

    const code = WUBI_DICT[matched] || "XX";
    const shift = shifts[k++];
    let shifted = "";

    for (const c of code) {
      if (/[A-Z]/.test(c)) {
        const newChar = String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
        shifted += newChar;
      } else {
        shifted += c;
      }
    }

    const checksum = Array.from(matched).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 10;
    result.push(shifted + checksum.toString());
    i += matched.length;
  }

  const lastChar = chars[chars.length - 1];
  result.push((lastChar.charCodeAt(0) % 15).toString());

  return result.join("");
}

// ✅ 解密函数，修复多字符还原乱码问题
export function aj15_decrypt(cipher) {
  const lastDigit = cipher.slice(-1);
  const body = cipher.slice(0, -1);
  const segments = [];
  let i = 0, k = 0;

  while (i + 3 <= body.length) {
    const seg = body.slice(i, i + 3);
    const code = seg.slice(0, 2);
    const shift = generateFibShifts(34121, k + 1)[k];
    k++;

    let orig = "";
    for (const c of code) {
      if (/[A-Z]/.test(c)) {
        const dec = String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
        orig += dec;
      } else {
        orig += c;
      }
    }

    segments.push(orig);
    i += 3;
  }

  let result = "";
  for (const code of segments) {
    const phrase = REVERSE_DICT[code];
    if (phrase) {
      result += phrase;
    } else {
      result += "�"; // 未知编码
    }
  }

  const checkChar = result[result.length - 1];
  const check = (checkChar.charCodeAt(0) % 15).toString();
  if (check !== lastDigit) {
    console.warn("⚠️ 校验失败，密文可能已损坏");
  }

  return result;
}
