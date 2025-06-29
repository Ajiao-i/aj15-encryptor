import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { aj15_encrypt, aj15_decrypt, loadWubiDict } from "../aj15_logic.js";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encrypt");
  const [uploadMsg, setUploadMsg] = useState("");

  // 页面初始化时加载字典
  useEffect(() => {
    loadWubiDict().then(() => {
      setUploadMsg("🔠 字典加载完成，可以使用加解密功能");
    }).catch(() => {
      setUploadMsg("❌ 字典加载失败，请检查 wubi86_full.txt");
    });
  }, []);

  // 点击按钮时调用异步函数
  const handleRun = async () => {
    if (!input) {
      setOutput("");
      return;
    }

    if (mode === "encrypt") {
      const cipher = await aj15_encrypt(input);
      setOutput(cipher);
    } else {
      const plain = await aj15_decrypt(input);
      setOutput(plain);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>AJ‑15 中文加解密（支持完整五笔字典）</h1>

      <p>{uploadMsg}</p>

      <textarea
        rows={4}
        placeholder="请输入中文原文或密文"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setMode("encrypt")}
          style={{ marginRight: 8, backgroundColor: mode === "encrypt" ? "#4caf50" : "" }}
        >
          加密模式
        </button>

        <button
          onClick={() => setMode("decrypt")}
          style={{ backgroundColor: mode === "decrypt" ? "#4caf50" : "" }}
        >
          解密模式
        </button>
      </div>

      <button onClick={handleRun} style={{ width: "100%", padding: 8 }}>
        执行 {mode === "encrypt" ? "加密" : "解密"}
      </button>

      <h3>输出结果</h3>
      <textarea
        rows={4}
        readOnly
        value={output}
        style={{ width: "100%", whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
