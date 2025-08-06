import { LucideProps } from "lucide-react";

/**
 * 메뉴 항목 인터페이스
 * @interface MenuItem
 * @property {string} id - 메뉴 항목 ID
 * @property {string} label - 메뉴 항목 레이블
 * @property {React.ComponentType<any>} icon - 메뉴 항목 아이콘
 * @property {MenuItem[]} children - 하위 메뉴 항목
 * @property {string} apiPath - API 경로
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  children?: MenuItem[];
  apiPath?: string;
}