/**
 * 정지된 멤버의 데이터 구조를 정의합니다.
 */
export interface SuspendedMember {
  id: number;
  userId: string;
  name: string;
  email: string;
  suspendedDate: string;
  releaseDate: string;
  reason: string;
}
