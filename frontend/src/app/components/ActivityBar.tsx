import React from "react";
import { Files} from "lucide-react";
import { clsx } from "clsx";

interface ActivityBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ActivityBar({ activeTab, onTabChange }: ActivityBarProps) {
  const icons = [
    { id: "explorer", icon: Files },
    //{ id: "search", icon: Search },
    // { id: "git", icon: GitGraph },
    // { id: "debug", icon: Play },
    // { id: "extensions", icon: Box },
  ];

  return (
    <div className="w-12 h-full bg-[#333333] flex flex-col items-center py-2 border-r border-[#1e1e1e]">
      {icons.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={clsx(
            "p-3 mb-2 rounded-sm hover:text-white transition-colors",
            activeTab === item.id ? "text-white border-l-2 border-blue-500" : "text-[#858585]"
          )}
        >
          <item.icon size={24} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}
