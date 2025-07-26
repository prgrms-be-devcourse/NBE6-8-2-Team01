import { MenuItem } from "../../_types/menuItem";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarMenuItemProps {
  item: MenuItem;
  level?: number;
  expandedItems: Set<string>;
  onToggle: (id: string) => void;
  activeItem: string;
  onItemClick: (id: string, href?: string) => void;
}

export function SidebarMenuItem(props: SidebarMenuItemProps) {
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
        className={`w-full flex items-center justify-between px-4 py-3 text-left text-white hover:bg-slate-300 transition-colors
                ${isActive ? (level > 0 ? "bg-gray-700" : "bg-slate-600") : ""}
                ${level > 0 ? "pl-8" : ""}`}
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
