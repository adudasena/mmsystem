import MenuLateral from '@/components/MenuLateral';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#dcded0]">
      <MenuLateral />
      <main className="flex-1 ml-72 p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}