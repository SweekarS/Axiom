import React from "react";
import * as Menubar from "@radix-ui/react-menubar";
import { Check } from "lucide-react";

interface MenuBarProps {
  onAction: (action: string, payload?: any) => void;
  visiblePanels: {
    sidebar: boolean;
    ai: boolean;
    terminal: boolean;
  };
}

export function MenuBar({ onAction, visiblePanels }: MenuBarProps) {
  const buildFolderData = async (directoryHandle: FileSystemDirectoryHandle) => {
    const fileContents: Record<string, string> = {};

    const readDirectory = async (
      dirHandle: FileSystemDirectoryHandle,
      parentPath = ""
    ): Promise<Array<{ id: string; name: string; type: "file" | "folder"; isOpen?: boolean; children?: any[] }>> => {
      const nodes: Array<{ id: string; name: string; type: "file" | "folder"; isOpen?: boolean; children?: any[] }> = [];

      for await (const entry of dirHandle.values()) {
        const entryPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;

        if (entry.kind === "directory") {
          const children = await readDirectory(entry, entryPath);
          nodes.push({
            id: `folder:${entryPath}`,
            name: entry.name,
            type: "folder",
            isOpen: false,
            children,
          });
          continue;
        }

        try {
          const file = await entry.getFile();
          fileContents[entry.name] = await file.text();
        } catch {
          fileContents[entry.name] = "";
        }

        nodes.push({
          id: `file:${entryPath}`,
          name: entry.name,
          type: "file",
        });
      }

      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    };

    const children = await readDirectory(directoryHandle);
    return { children, fileContents };
  };

  const handleFileSelection = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();

      onAction("open_file", {
        name: file.name,
        content: await file.text(),
      });
    } catch (error) {
      // Ignore user-cancelled picker interactions.
    }
  };

  const handleFolderSelection = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const { children, fileContents } = await buildFolderData(directoryHandle);

      onAction("open_folder", {
        folderName: directoryHandle.name,
        children,
        fileContents,
      });
    } catch (error) {
      // Ignore user-cancelled picker interactions.
    }
  };

  const menus = [
    {
      trigger: "File",
      items: [
        { label: "New File", action: "new_file", shortcut: "Ctrl+N" },
        { label: "New Window", action: "new_window", shortcut: "Ctrl+Shift+N" },
        { type: "separator" },
        {
          label: "Open File...",
          action: "open_file",
          shortcut: "Ctrl+O",
          onSelect: handleFileSelection,
        },
        {
          label: "Open Folder...",
          action: "open_folder",
          shortcut: "Ctrl+K Ctrl+O",
          onSelect: handleFolderSelection,
        },
        { type: "separator" },
        { label: "Save", action: "save_file", shortcut: "Ctrl+S" },
        { label: "Save As...", action: "save_as", shortcut: "Ctrl+Shift+S" },
        { label: "Save All", action: "save_all" },
        { type: "separator" },
        { label: "Exit", action: "exit" },
      ],
    },
    {
      trigger: "Edit",
      items: [
        { label: "Undo", action: "undo", shortcut: "Ctrl+Z" },
        { label: "Redo", action: "redo", shortcut: "Ctrl+Y" },
        { type: "separator" },
        { label: "Cut", action: "cut", shortcut: "Ctrl+X" },
        { label: "Copy", action: "copy", shortcut: "Ctrl+C" },
        { label: "Paste", action: "paste", shortcut: "Ctrl+V" },
        { type: "separator" },
        { label: "Find", action: "find", shortcut: "Ctrl+F" },
        { label: "Replace", action: "replace", shortcut: "Ctrl+H" },
      ],
    },
    {
      trigger: "Selection",
      items: [
        { label: "Select All", action: "select_all", shortcut: "Ctrl+A" },
        { label: "Expand Selection", action: "expand_selection" },
        { label: "Shrink Selection", action: "shrink_selection" },
      ],
    },
    {
      trigger: "View",
      items: [
        { label: "Explorer", action: "toggle_sidebar", checked: visiblePanels.sidebar },
        { label: "Terminal", action: "toggle_terminal", checked: visiblePanels.terminal },
        { label: "AI Assistant", action: "toggle_ai", checked: visiblePanels.ai },
        { type: "separator" },
        { label: "Word Wrap", action: "toggle_word_wrap", shortcut: "Alt+Z" },
      ],
    },
    {
      trigger: "Go",
      items: [
        { label: "Back", action: "go_back", shortcut: "Alt+Left" },
        { label: "Forward", action: "go_forward", shortcut: "Alt+Right" },
        { type: "separator" },
        { label: "Go to File...", action: "go_to_file", shortcut: "Ctrl+P" },
      ],
    },
    {
      trigger: "Run",
      items: [
        { label: "Start Debugging", action: "start_debugging", shortcut: "F5" },
        { label: "Run Without Debugging", action: "run_without_debugging", shortcut: "Ctrl+F5" },
      ],
    },
    {
      trigger: "Help",
      items: [
        { label: "Welcome", action: "help_welcome" },
        { label: "Documentation", action: "help_docs" },
        { type: "separator" },
        { label: "About", action: "help_about" },
      ],
    },
  ];

  return (
    <Menubar.Root className="flex bg-[#3c3c3c] text-[#cccccc] select-none h-full items-center">
      {menus.map((menu) => (
        <Menubar.Menu key={menu.trigger}>
          <Menubar.Trigger className="px-3 py-1 text-xs hover:bg-[#505050] rounded cursor-default outline-none data-[state=open]:bg-[#505050] data-[state=open]:text-white transition-colors">
            {menu.trigger}
          </Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content
              className="min-w-[220px] bg-[#252526] rounded-md shadow-xl border border-[#454545] p-1 z-50 text-xs"
              align="start"
              sideOffset={5}
              alignOffset={-3}
            >
              {menu.items.map((item, index) => {
                if (item.type === "separator") {
                  return <Menubar.Separator key={index} className="h-[1px] bg-[#454545] my-1" />;
                }
                return (
                  <Menubar.Item
                    key={index}
                    className="group relative flex items-center justify-between px-2 py-1.5 outline-none hover:bg-[#094771] hover:text-white rounded-sm cursor-pointer data-[disabled]:opacity-50 text-[#cccccc]"
                    onSelect={item.onSelect || (() => item.action && onAction(item.action))}
                  >
                    <div className="flex items-center gap-2">
                      {item.checked !== undefined && (
                        <div className="w-4 flex items-center justify-center">
                          {item.checked && <Check size={12} />}
                        </div>
                      )}
                      <span className={item.checked !== undefined ? "" : "pl-4"}>{item.label}</span>
                    </div>
                    {item.shortcut && <span className="text-[#858585] group-hover:text-white ml-4">{item.shortcut}</span>}
                  </Menubar.Item>
                );
              })}
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      ))}
    </Menubar.Root>
  );
}
