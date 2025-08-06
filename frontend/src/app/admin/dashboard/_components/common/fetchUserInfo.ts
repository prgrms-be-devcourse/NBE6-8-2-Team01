import { UserDetailResponseDto } from "@/app/admin/dashboard/_types/userResponseDto";

/*
* 어드민 API 를 통해 유저 정보를 조회
*
* 반드시 fetchInterceptor를 거쳐야 함
* */
const fetchUserInfoFromAdmin = async (userId : number) => {
    const response = await fetch(`/api/v1/admin/users/${userId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await response.json();

    // 200 이 아닐 시 오류 메세지를 던지
    if (response.status >= 400) {
        throw data.msg;
    }


    if (!data.data) {
        return null as unknown as UserDetailResponseDto;
    }

    return data.data as UserDetailResponseDto
}

export default fetchUserInfoFromAdmin;