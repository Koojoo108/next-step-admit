import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
