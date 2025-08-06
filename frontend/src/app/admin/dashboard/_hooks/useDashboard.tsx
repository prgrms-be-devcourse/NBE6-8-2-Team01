"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { MenuItem } from "@/app/admin/dashboard/_types/menuItem";
import { menuItems } from "@/app/admin/dashboard/_components/sidebar/consts";

export default function useDashboard() {
    const [activeItem, setActiveItem] = useState('dashboard');
    const [currentItem, setCurrentItem] = useState<MenuItem | null>(null as unknown as MenuItem);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [responseData, setResponseData] = useState<unknown>(null as unknown);

    const fetchData = useCallback((apiPath: string) => {
        setError(false);

        fetch(apiPath)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setResponseData(data.data);
                }
            })
            .catch(error => {
                setResponseData(null);
                setError(true);
            })
            .finally(() => {setLoading(false)}
        );
    }, []);

    useEffect(() => {
        setResponseData(null as unknown);
        setLoading(true);

        const findMenuItem = (items: MenuItem[], id: string): MenuItem | null => {
            for (const item of items) {
                if (item.id === id) return item;
                if (item.children) {
                    const found = findMenuItem(item.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const item = findMenuItem(menuItems, activeItem);
        setCurrentItem(item);

        // API가 있는 메뉴만 데이터 fetch
        if (item && item.apiPath) {
            fetchData(item.apiPath);
        } else {
            setResponseData(null);
            setLoading(false);
        }
    }, [activeItem, fetchData]);

    const refreshData = useCallback(() => {
        if (currentItem?.apiPath) {
            fetchData(currentItem.apiPath);
        }
    }, [currentItem, fetchData]);

    return {
        activeItem,
        setActiveItem,
        currentItem,
        setCurrentItem,
        loading,
        responseData,
        setResponseData,
        refreshData,
        fetchData,
        error,
    }
}

export const DashBoardContext = createContext<ReturnType<typeof useDashboard>>(
    null as unknown as ReturnType<typeof useDashboard>,
);

export function DashboardProvider({
  children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const dashBoardState = useDashboard();

    return <DashBoardContext value={dashBoardState}>{children}</DashBoardContext>
}

export function useDashBoardContext() {
    const dashBoardState = useContext(DashBoardContext);

    if (dashBoardState === null) throw new Error("DashBoardContext is not found");

    return dashBoardState;
}