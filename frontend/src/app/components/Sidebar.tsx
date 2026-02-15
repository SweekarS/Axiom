import React from "react";
import { ChevronRight, ChevronDown, FileCode, FileJson, Folder, FileType } from "lucide-react";
import { clsx } from "clsx";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  isOpen?: boolean;
}

interface SidebarProps {
  files: FileNode[];
  ideMode?: "dark" | "light";
  selectedFile?: string;
  onFileSelect: (fileName: string) => void;
  onToggleFolder: (id: string) => void;
  onCreateNode?: (type: "file" | "folder", parentId?: string, name?: string) => void;
  onDeleteNode?: (id: string) => void;
  onRenameNode?: (id: string, name: string) => void;
}

export function Sidebar({ files, ideMode = "dark", selectedFile, onFileSelect, onToggleFolder }: SidebarProps) {
  const isDarkMode = ideMode === "dark";

  const FileTree = ({ nodes, depth = 0 }: { nodes: FileNode[]; depth?: number }) => {
    return (
      <div className="select-none">
        {nodes.map((node) => (
          <div key={node.id}>
            <div
              className={clsx(
                "flex items-center py-1 px-2 cursor-pointer",
                isDarkMode ? "text-[#cccccc]" : "text-[#1f1f1f]",
                node.type === "file" && node.name === selectedFile
                  ? isDarkMode
                    ? "bg-[#094771]"
                    : "bg-[#cce8ff]"
                  : isDarkMode
                    ? "hover:bg-[#2a2d2e]"
                    : "hover:bg-[#e8e8e8]"
              )}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => {
                if (node.type === "folder") {
                  onToggleFolder(node.id);
                  return;
                }
                onFileSelect(node.name);
              }}
            >
              <span className="mr-1 opacity-70">
                {node.type === "folder" &&
                  (node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </span>
              <span className="mr-2 text-blue-400">
                {node.type === "folder" ? (
                  <Folder size={16} className="text-blue-300" />
                ) : node.name.endsWith(".tsx") ? (
                  <FileCode size={16} className="text-blue-400" />
                ) : node.name.endsWith(".json") ? (
                  <FileJson size={16} className="text-yellow-400" />
                ) : (
                  <FileType size={16} className="text-gray-400" />
                )}
              </span>
              <span className="text-sm">{node.name}</span>
            </div>
            {node.type === "folder" && node.isOpen && node.children && (
              <FileTree nodes={node.children} depth={depth + 1} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={clsx("h-full flex flex-col", isDarkMode ? "bg-[#252526] text-[#cccccc]" : "bg-[#f3f3f3] text-[#333333]")}>
      <div
        className={clsx(
          "px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center",
          isDarkMode ? "text-[#bbbbbb]" : "text-[#666666]"
        )}
      >
        <span>Explorer</span>
        {/* <span className="text-lg leading-none cursor-pointer">...</span> */}
      </div>
      <div className="flex-1 overflow-y-auto">
        <FileTree nodes={files} />
      </div>
    </div>
  );
}
