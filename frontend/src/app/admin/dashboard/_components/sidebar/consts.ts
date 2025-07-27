import { MenuItem } from "../../_types/menuItem";
import { Home, Users, NotebookText, MailWarning } from "lucide-react";
import { AdminInfo } from "../../_types/adminInfo";

// 사이드바 메뉴 데이터
export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "대시보드",
    icon: Home,
  },
  {
    id: "member-management",
    label: "멤버 관리",
    icon: Users,
    children: [
      { id: "member-list", label: "전체 멤버", apiPath: "/api/admin/members" },
      { id: "suspended-member-list", label: "정지 멤버 이력", apiPath: "/api/admin/members/suspended" },
    ],
  },
  {
    id: "post-management",
    label: "게시글 관리",
    icon: NotebookText,
    apiPath: "/api/admin/posts"
  },
  {
    id: "reports",
    label: "신고 목록",
    icon: MailWarning,
    apiPath: "/api/admin/reports",
  },
];

export const adminInfo: AdminInfo = {
  id: "admin001",
  name: "관리자",
  email: "admin@bookbook.com",
  role: "시스템 관리자",
};
