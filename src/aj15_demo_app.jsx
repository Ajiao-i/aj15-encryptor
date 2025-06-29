import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { aj15_encrypt, aj15_decrypt, loadDictionary } from "../aj15_logic.js";

const defaultDict = {
  "阿": "BS",
  "蕉": "AJ",
  "和": "T",
  "他": "WB",
  "的": "R",
  "朋": "EE",
  "友": "DC",
  "们": "WU"
};

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encrypt");
  const [uploadMsg, setUploadMsg] = useState("");

  useEffect(() => {
    loadDictionary(defaultDict);
  }, []);

  const handleRun = () => {
    if (mode === "encrypt") {
      setOutput(aj15_encrypt(input));
    } else {
      setOutput(aj15_decrypt(input));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (typeof json !== "object" || Array.isArray(json)) {
          setUploadMsg("上传失败：文件格式错误，需为 JSON 对象");
          return;
        }
        loadDictionary(json);
        setUploadMsg("字典加载成功！请重新执行加解密。");
      } catch {
        setUploadMsg("上传失败：无效的 JSON 文件");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif", padding: 20 }}>
      <h1>AJ-15 中文加解密演示（支持上传五笔字典）</h1>

      <label>
        上传五笔字典（JSON格式）：
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </label>
      <p style={{ color: uploadMsg.includes("成功") ? "green" : "red" }}>{uploadMsg}</p>

      <textarea
        rows={4}
        placeholder="输入中文原文或密文"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <div style={{ marginBottom: 12 }}>
        <button
          style={{ marginRight: 8, backgroundColor: mode === "encrypt" ? "#4caf50" : "" }}
          onClick={() => setMode("encrypt")}
        >
          加密模式
        </button>
        <button
          style={{ backgroundColor: mode === "decrypt" ? "#4caf50" : "" }}
          onClick={() => setMode("decrypt")}
        >
          解密模式
        </button>
      </div>

      <button onClick={handleRun} style={{ width: "100%", padding: 8 }}>
        {mode === "encrypt" ? "执行加密" : "执行解密"}
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
