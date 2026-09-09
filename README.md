[README.md](https://github.com/user-attachments/files/31995231/README.md)
# Memorija — igra memorije za dva igrača

Klijentska veb aplikacija rađena u okviru predmeta **Klijentske VEB tehnologije**.
Dva igrača naizmenično okreću po dve kartice: pogođen par donosi poen i novi potez,
a promašaj predaje potez protivniku. Partije se pamte, pa se rezultati prikazuju
kroz istoriju i grafikone.

## Pokretanje na lokalnoj mašini

Potreban je **Node.js 20 ili noviji**.

```bash
git clone <adresa-repozitorijuma>
cd <folder-repozitorijuma>
npm install
npm run dev
```

`npm run dev` ispisuje adresu lokalnog servera (podrazumevano
<http://localhost:5173>). Zaustavlja se sa `Ctrl+C`.

Produkciona verzija:

```bash
npm run build      # pravi folder dist/
npm run preview    # pokreće dist/ lokalno
```

## Šta aplikacija radi

- **Igra za dva igrača** — table 4×4, 6×6 i 8×8, naizmenični potezi, poseban brojač
  pogodaka i poteza za svakog igrača, tajmer partije, pobednik ili nerešeno.
- **Šest paketa pojmova** — *Psi* (slike sa Dog CEO API-ja), *Pokemoni* (PokéAPI),
  te *Zastave*, *Voće i povrće*, *Životinje* i *IT pojmovi* iz lokalnog JSON fajla.
  Ako API ne odgovori, partija se automatski igra rezervnim pojmovima iz JSON-a.
- **Osamnaest nivoa** sa filterima po težini i paketu i paginacijom; teži nivoi se
  otključavaju kad odigraš lakši iz istog paketa.
- **Istorija partija** — tabela sa filterima (paket, težina, ishod), sortiranjem i
  paginacijom.
- **Statistika** — tri grafikona (Chart.js): partije po paketu, pobede po igraču i
  trajanje poslednjih partija.
- **Nalog** — registracija, prijava i profil; podaci se čuvaju u localStorage-u.
- **Responzivnost** — 1440 / 1024 / 768 px, sa hamburger menijem na užim ekranima.

## Tehnologije

| Tehnologija | Uloga |
|---|---|
| **React 18** | komponente i stanje |
| **TypeScript 5** | tipovi, interfejsi i klase |
| **Vite 5** | razvojni server i build |
| **react-router-dom 6** | rute, `useNavigate`, `useParams`, `useLocation`, `useSearchParams` |
| **Chart.js 4** + **react-chartjs-2** | grafikoni na stranici statistike |
| **CSS** | stilizovanje preko promenljivih u `src/styles/variables.css` |

Bez CSS okvira (nema Bootstrap-a ni Tailwind-a) — boje, razmaci i tipografija su
preuzeti iz Figma dizajna urađenog u prvom domaćem zadatku.

## Izvori podataka

- `public/podaci/classic-pack.json` — paketi pojmova, težine i nivoi
- [Dog CEO API](https://dog.ceo/dog-api/) — nasumične slike pasa
- [PokéAPI](https://pokeapi.co/) — spisak Pokemona

## Struktura projekta

```
src/
  components/   komponente koje se koriste više puta
                Button, InputField, Loader, Navbar, Footer, Layout, PageHeader,
                MemoryCard, GameBoard, PlayerPanel, Pagination, FilterBar,
                LevelCard, StatTile
  context/      AuthContext — prijavljeni korisnik kroz useContext
  hooks/        useGame — veza između klase MemoryGame i React-a
  models/       tipovi, interfejsi i klase
                types.ts
                interfaces/  IGameEngine, IDeckProvider, IApiClient, IStorage
                MemoryGame, Player, ApiClient, StorageService,
                MatchHistoryService, AuthService, podaci.ts
                decks/       LocalDeckProvider, DogDeckProvider, PokemonDeckProvider
  pages/        jedna komponenta po ruti
  styles/       variables.css (dizajn tokeni), global.css
```

## Rute

| Ruta | Stranica |
________________________
| `/prijava` | Prijava |
| `/registracija` | Registracija |
| `/` | Početna |
| `/nivoi` | Spisak nivoa (filteri + paginacija) |
| `/nivoi/:id` | Pojedinačni nivo |
| `/igra/:id` | Ekran igre |
| `/rezultat/:id` | Rezultat partije |
| `/statistika` | Statistika sa grafikonima |
| `/istorija` | Istorija partija (filteri + sortiranje + paginacija) |
| `/profil` | Profil korisnika |
| `*` | Stranica za nepostojeću adresu |

## Napomena o čuvanju podataka

Aplikacija je isključivo klijentska i nema server. Nalozi i istorija partija stoje
u `localStorage`-u pregledača, a lozinka se ne čuva u čitljivom obliku (upisuje se
samo njen otisak). To nije prava zaštita — u aplikaciji sa serverom provera bi
išla na serveru.
