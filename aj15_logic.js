// 五笔编码字典初始示例
let WUBI_DICT = {
  "阿": "BS",
  "蕉": "AJ",
  "和": "T",
  "他": "WB",
  "的": "R",
  "朋": "EE",
  "友": "DC",
  "们": "WU"
};

let reverse_wubi_map = {};

// 加载字典并建立反向映射
export function loadDictionary(dict) {
  WUBI_DICT = dict;
  reverse_wubi_map = {};
  for (const k in dict) {
    reverse_wubi_map[dict[k]] = k;
  }
}

// 斐波那契位移生成器
function generateFibShifts(seed, count) {
  let shifts = [seed % 25, (seed + 7) % 25];
  while (shifts.length < count) {
    let next = (shifts[shifts.length - 1] + shifts[shifts.length - 2]) % 25;
    shifts.push(next);
  }
  return shifts;
}

// UTF-8 三字节中文字符拆分（简化）
function splitChineseChars(text) {
  const chars = [];
  for (let i = 0; i < text.length;) {
    const c = text.charCodeAt(i);
    if (c >= 0x4e00 && c <= 0x9fa5) {
      chars.push(text.substr(i, 1));
      i += 1;
    } else {
      chars.push(text[i]);
      i += 1;
    }
  }
  return chars;
}

// 加密核心
export function aj15_encrypt(text) {
  let ciphertext = "";
  const chars = splitChineseChars(text);
  const shifts = generateFibShifts(34121, chars.length);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const wubi = WUBI_DICT[ch] || "XXXX";
    let enc = "";
    const shift = shifts[i];
    for (let c of wubi) {
      if (c >= "A" && c <= "Z") {
        enc += String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
      } else {
        enc += c;
      }
    }
    // 每个字符校验数字：字符码和模10
    const charCodeSum = Array.from(ch).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    ciphertext += enc + (charCodeSum % 10);
  }
  // 全局校验和：最后一个字符Unicode模15
  ciphertext += chars.length > 0 ? chars[chars.length - 1].charCodeAt(0) % 15 : 0;
  return ciphertext;
}

// 解密核心
export function aj15_decrypt(cipher) {
  if (cipher.length < 3) return "";

  let plaintext = "";
  const checkDigit = parseInt(cipher[cipher.length - 1], 10);
  const data = cipher.slice(0, -1);

  const blockCount = Math.floor(data.length / 3);
  const shifts = generateFibShifts(34121, blockCount);

  for (let i = 0; i < data.length; i += 3) {
    const block = data.slice(i, i + 3);
    let dec = "";
    const shift = shifts[i / 3];

    for (let j = 0; j < 2; j++) {
      let c = block[j];
      if (c >= "A" && c <= "Z") {
        c = String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
      }
      dec += c;
    }

    plaintext += reverse_wubi_map[dec] || "?";
  }

  if (plaintext.length > 0) {
    const lastCharCode = plaintext[plaintext.length - 1].charCodeAt(0);
    if (lastCharCode % 15 !== checkDigit) {
      console.warn("[警告] 校验和不匹配，可能数据已被篡改！");
    }
  }

  return plaintext;
}

// 初始化默认字典
loadDictionary(WUBI_DICT);
