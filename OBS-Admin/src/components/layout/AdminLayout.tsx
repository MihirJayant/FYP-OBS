import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <Header title={title} />
        <main className="p-4 lg:p-6 ">
          {/*animate-fade-in*/}
          {children}
        </main>
      </div>
    </div>
  );
}
