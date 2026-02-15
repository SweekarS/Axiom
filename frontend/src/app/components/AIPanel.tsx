import React, { useEffect, useState } from "react";
import { Bot, Loader2, Sparkles, CheckCircle2, WandSparkles } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIPanelProps {
  code: string;
  fileName: string;
  onApplyActiveFileChange: (newCode: string) => void;
}

type AIPanelMode = "reviewer" | "teacher" | "vibe";

interface VibeResponse {
  summary?: string;
  updatedContent?: string;
}

export function AIPanel({ code, fileName, onApplyActiveFileChange }: AIPanelProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<AIPanelMode>("teacher");
  const [vibePrompt, setVibePrompt] = useState("");
  const [statusMessage, setStatusMessage] = useState<string>("Ready");

  const buildPrompt = (modeValue: AIPanelMode, codeContent: string, name: string) => {
    if (modeValue === "teacher") {
      return `You are a programming teacher.
Analyze the following code file "${name}" and explain each function in a beginner-friendly way.
Return only JSON as an array of objects with "functionName" and "explanation" fields.
Keep each explanation to 2 concise lines and include what concept the function demonstrates.
If no functions are present, return an empty array.

Code:
${codeContent}

Response format:
[
  {"functionName": "function_name", "explanation": "clear two-line teaching explanation"},
  ...
]`;
    }

    return `You are a senior code reviewer.
Analyze the following code file "${name}" and review each function.
Return only JSON as an array of objects with "functionName" and "explanation" fields.
Each explanation should be concise and include one practical review point (quality, correctness, readability, or maintainability).
If no functions are present, return an empty array.

Code:
${codeContent}

Response format:
[
  {"functionName": "function_name", "explanation": "concise review insight"},
  ...
]`;
  };

  const getModel = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing VITE_GEMINI_API_KEY in environment.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  };

  useEffect(() => {
    if (mode === "vibe") {
      return;
    }

    const timer = setTimeout(() => {
      analyzeCode(code, fileName);
    }, 1500);

    return () => clearTimeout(timer);
  }, [code, fileName, mode]);

  const analyzeCode = (codeContent: string, name: string) => {
    setIsAnalyzing(true);
    
    // Simulate API delay
    setTimeout(async () => {
      try {
        const model = getModel();
        const prompt = buildPrompt(mode, codeContent, name);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const cleanedString = text
          .replace(/```json\s*/, "")
          .replace(/```$/, "")
          .trim();

        const functions = JSON.parse(cleanedString);

        const displayString = functions
          .map((fn: { functionName: string; explanation: string }) => `<b>${fn.functionName}:</b> ${fn.explanation}`)
          .join("\n");

        setExplanation(displayString || "No functions found for analysis.");
      } catch (error) {
        if (error instanceof Error && error.message.includes("VITE_GEMINI_API_KEY")) {
          setExplanation("Set VITE_GEMINI_API_KEY to enable AI features.");
        } else {
          setExplanation("Unable to parse AI response. Try editing code or switching mode.");
        }
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000);
  };

  const runVibeTask = async () => {
    if (!fileName || !code) {
      setStatusMessage("No active file content available.");
      return;
    }

    if (!vibePrompt.trim()) {
      setStatusMessage("Enter a task prompt first.");
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage("Generating edits...");

    try {
      const model = getModel();
      const prompt = `You are a coding agent inside an IDE.
Complete the user's request by editing only the active file.
Return only strict JSON with this shape:
{
  "summary": "short summary",
  "updatedContent": "full updated file content"
}

User request:
${vibePrompt}

Active file:
${fileName}

Current content:
${code}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const raw = response.text();
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(cleaned) as VibeResponse;
      if (!parsed.updatedContent || typeof parsed.updatedContent !== "string") {
        setStatusMessage("Agent returned no applicable edit.");
        return;
      }

      onApplyActiveFileChange(parsed.updatedContent);
      setStatusMessage(
        parsed.summary
          ? `${parsed.summary} (updated ${fileName})`
          : `Applied update to ${fileName}.`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("VITE_GEMINI_API_KEY")) {
        setStatusMessage("Set VITE_GEMINI_API_KEY to use Vibe Coder.");
      } else {
        setStatusMessage("Failed to apply edits. Try refining the prompt.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full bg-[#1e1e1e] border-l border-[#414141] flex flex-col text-[#cccccc] font-sans">
      <div className="h-9 px-4 flex items-center border-b border-[#414141] select-none bg-[#252526]">
        <Bot size={16} className="text-purple-400 mr-2" />
        <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as AIPanelMode)}
          className="ml-3 text-[10px] uppercase tracking-wide bg-[#1f1f1f] border border-[#414141] rounded px-2 py-1 text-[#cccccc] outline-none"
        >
          <option value="teacher">Code Buddy</option>
          <option value="reviewer">Reviewer</option>
          <option value="vibe">Vibe Coder</option>
        </select>
        {isAnalyzing && <Loader2 size={14} className="ml-auto animate-spin text-blue-400" />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {mode === "vibe" ? (
          <div className="space-y-4">
            <div className="text-xs text-[#9da1a6] leading-relaxed">
              Write a task prompt. Vibe Coder edits only the active editor file.
            </div>

            <textarea
              value={vibePrompt}
              onChange={(e) => setVibePrompt(e.target.value)}
              placeholder="Example: Refactor this component for readability and keep behavior unchanged."
              className="w-full min-h-28 bg-[#1f1f1f] border border-[#414141] rounded p-2 text-sm outline-none focus:border-blue-500 resize-y"
            />

            <div className="text-xs text-[#9da1a6] border border-[#414141] rounded p-2 bg-[#1f1f1f]">
              Active file: <span className="text-blue-300">{fileName || "None selected"}</span>
            </div>

            <button
              disabled={isAnalyzing}
              onClick={runVibeTask}
              className="w-full flex items-center justify-center gap-2 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#3a3a3a] disabled:cursor-not-allowed rounded py-2 text-sm font-medium transition-colors"
            >
              <WandSparkles size={14} />
              Run Vibe Task
            </button>

            <div className="text-xs text-[#9da1a6] border border-[#414141] rounded p-2 bg-[#1f1f1f]">
              {statusMessage}
            </div>
          </div>
        ) : isAnalyzing ? (
           <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-[#333] rounded w-3/4"></div>
              <div className="h-4 bg-[#333] rounded w-1/2"></div>
              <div className="h-4 bg-[#333] rounded w-full"></div>
              <div className="h-4 bg-[#333] rounded w-5/6"></div>
           </div>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed">
             <div className="prose prose-invert max-w-none">
                {explanation.split('\n').map((line, i) => {
                    if (line.startsWith('###')) {
                        return <h3 key={i} className="text-white font-semibold mb-2 mt-4 text-base">{line.replace('### ', '')}</h3>
                    }
                    if (line.startsWith('-')) {
                        return (
                            <div key={i} className="flex items-start gap-2 mb-1">
                                <span className="mt-1.5 w-1 h-1 bg-purple-500 rounded-full flex-shrink-0" />
                                <span dangerouslySetInnerHTML={{ 
                                    __html: line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>')
                                                            .replace(/`(.*?)`/g, '<code class="bg-[#2d2d2d] px-1 rounded text-[#ce9178] font-mono text-xs">$1</code>')
                                }} />
                            </div>
                        )
                    }
                    return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ 
                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') 
                    }} />
                })}
             </div>
             
             {!isAnalyzing && code.trim().length > 0 && (
                <div className="mt-6 pt-4 border-t border-[#333] text-xs text-gray-500 flex items-center gap-2">
                    <Sparkles size={12} className="text-yellow-500" />
                    <span>AI analysis generated based on code patterns.</span>
                </div>
             )}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-[#252526] border-t border-[#414141]">
        <div className="text-xs text-[#858585] mb-2 flex items-center justify-between">
            <span>Status</span>
            <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 size={10} /> Active
            </span>
        </div>
        <div className="w-full bg-[#3c3c3c] h-1 rounded overflow-hidden">
            {isAnalyzing ? (
                <div className="h-full bg-purple-500 animate-progress"></div>
            ) : (
                <div className="h-full w-full bg-[#3c3c3c]"></div>
            )}
        </div>
      </div>
    </div>
  );
}
