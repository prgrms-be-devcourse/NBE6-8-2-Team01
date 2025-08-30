import '../globals.css';
import Bottom from '../components/Bottom';
import ClientLayout from './ClientLayout';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <Suspense fallback={
          <header className="w-full py-6 shadow-md bg-white">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-3xl font-bold" style={{ color: "#D5BAA3" }}>
                북북
              </div>
              <nav className="flex items-center text-lg font-semibold text-gray-800">
                <div className="mr-10">홈</div>
                <div className="mx-4">책 빌리러 가기</div>
                <div className="ml-8">책 빌려주기</div>
              </nav>
              <div className="flex items-center space-x-6">
                <button className="text-lg font-semibold px-5 py-2 rounded-md shadow bg-[#D5BAA3] text-white">
                  Login
                </button>
              </div>
            </div>
          </header>
        }>
            <ClientLayout>{children}</ClientLayout>
        </Suspense>
        <Suspense fallback={
          <footer className="w-full bg-[#D5BAA3] py-6 px-4">
            <div className="max-w-7xl mx-auto text-white text-sm sm:text-base leading-relaxed">
              <p className="font-bold text-lg mb-1">북북</p>
              <p>@Copyright 2025 BookBook co, Ltd.</p>
              <p>All rights reserved.</p>
            </div>
          </footer>
        }>
            <Bottom />
        </Suspense>
    </>
  );
}