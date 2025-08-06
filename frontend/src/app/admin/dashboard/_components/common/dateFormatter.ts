/*
* Datetime string을 포매팅하여, 새 형태로 변환합니다.
*
* @param dateString 날짜 문자열입니다
*/
export const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};