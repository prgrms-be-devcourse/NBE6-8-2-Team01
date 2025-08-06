import '../globals.css';
import Bottom from '../components/Bottom';
import ClientLayout from './ClientLayout';
import { ToastContainer } from "react-toastify";
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <Suspense fallback={<div>페이지를 로딩 중입니다...</div>}>
            <ClientLayout>{children}</ClientLayout>
        </Suspense>
        <Bottom />
        <ToastContainer
            position="bottom-center"
            autoClose={3000}
        />
    </>
  );
}