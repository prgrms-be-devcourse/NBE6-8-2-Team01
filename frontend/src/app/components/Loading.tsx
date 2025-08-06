
/*
* 로딩 화면을 보여주는 컴포넌트입니다.
*
* @param message 로딩 시 넣을 메세지
*/
export default function LoadingScreen({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">{message}</p>
            </div>
        </div>
    );
}