import { useState } from "react";
import Image from "next/image";
import { User, ChevronDown, LogOut } from "lucide-react";
import { UserLoginResponseDto } from "@/app/admin/global/hooks/useAuth";

interface AdminProfileProps {
  admin: UserLoginResponseDto;
  onLogout: () => void;
}

// 관리자 프로필 영역 컴포넌트
export function AdminProfile(props: AdminProfileProps) {
  const { admin, onLogout } = props;
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  const avatar = "";
  const username = admin?.username ? admin.username : "";
  const nickname = admin?.nickname ? admin.nickname : "";
  const role = admin?.role ? admin.role : "";

  return (
    <>
      <div className="border-t border-slate-600 p-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-600 transition-colors"
          >
            {/* 아바타 */}
            <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={nickname}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>

            {/* 관리자 정보 */}
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">{nickname}</p>
              <p className="text-xs text-slate-300">{role}</p>
            </div>

            {/* 드롭다운 화살표 */}
            <ChevronDown
              size={16}
              className={`text-slate-300 transition-transform duration-200 ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* 드롭다운 메뉴 */}
          {showDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{nickname}</p>
                <p className="text-xs text-gray-500">{username}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
