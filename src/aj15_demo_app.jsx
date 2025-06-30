import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { aj15_encrypt, aj15_decrypt, loadWubiDict } from "../aj15_logic.js";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encrypt");
  const [dictStatus, setDictStatus] = useState("⏳ 正在加载五笔字典...");

  // 页面加载时加载字典
  useEffect(() => {
    loadWubiDict()
      .then(() => {
        setDictStatus("✅ 字典加载成功，可以使用");
      })
      .catch(() => {
        setDictStatus("❌ 字典加载失败，请检查 wubi86_full.txt 是否存在");
      });
  }, []);

  const handleRun = () => {
    if (!input) {
      setOutput("请输入内容");
      return;
    }

    if (mode === "encrypt") {
      const result = aj15_encrypt(input);
      setOutput(result);
    } else {
      const result = aj15_decrypt(input);
      setOutput(result);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>🔐 AJ‑15 中文加密系统</h1>
      <p>{dictStatus}</p>

      <textarea
        placeholder="请输入原文或密文"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setMode("encrypt")}
          style={{
            marginRight: 8,
            padding: "8px 12px",
            backgroundColor: mode === "encrypt" ? "#4caf50" : "#ddd",
            color: mode === "encrypt" ? "white" : "black"
          }}
        >
          加密
        </button>

        <button
          onClick={() => setMode("decrypt")}
          style={{
            padding: "8px 12px",
            backgroundColor: mode === "decrypt" ? "#4caf50" : "#ddd",
            color: mode === "decrypt" ? "white" : "black"
          }}
        >
          解密
        </button>
      </div>

      <button
        onClick={handleRun}
        style={{ width: "100%", padding: "10px", backgroundColor: "#2196f3", color: "white" }}
      >
        执行 {mode === "encrypt" ? "加密" : "解密"}
      </button>

      <h3 style={{ marginTop: 24 }}>输出结果</h3>
      <textarea
        readOnly
        rows={4}
        value={output}
        style={{ width: "100%", backgroundColor: "#f5f5f5", padding: 10 }}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
