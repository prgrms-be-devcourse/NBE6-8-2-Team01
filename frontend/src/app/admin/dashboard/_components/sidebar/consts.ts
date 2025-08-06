import { MenuItem } from "../../_types/menuItem";
import { Home, Users, NotebookText, MailWarning } from "lucide-react";

// 사이드바 메뉴 데이터
export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "대시보드",
    icon: Home,
  },
  {
    id: "user-management",
    label: "멤버 관리",
    icon: Users,
    children: [
      { id: "user-list", label: "전체 멤버", apiPath: "/api/v1/admin/users" },
      { id: "suspended-user-list", label: "정지 멤버 이력", apiPath: "/api/v1/admin/users/suspend" },
    ],
  },
  {
    id: "post-management",
    label: "게시글 관리",
    icon: NotebookText,
    apiPath: "/api/v1/admin/rent"
  },
  {
    id: "reports",
    label: "신고 목록",
    icon: MailWarning,
    apiPath: "/api/v1/admin/reports",
  },
];
