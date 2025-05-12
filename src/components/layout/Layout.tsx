
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto bg-lacos-light">
          {children}
        </main>
      </div>
    </div>
  );
}
