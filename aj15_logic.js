// aj15_logic.js
import fs from "fs";

// 载入五笔词典（86版简码）
const dictRaw = fs.readFileSync("./wubi_phrases.txt", "utf8").split("\n");
const wubiDict = {};
dictRaw.forEach(line => {
    const [char, code] = line.trim().split(/\s+/);
    if (char && code) {
        wubiDict[char] = code.toUpperCase();
    }
});

// 生成斐波那契序列并取 mod 26
function generateFiboMod26(seed, length) {
    const seq = [];
    let a = seed % 26;
    let b = (seed + 1) % 26;
    for (let i = 0; i < length; i++) {
        seq.push(a);
        const next = (a + b) % 26;
        a = b;
        b = next;
    }
    return seq;
}

// 计算三字节和 mod 10 校验
function checksumChar(char) {
    const bytes = Buffer.from(char, "utf16le");
    let sum = 0;
    for (let i = 0; i < bytes.length; i++) {
        sum += bytes[i];
    }
    return String(sum % 10);
}

// 将字母位移
function shiftChar(char, shift) {
    const base = char >= "A" && char <= "Z" ? 65 : char >= "a" && char <= "z" ? 97 : null;
    if (base === null) return char;
    return String.fromCharCode((char.charCodeAt(0) - base + shift + 26) % 26 + base);
}

// 加密
export function encrypt(text) {
    let encrypted = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const wubi = wubiDict[char] || char;
        const seed = char.charCodeAt(0);
        const fibSeq = generateFiboMod26(seed, wubi.length);
        let shifted = "";
        for (let j = 0; j < wubi.length; j++) {
            shifted += shiftChar(wubi[j], fibSeq[j]);
        }
        const chk = checksumChar(char);
        encrypted += shifted + chk;
    }
    // 校验系统：末字符Unicode值 mod 15 == 0
    encrypted += String.fromCharCode(((encrypted.charCodeAt(encrypted.length - 1) + (15 - (encrypted.charCodeAt(encrypted.length - 1) % 15))) % 65536));
    return encrypted;
}

// 解密
export function decrypt(cipher) {
    let data = cipher.slice(0, -1); // 去掉末尾校验符
    let result = "";
    let i = 0;
    while (i < data.length) {
        let block = data.slice(i, i + 3); // 两位编码 + 1位校验
        const codePart = block.slice(0, -1);
        const chk = block.slice(-1);
        // 尝试匹配字典
        let foundChar = null;
        for (const [char, wubi] of Object.entries(wubiDict)) {
            if (wubi.length === codePart.length) {
                const seed = char.charCodeAt(0);
                const fibSeq = generateFiboMod26(seed, wubi.length);
                let shifted = "";
                for (let j = 0; j < wubi.length; j++) {
                    shifted += shiftChar(wubi[j], fibSeq[j]);
                }
                if (shifted === codePart && checksumChar(char) === chk) {
                    foundChar = char;
                    break;
                }
            }
        }
        result += foundChar || "?";
        i += 3;
    }
    return result;
}
