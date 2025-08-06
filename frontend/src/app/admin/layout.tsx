import "../globals.css";
import ContextLayout from "./contextLayout";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />
      <ContextLayout>{children}</ContextLayout>
    </>
  );
}
