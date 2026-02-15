import React, { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import { Code2 } from "lucide-react";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-dark.css"; // We'll override this with VS Code colors

// Minimal custom CSS for Prism to match VS Code Dark
const customPrismStyles = `
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6a9955;
  }
  .token.punctuation {
    color: #d4d4d4;
  }
  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #b5cea8;
  }
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #ce9178;
  }
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #d4d4d4;
  }
  .token.atrule,
  .token.attr-value,
  .token.keyword {
    color: #569cd6;
  }
  .token.function,
  .token.class-name {
    color: #dcdcaa;
  }
  .token.regex,
  .token.important,
  .token.variable {
    color: #9cdcfe;
  }
  code[class*="language-"],
  pre[class*="language-"] {
    color: #d4d4d4;
    text-shadow: none;
    font-family: "Menlo", "Monaco", "Courier New", monospace;
    font-size: 14px;
    line-height: 1.5;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    tab-size: 2;
    hyphens: none;
  }
`;

interface CodeEditorProps {
  initialCode?: string;
  code?: string;
  onChange?: (code: string) => void;
  onSelectionChange?: (selectedCode: string) => void;
  fileName?: string;
  zoomPercent?: number;
  ideMode?: "dark" | "light";
}

export function CodeEditor({
  initialCode,
  code,
  onChange,
  onSelectionChange,
  fileName = "main.py",
  zoomPercent = 100,
  ideMode = "dark",
}: CodeEditorProps) {
  // If controlled, use props.code, else use local state initialized with initialCode
  const [internalCode, setInternalCode] = useState(initialCode || "");
  const editorContainerRef = React.useRef<HTMLDivElement | null>(null);

  const isControlled = code !== undefined;
  const currentCode = isControlled ? code : internalCode;
  const editorScale = zoomPercent / 100;
  const isDarkMode = ideMode === "dark";

  const emitSelectionChange = () => {
    if (!onSelectionChange) return;
    const textarea = editorContainerRef.current?.querySelector("textarea");
    if (!textarea) {
      onSelectionChange("");
      return;
    }
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    if (end <= start) {
      onSelectionChange("");
      return;
    }
    onSelectionChange(currentCode.slice(start, end));
  };

  const handleChange = (newCode: string) => {
    if (!isControlled) {
      setInternalCode(newCode);
    }
    if (onChange) {
      onChange(newCode);
    }
    window.requestAnimationFrame(emitSelectionChange);
  };

  // Reset internal state if initialCode changes (for uncontrolled usage when file switches)
  useEffect(() => {
    if (!isControlled && initialCode !== undefined) {
      setInternalCode(initialCode);
    }
  }, [initialCode, isControlled]);

  return (
    <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? "bg-[#1e1e1e]" : "bg-[#ffffff]"}`}>
      {/* Tabs */}
      <div className={`flex overflow-x-auto scrollbar-hide ${isDarkMode ? "bg-[#2d2d2d]" : "bg-[#eff6ff]"}`}>
        <div className={`px-3 py-2 text-sm border-t-2 border-blue-500 flex items-center min-w-[120px] ${isDarkMode ? "bg-[#1e1e1e] text-[#ffffff]" : "bg-[#ffffff] text-[#1f1f1f]"}`}>
          <Code2 size={14} className="mr-2 text-blue-400" />
          {fileName}
          <span className={`ml-auto cursor-pointer px-1 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-blue-500 hover:text-blue-700"}`}>×</span>
        </div>
        
      </div>

      {/* Editor Area */}
      <div
        ref={editorContainerRef}
        className="flex-1 relative overflow-auto custom-scrollbar"
        onMouseUp={emitSelectionChange}
        onKeyUp={emitSelectionChange}
      >
        <style>{customPrismStyles}</style>
        <Editor
          value={currentCode}
          onValueChange={handleChange}
          highlight={(code) => Prism.highlight(code, Prism.languages.javascript, "javascript")}
          padding={Math.max(8, Math.round(20 * editorScale))}
          className="font-mono min-h-full"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: Math.max(10, Math.round(14 * editorScale)),
            backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
            color: isDarkMode ? "#d4d4d4" : "#1f1f1f",
          }}
        />
      </div>
    </div>
  );
}
