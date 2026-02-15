import React, { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

interface BottomPanelProps {
  ideMode?: "dark" | "light";
  terminalCommand: string;
  terminalLines: string[];
  onTerminalCommandChange: (value: string) => void;
  onTerminalCommandRun: (command: string) => void;
}

export function BottomPanel({
  ideMode = "dark",
  terminalCommand,
  terminalLines,
  onTerminalCommandChange,
  onTerminalCommandRun,
}: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState("terminal");
  const terminalScrollRef = useRef<HTMLDivElement | null>(null);
  const isDarkMode = ideMode === "dark";

  const tabs = [
    { id: "problems", label: "PROBLEMS", count: 0 },
    { id: "output", label: "OUTPUT" },
    { id: "debug", label: "DEBUG CONSOLE" },
    { id: "terminal", label: "TERMINAL" },
    { id: "ports", label: "PORTS" },
  ];

  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  return (
    <div
      className={`h-full border-t flex flex-col ${
        isDarkMode
          ? "bg-[#1e1e1e] border-[#414141] text-[#cccccc]"
          : "bg-[#ffffff] border-[#bfdbfe] text-[#0f172a]"
      }`}
    >
      <div className={`flex px-4 border-b ${isDarkMode ? "border-[#414141]" : "border-[#bfdbfe]"}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-3 py-2 text-xs font-medium border-b transition-colors",
              isDarkMode ? "hover:text-white" : "hover:text-black",
              activeTab === tab.id
                ? isDarkMode
                  ? "text-white border-white"
                  : "text-black border-black"
                : isDarkMode
                  ? "text-[#969696] border-transparent"
                  : "text-[#1d4ed8] border-transparent"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${isDarkMode ? "bg-[#3f3f3f]" : "bg-[#dbeafe]"}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 p-2 font-mono text-sm overflow-auto" ref={terminalScrollRef}>
        {activeTab === "terminal" && (
          <div className="space-y-1">
            {terminalLines.map((line, idx) => (
              <div
                key={`${idx}-${line.slice(0, 16)}`}
                className={`whitespace-pre-wrap break-words ${isDarkMode ? "text-[#cccccc]" : "text-[#1f1f1f]"}`}
              >
                {line}
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-green-500">{">"}</span>
              <input
                value={terminalCommand}
                onChange={(e) => onTerminalCommandChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onTerminalCommandRun(terminalCommand);
                  }
                }}
                placeholder="Type command, e.g. python app.py or clear"
                className={`flex-1 bg-transparent outline-none ${
                  isDarkMode ? "text-[#cccccc] placeholder:text-[#777]" : "text-[#0f172a] placeholder:text-[#60a5fa]"
                }`}
              />
            </div>
          </div>
        )}

        {activeTab === "output" && (
          <div className={isDarkMode ? "text-gray-400" : "text-blue-700"}>[Info] Output is shown in Terminal for run actions.</div>
        )}
        {activeTab === "problems" && (
          <div className={`flex flex-col items-center justify-center h-full ${isDarkMode ? "text-gray-500" : "text-blue-700"}`}>
            <p>No problems have been detected in the workspace.</p>
          </div>
        )}
      </div>
    </div>
  );
}
