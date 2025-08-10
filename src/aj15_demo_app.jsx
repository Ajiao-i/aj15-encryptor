import React, { useState } from "react";
import { aj15_encrypt, aj15_decrypt } from "./aj15_logic.js"; // 注意加了 .js 后缀

export default function AJ15DemoApp() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const handleEncrypt = () => {
    console.log("[加密] 原文:", inputText);
    const result = aj15_encrypt(inputText);
    console.log("[加密] 加密结果:", result);
    setOutputText(result);
  };

  const handleDecrypt = () => {
    console.log("[解密] 密文:", inputText);
    const result = aj15_decrypt(inputText);
    console.log("[解密] 解密结果:", result);
    setOutputText(result);
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h2>AJ15 加解密演示</h2>
      <textarea
        rows={4}
        style={{ width: "100%", marginBottom: "10px" }}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="在这里输入要加密或解密的文本"
      />
      <div style={{ marginBottom: "10px" }}>
        <button onClick={handleEncrypt} style={{ marginRight: "10px" }}>
          加密
        </button>
        <button onClick={handleDecrypt}>解密</button>
      </div>
      <textarea
        rows={4}
        style={{ width: "100%", marginTop: "10px" }}
        value={outputText}
        readOnly
        placeholder="输出结果会显示在这里"
      />
    </div>
  );
}
