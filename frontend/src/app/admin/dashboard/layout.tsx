"use client";

import "@/app/globals.css";
import { DashboardProvider } from "@/app/admin/dashboard/_hooks/useDashboard";
import { LoginModalProvider, useLoginModal } from "@/app/context/LoginModalContext";
import React, { useEffect } from "react";
import { setFetchInterceptorOpenLoginModal } from "@/app/util/fetchIntercepter";
import LoginModal from "@/app/admin/dashboard/_components/common/LoginModal";

function InterceptorSetup() {
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    setFetchInterceptorOpenLoginModal(openLoginModal);
  }, [openLoginModal]);

  return null;
}

function LoginModalContainer() {
  const { isLoginModalOpen, closeLoginModal } = useLoginModal();
  if (!isLoginModalOpen) return null;
  return <LoginModal onClose={closeLoginModal} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LoginModalProvider>
      <InterceptorSetup />
        <DashboardProvider>
          {children}
        </DashboardProvider>
      <LoginModalContainer />
    </LoginModalProvider>
  );
}
