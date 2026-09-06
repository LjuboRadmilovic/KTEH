import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Levels from './pages/Levels';
import LevelDetail from './pages/LevelDetail';
import Game from './pages/Game';
import Result from './pages/Result';
import Stats from './pages/Stats';
import History from './pages/History';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

/**
 * Rute aplikacije.
 * Prijava i registracija stoje van Layout-a jer nemaju navigaciju i podnozje.
 * AuthProvider je iznad svega, pa svaka stranica zna ko je prijavljen.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/prijava" element={<Login />} />
          <Route path="/registracija" element={<Register />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/nivoi" element={<Levels />} />
            <Route path="/nivoi/:id" element={<LevelDetail />} />
            <Route path="/igra/:id" element={<Game />} />
            <Route path="/rezultat/:id" element={<Result />} />
            <Route path="/statistika" element={<Stats />} />
            <Route path="/istorija" element={<History />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
