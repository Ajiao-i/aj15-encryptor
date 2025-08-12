// src/aj15_demo_app.jsx
import React, { useState } from "react";
import { encrypt, decrypt } from "../aj15_logic";

export default function AJ15DemoApp() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");

    const handleEncrypt = () => {
        const enc = encrypt(input);
        console.log("[AJ15] 原文：", input);
        console.log("[AJ15] 加密结果：", enc);
        setOutput(enc);
    };

    const handleDecrypt = () => {
        const dec = decrypt(input);
        console.log("[AJ15] 密文：", input);
        console.log("[AJ15] 解密结果：", dec);
        setOutput(dec);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>AJ-15 五笔加密 Demo</h1>
            <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={4}
                cols={50}
                placeholder="输入要加密或解密的文本"
            />
            <br />
            <button onClick={handleEncrypt}>加密</button>
            <button onClick={handleDecrypt}>解密</button>
            <h2>输出：</h2>
            <pre>{output}</pre>
        </div>
    );
}
