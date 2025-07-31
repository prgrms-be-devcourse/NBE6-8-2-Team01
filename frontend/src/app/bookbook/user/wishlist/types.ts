export interface WishListItem {
    id: number;
    rentId: number;
    bookTitle: string;
    bookAuthor: string;
    bookPublisher: string;
    bookCondition: string;
    rentStatus: string;
    lenderUserId: number;
    lenderUserName: string;
    lenderNickname?: string;
    bookImage: string;
    createDate: string;
    title?: string;
    address?: string;
}