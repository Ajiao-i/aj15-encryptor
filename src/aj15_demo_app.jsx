import React, { useState, useEffect } from "react";
import { loadWubiDict, aj15_encrypt, aj15_decrypt } from "./aj15_logic";

export default function Aj15DemoApp() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encrypt");

  useEffect(() => {
    async function initDict() {
      console.log("📥 正在加载五笔词典...");
      await loadWubiDict();
      console.log("✅ 词典加载完成");
    }
    initDict();
  }, []);

  const handleProcess = () => {
    try {
      if (mode === "encrypt") {
        const encrypted = aj15_encrypt(input);
        console.log("🔹 加密调试信息");
        console.log("原文:", input);
        console.log("加密结果:", encrypted);
        setOutput(encrypted);
      } else {
        const decrypted = aj15_decrypt(input);
        console.log("🔹 解密调试信息");
        console.log("密文:", input);
        console.log("解密结果:", decrypted);
        setOutput(decrypted);
      }
    } catch (err) {
      console.error("❌ 处理出错:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AJ15 加解密测试工具</h1>
      <textarea
        rows="3"
        cols="50"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入文本或密文"
      />
      <div>
        <label>
          <input
            type="radio"
            value="encrypt"
            checked={mode === "encrypt"}
            onChange={() => setMode("encrypt")}
          />
          加密
        </label>
        <label>
          <input
            type="radio"
            value="decrypt"
            checked={mode === "decrypt"}
            onChange={() => setMode("decrypt")}
          />
          解密
        </label>
      </div>
      <button onClick={handleProcess}>
        {mode === "encrypt" ? "加密" : "解密"}
      </button>
      <div>
        <h3>输出：</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
