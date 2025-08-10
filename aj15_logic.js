let WUBI_DICT = {};
let REVERSE_DICT = {};

// 异步加载五笔词典
export async function loadWubiDict() {
  const res = await fetch("wubi_phrases.txt");
  const text = await res.text();
  const lines = text.trim().split("\n");

  WUBI_DICT = {};
  REVERSE_DICT = {};

  for (const line of lines) {
    const [ch, code] = line.trim().split(/\s+/);
    if (ch && code) {
      WUBI_DICT[ch] = code.toUpperCase();
      REVERSE_DICT[code.toUpperCase()] = ch;
    }
  }
  console.log("✅ 词典加载成功：", Object.keys(WUBI_DICT).length, "条");
}

// 切分字符串为 Unicode 字符
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

// 生成位移序列
function generateFibShifts(seed, count) {
  const shifts = [seed % 25, (seed + 7) % 25];
  while (shifts.length < count) {
    const next = (shifts[shifts.length - 1] + shifts[shifts.length - 2]) % 25;
    shifts.push(next);
  }
  return shifts;
}

// 同步加密
export function aj15_encrypt(text) {
  const chars = splitUTF8Chars(text);
  const shifts = generateFibShifts(34121, chars.length);
  let result = "";

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const wubi = (WUBI_DICT[ch] || "XX").toUpperCase();
    const shift = shifts[i];

    // 位移
    let shifted = "";
    for (let c of wubi) {
      if (/[A-Z]/.test(c)) {
        shifted += String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
      } else {
        shifted += c;
      }
    }

    // 记录编码长度
    const lenMarker = wubi.length.toString();

    // 校验位
    const checksum = Array.from(ch).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 10;

    result += lenMarker + shifted + checksum.toString();
  }

  // 全文末尾校验
  const lastChar = text[text.length - 1];
  result += (lastChar.charCodeAt(0) % 15).toString();

  return result;
}

// 同步解密
export function aj15_decrypt(cipher) {
  const lastDigit = cipher.slice(-1);
  const body = cipher.slice(0, -1);
  let i = 0;
  let result = "";

  let index = 0;
  const shifts = generateFibShifts(34121, 9999); // 足够长的序列

  while (index < body.length) {
    const lenMarker = parseInt(body[index], 10); // 编码长度
    index += 1;

    const encoded = body.slice(index, index + lenMarker);
    index += lenMarker;

    const shift = shifts[i];
    i++;

    let originalCode = "";
    for (let c of encoded) {
      if (/[A-Z]/.test(c)) {
        originalCode += String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
      } else {
        originalCode += c;
      }
    }

    const checksum = body[index]; // 校验位
    index += 1;

    const ch = REVERSE_DICT[originalCode] || "�";
    result += ch;
  }

  // 校验
  const lastChar = result[result.length - 1];
  const check = (lastChar.charCodeAt(0) % 15).toString();
  if (check !== lastDigit) {
    console.warn("⚠️ 校验失败，密文可能被篡改");
  }

  return result;
}
