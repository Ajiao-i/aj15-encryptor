let WUBI_DICT = {};
let REVERSE_DICT = {};

// 异步加载五笔字典文件
export async function loadWubiDict() {
  const res = await fetch("wubi86_full.txt");
  const text = await res.text();
  const lines = text.trim().split("\n");

  WUBI_DICT = {};
  REVERSE_DICT = {};

  for (const line of lines) {
    const [ch, code] = line.trim().split(/\s+/);
    if (ch && code) {
      WUBI_DICT[ch] = code;
      REVERSE_DICT[code] = ch;
    }
  }
}

// 将字符串切分为单个 UTF-8 字符（中文字符）
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

// 生成斐波那契位移序列
function generateFibShifts(seed, count) {
  const shifts = [seed % 25, (seed + 7) % 25];
  while (shifts.length < count) {
    const next = (shifts[shifts.length - 1] + shifts[shifts.length - 2]) % 25;
    shifts.push(next);
  }
  return shifts;
}

// ✅ 同步加密函数（不会返回 Promise）
export function aj15_encrypt(text) {
  const chars = splitUTF8Chars(text);
  const shifts = generateFibShifts(34121, chars.length);
  let result = "";

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const wubi = WUBI_DICT[ch] || "XX";
    const shift = shifts[i];
    let shifted = "";

    for (let c of wubi) {
      if (/[A-Z]/.test(c)) {
        const newChar = String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
        shifted += newChar;
      } else {
        shifted += c;
      }
    }

    // 每个字附加校验数字（原始字符 Unicode 求和模10）
    const checksum = Array.from(ch).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 10;
    result += shifted + checksum.toString();
  }

  // 全文末尾校验码
  const lastChar = text[text.length - 1];
  result += (lastChar.charCodeAt(0) % 15).toString();

  return result;
}

// ✅ 同步解密函数（不会返回 Promise）
export function aj15_decrypt(cipher) {
  const lastDigit = cipher.slice(-1);
  const body = cipher.slice(0, -1);
  const blockCount = Math.floor(body.length / 3);

  const shifts = generateFibShifts(34121, blockCount);
  let result = "";

  for (let i = 0; i < blockCount; i++) {
    const segment = body.slice(i * 3, i * 3 + 3);
    const encoded = segment.slice(0, 2);
    const shift = shifts[i];
    let originalCode = "";

    for (let c of encoded) {
      if (/[A-Z]/.test(c)) {
        const newChar = String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
        originalCode += newChar;
      } else {
        originalCode += c;
      }
    }

    const ch = REVERSE_DICT[originalCode] || "�";
    result += ch;
  }

  // 校验校验位
  const lastChar = result[result.length - 1];
  const check = (lastChar.charCodeAt(0) % 15).toString();
  if (check !== lastDigit) {
    console.warn("⚠️ 校验失败，密文可能已损坏或被篡改");
  }

  return result;
}
