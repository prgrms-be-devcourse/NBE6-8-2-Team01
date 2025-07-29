/**
 * 정지된 멤버의 데이터 구조 정의
 */
export interface SuspendedUser {
  id: number;
  userId: string;
  name: string;
  suspendedAt: string;
  resumedAt: string;
  reason: string;
}
