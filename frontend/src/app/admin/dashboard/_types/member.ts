/**
 * 정지된 멤버의 데이터 구조를 정의합니다.
 */
export interface Member {
  id: number;
  userId: string;
  name: string;
  email: string;
  createDate: string;
  lastModifiedDate: string;
  status: string;
}
