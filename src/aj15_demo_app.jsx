import React, { useState } from "react";
import { aj15_encrypt, aj15_decrypt } from "../aj15_logic.js"; // 根目录引用

export default function AJ15DemoApp() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const handleEncrypt = () => {
    console.log("=== 加密开始 ===");
    console.log("[原文] ", inputText);
    const result = aj15_encrypt(inputText);
    console.log("[加密结果] ", result);
    console.log("=== 加密结束 ===\n");
    setOutputText(result);
  };

  const handleDecrypt = () => {
    console.log("=== 解密开始 ===");
    console.log("[密文] ", inputText);
    const result = aj15_decrypt(inputText);
    console.log("[解密结果] ", result);
    console.log("=== 解密结束 ===\n");
    setOutputText(result);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>AJ-15 Demo</h1>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={4}
        cols={50}
        placeholder="在这里输入文本"
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleEncrypt}>加密</button>
        <button onClick={handleDecrypt} style={{ marginLeft: "10px" }}>
          解密
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <strong>结果:</strong>
        <pre>{outputText}</pre>
      </div>
    </div>
  );
}
