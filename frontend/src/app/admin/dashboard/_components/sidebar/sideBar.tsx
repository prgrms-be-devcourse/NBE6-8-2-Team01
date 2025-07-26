import { AdminProfile } from "../adminProfile";
import { MenuItem } from "../../_types/menuItem";
import { ChevronDown, ChevronRight } from "lucide-react";
import { menuItems, adminInfo } from "./consts";
import { GoBook } from "react-icons/go";
import Link from "next/link";

interface SidebarMenuItemProps {
  item: MenuItem;
  level?: number;
  expandedItems: Set<string>;
  onToggle: (id: string) => void;
  activeItem: string;
  onItemClick: (id: string, apiPath?: string) => void;
}

interface SidebarProps {
  expandedItems: Set<string>;
  onToggle: (id: string) => void;
  activeItem: string;
  onItemClick: (id: string, apiPath?: string) => void;
  onLogout: () => void;
}

function SidebarMenuItem(props: SidebarMenuItemProps) {
  const {
    item,
    level = 0,
    expandedItems,
    onToggle,
    activeItem,
    onItemClick,
  } = props;
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isActive = activeItem === item.id;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.id);
    } else {
      onItemClick(item.id, item.apiPath);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-white transition-colors
              ${level > 0 ? "hover:bg-slate-500 pl-8" : "hover:bg-slate-600"}
              ${isActive ? "bg-slate-600" : ""}`}
      >
        <div className="flex items-center space-x-3">
          {item.icon && <item.icon size={20} />}
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {hasChildren && (
          <div className="transition-transform duration-200">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="bg-slate-600">
          {item.children?.map((child) => (
            <SidebarMenuItem
              key={child.id}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              onToggle={onToggle}
              activeItem={activeItem}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SideBar(props: SidebarProps) {
  const { expandedItems, onToggle, activeItem, onItemClick, onLogout } = props;

  return (
    <div className="w-64 bg-slate-700 min-h-screen flex flex-col">
      {/* 헤더 영역 */}
      <div className="p-6">
        <h1 className="flex justify-between text-xl font-bold text-white">
          <span>북북</span>
          <Link href="/bookbook" target="_blank" title="북북 사이트로 이동하기">
            <GoBook className="ml-2" />
          </Link>
        </h1>
        <p className="text-sm text-slate-300 mt-1">관리자 대시보드</p>
      </div>

      {/* 메뉴 영역 - flex-1로 남은 공간 차지 */}
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <SidebarMenuItem
            key={item.id}
            item={item}
            expandedItems={expandedItems}
            onToggle={onToggle}
            activeItem={activeItem}
            onItemClick={onItemClick}
          />
        ))}
      </nav>

      {/* 관리자 프로필 영역 - 하단 고정 */}
      <AdminProfile admin={adminInfo} onLogout={onLogout} />
    </div>
  );
}
