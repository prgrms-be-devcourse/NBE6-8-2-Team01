"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/app/components/Loading";

/*
* 시작 페이지입니다.
*
* 자동으로 /bookbook으로 이동시킬 수 있도록 했습니다.
*/
export default function StartPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/bookbook")
    }, [router]);

    return <LoadingScreen message="로딩 중" />;
}