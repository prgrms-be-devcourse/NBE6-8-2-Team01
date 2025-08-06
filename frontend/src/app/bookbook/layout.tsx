import '../globals.css';
import Bottom from '../components/Bottom';
import ClientLayout from './ClientLayout';
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ClientLayout>{children}</ClientLayout>
      <Bottom />
      <ToastContainer
          position="bottom-center"
          autoClose={3000}
      />
    </>
  );
}