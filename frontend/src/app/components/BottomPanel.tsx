import React, { useState } from "react";
import { clsx } from "clsx";
import { Terminal as TerminalIcon, AlertCircle, PlayCircle, Info } from "lucide-react";

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState("terminal");

  const tabs = [
    { id: "problems", label: "PROBLEMS", count: 0 },
    { id: "output", label: "OUTPUT" },
    { id: "debug", label: "DEBUG CONSOLE" },
    { id: "terminal", label: "TERMINAL" },
    { id: "ports", label: "PORTS" },
  ];

  return (
    <div className="h-full bg-[#1e1e1e] border-t border-[#414141] flex flex-col text-[#cccccc]">
      <div className="flex px-4 border-b border-[#414141]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-3 py-2 text-xs font-medium border-b hover:text-white transition-colors",
              activeTab === tab.id
                ? "text-white border-white"
                : "text-[#969696] border-transparent"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#3f3f3f] text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-2">
            {/* Additional icons could go here */}
        </div>
      </div>

      <div className="flex-1 p-2 font-mono text-sm overflow-auto">
        {activeTab === "terminal" && (
          <div className="space-y-1">
            <div className="flex items-center text-[#cccccc]">
              <span className="text-green-500 mr-2">➜</span>
              <span className="text-blue-400 mr-2">~/project</span>
              <span>npm run dev</span>
            </div>
            <div className="text-[#cccccc] pl-4">
              <p>
                <span className="text-green-500">VITE v6.3.5</span> ready in{" "}
                <span className="text-white font-bold">350 ms</span>
              </p>
              <p className="mt-2">
                <span className="text-gray-400">➜</span> Local:{" "}
                <span className="text-blue-400 underline">http://localhost:5173/</span>
              </p>
              <p>
                <span className="text-gray-400">➜</span> Network: use{" "}
                <span className="text-gray-400">--host</span> to expose
              </p>
              <p className="mt-2 text-gray-500">press h + enter to show help</p>
            </div>
            <div className="flex items-center text-[#cccccc] pt-2">
              <span className="text-green-500 mr-2">➜</span>
              <span className="text-blue-400 mr-2">~/project</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        )}
        {activeTab === "output" && (
            <div className="text-gray-400">
                [Info] Extension "Prettier - Code formatter" is now active!
            </div>
        )}
         {activeTab === "problems" && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>No problems have been detected in the workspace.</p>
            </div>
        )}
      </div>
    </div>
  );
}
