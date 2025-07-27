export interface Report {
  id: number;
  userId: number;
  reportedUserId: number;
  title: string;
  description: string;
  createdDate: string;
}