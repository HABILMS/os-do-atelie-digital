
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StoreInfo from "./StoreInfo";

type LayoutProps = {
  children: ReactNode;
  title?: string;
  showStoreInfo?: boolean;
};

export default function Layout({ children, title, showStoreInfo = false }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto bg-lacos-light">
          {showStoreInfo && (
            <div className="mb-6">
              <StoreInfo />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
