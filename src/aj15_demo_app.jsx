import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  aj15_encrypt,
  aj15_decrypt,
  loadWubiDict
} from "../aj15_logic.js";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encrypt");
  const [dictLoaded, setDictLoaded] = useState(false);

  useEffect(() => {
    loadWubiDict().then(() => {
      setDictLoaded(true);
    });
  }, []);

  const handleProcess = () => {
    if (!dictLoaded) {
      setOutput("字典未加载！");
      return;
    }

    try {
      const result =
        mode === "encrypt"
          ? aj15_encrypt(input)
          : aj15_decrypt(input);
      setOutput(result);
    } catch (e) {
      console.error(e);
      setOutput("处理失败，请检查输入。");
    }
  };

  return (
    <div style={{ padding: "2em", fontFamily: "Arial" }}>
      <h1>AJ-15 中文加密/解密工具</h1>

      <div style={{ marginBottom: "1em" }}>
        <textarea
          rows={5}
          style={{ width: "100%" }}
          placeholder="请输入内容..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "1em" }}>
        <label>
          <input
            type="radio"
            name="mode"
            value="encrypt"
            checked={mode === "encrypt"}
            onChange={() => setMode("encrypt")}
          />
          加密
        </label>
        <label style={{ marginLeft: "1em" }}>
          <input
            type="radio"
            name="mode"
            value="decrypt"
            checked={mode === "decrypt"}
            onChange={() => setMode("decrypt")}
          />
          解密
        </label>
        <button onClick={handleProcess} style={{ marginLeft: "2em" }}>
          开始处理
        </button>
      </div>

      <div>
        <h3>输出：</h3>
        <pre
          style={{
            background: "#f0f0f0",
            padding: "1em",
            whiteSpace: "pre-wrap"
          }}
        >
          {output}
        </pre>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
