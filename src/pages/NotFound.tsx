import { Link } from 'react-router-dom';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

export default function NotFound() {
  return (
    <>
      <PageHeader
        nadnaslov="Greška 404"
        naslov="Ova stranica ne postoji"
        opis="Adresa je pogrešno ukucana ili je stranica uklonjena."
      />
      <Link to="/"><Button>Nazad na početnu</Button></Link>
    </>
  );
}
