import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import MobileNav from "./MobileNav";
import ComposeModal from "@/components/compose/ComposeModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1265px] justify-center">
      <header className="sticky top-0 hidden h-screen w-[68px] shrink-0 sm:flex xl:w-[275px]">
        <Sidebar />
      </header>

      <main className="min-h-screen w-full max-w-[600px] border-x border-border pb-16 sm:pb-0">
        {children}
      </main>

      <aside className="hidden w-[350px] shrink-0 pl-6 lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto pb-4 no-scrollbar">
          <RightPanel />
        </div>
      </aside>

      <MobileNav />
      <ComposeModal />
    </div>
  );
}
