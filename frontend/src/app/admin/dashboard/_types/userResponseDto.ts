/**
 * 정지된 멤버의 데이터 구조를 정의합니다.
 */

export type userStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type userRole = 'ADMIN' | 'USER';

export const getStatus = (status: userStatus): string => {
  const map: Record<userStatus, string> = {
    ACTIVE: "정상",
    SUSPENDED: "활동 정지",
    INACTIVE: "비활성화"
  }
  return map[status];
}

export const getUserRole = (role : userRole) : string => {
  const map: Record<userRole, string> = {
    "ADMIN" : "어드민",
    "USER" : "유저"
  }
  return map[role];
}

export interface UserDetailResponseDto {
  baseResponseDto: UserBaseResponseDto;
  address: string;
  suspendCount: number;
  suspendedAt?: string;
  resumedAt?: string;
}

export interface UserBaseResponseDto {
  id: number;
  username?: string | "";
  nickname?: string | "";
  email?: string | "";
  rating: number;
  createdAt: string;
  updatedAt: string;
  userStatus: userStatus;
  role: userRole;
}