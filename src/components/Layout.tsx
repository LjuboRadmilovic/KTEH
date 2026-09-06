import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/** Okvir sa navigacijom i podnozjem; Outlet je mesto gde se ubacuje stranica. */
export default function Layout() {
  return (
    <div className="ljuska">
      <Navbar />
      <main className="ljuska__sadrzaj">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
