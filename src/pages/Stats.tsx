import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import PageHeader from '../components/PageHeader';
import StatTile from '../components/StatTile';
import { istorijaPartija } from '../models/MatchHistoryService';
import { formatirajVreme, ucitajPodatke } from '../models/podaci';
import type { PaketiPodaci, Partija } from '../models/types';
import './Stats.css';

/**
 * Chart.js 4 je modularan: bez ove registracije grafikon se ne iscrta,
 * a greska se nigde ne prijavi. Registruje se jednom, pri ucitavanju modula.
 */
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip);

/* Boje serija, proverene na tamnoj podlozi (#131A30) */
const SERIJA_LJUBICASTA = '#8B5CF6';
const SERIJA_TIRKIZNA = '#0E9FBC';
const MREZA = 'rgba(30, 42, 82, 0.75)';
const TEKST_OSE = '#6B7799';

const zajednickeOpcije: ChartOptions<'bar' | 'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  // kratka animacija: grafikon je citljiv skoro odmah po otvaranju stranice
  animation: { duration: 450 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0F1526',
      borderColor: '#2E3C6E',
      borderWidth: 1,
      titleColor: '#F5F5F5',
      bodyColor: '#A9B4CE',
      padding: 10,
      displayColors: false,
    },
  },
};

export default function Stats() {
  const [partije, postaviPartije] = useState<Partija[]>([]);
  const [podaci, postaviPodatke] = useState<PaketiPodaci | null>(null);

  useEffect(() => {
    postaviPartije(istorijaPartija.sve());
    ucitajPodatke().then(postaviPodatke).catch(() => postaviPodatke(null));
  }, []);

  const sazetak = useMemo(() => istorijaPartija.sazetak(), [partije]);

  /* --- 1. partije po paketu --- */
  const poPaketu = useMemo(() => {
    const stavke = Object.entries(sazetak.partijaPoPaketu);
    const naziv = (id: string) => podaci?.paketi.find((p) => p.id === id)?.naziv ?? id;

    return {
      labels: stavke.map(([id]) => naziv(id)),
      datasets: [
        {
          label: 'Partija',
          data: stavke.map(([, broj]) => broj),
          backgroundColor: SERIJA_LJUBICASTA,
          borderRadius: 4,
          borderSkipped: false as const,
          barPercentage: 0.6,
          categoryPercentage: 0.75,
          maxBarThickness: 26,
        },
      ],
    };
  }, [sazetak, podaci]);

  /* --- 2. pobede po igracu --- */
  const poIgracu = useMemo(() => {
    const stavke = Object.entries(sazetak.pobedaPoIgracu).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return {
      labels: stavke.map(([ime]) => ime),
      datasets: [
        {
          label: 'Pobeda',
          data: stavke.map(([, broj]) => broj),
          backgroundColor: SERIJA_LJUBICASTA,
          borderRadius: 4,
          borderSkipped: false as const,
          barPercentage: 0.6,
          categoryPercentage: 0.75,
          maxBarThickness: 26,
        },
      ],
    };
  }, [sazetak]);

  /* --- 3. trajanje poslednjih partija --- */
  const trajanja = useMemo(() => {
    const poslednje = [...partije].slice(0, 12).reverse();

    return {
      labels: poslednje.map((partija) =>
        new Date(partija.odigrana).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' }),
      ),
      datasets: [
        {
          label: 'Trajanje',
          data: poslednje.map((partija) => partija.trajanjeSek),
          borderColor: SERIJA_TIRKIZNA,
          backgroundColor: 'rgba(14, 159, 188, 0.14)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: SERIJA_TIRKIZNA,
          pointBorderColor: '#131A30',
          pointBorderWidth: 2,
          tension: 0.25,
          fill: true,
        },
      ],
    };
  }, [partije]);

  const opcijeStubaca: ChartOptions<'bar'> = {
    ...(zajednickeOpcije as ChartOptions<'bar'>),
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: TEKST_OSE, precision: 0 },
        grid: { color: MREZA },
        border: { color: MREZA },
      },
      y: {
        ticks: { color: TEKST_OSE },
        grid: { display: false },
        border: { color: MREZA },
      },
    },
  };

  const opcijeLinije: ChartOptions<'line'> = {
    ...(zajednickeOpcije as ChartOptions<'line'>),
    interaction: { mode: 'index', intersect: false },
    plugins: {
      ...zajednickeOpcije.plugins,
      tooltip: {
        ...zajednickeOpcije.plugins?.tooltip,
        callbacks: {
          label: (stavka) => `Trajanje: ${formatirajVreme(Number(stavka.parsed.y))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: TEKST_OSE },
        grid: { display: false },
        border: { color: MREZA },
      },
      y: {
        beginAtZero: true,
        ticks: { color: TEKST_OSE, callback: (vrednost) => formatirajVreme(Number(vrednost)) },
        grid: { color: MREZA },
        border: { color: MREZA },
      },
    },
  };

  if (partije.length === 0) {
    return (
      <>
        <PageHeader
          nadnaslov="Statistika"
          naslov="Statistika partija"
          opis="Grafički prikaz svih odigranih partija."
        />
        <div className="prazno">
          Statistika se popunjava iz odigranih partija.{' '}
          <Link to="/nivoi">Odigraj prvu partiju</Link> pa se vrati ovde.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        nadnaslov="Statistika"
        naslov="Statistika partija"
        opis="Sve brojke se računaju iz partija sačuvanih u ovom pregledaču."
      />

      <div className="statistika__plocice">
        <StatTile vrednost={sazetak.ukupnoPartija} oznaka="odigranih partija" />
        <StatTile vrednost={sazetak.ukupnoParova} oznaka="pogođenih parova" boja={SERIJA_LJUBICASTA} />
        <StatTile vrednost={formatirajVreme(sazetak.prosecnoTrajanjeSek)} oznaka="prosečno trajanje" />
        <StatTile vrednost={sazetak.nereseniIshodi} oznaka="nerešenih partija" />
      </div>

      <div className="statistika__grafikoni">
        <section className="grafikon">
          <div>
            <h3 className="grafikon__naslov">Partije po paketu</h3>
            <p className="grafikon__opis">Koliko je partija odigrano sa svakim paketom pojmova.</p>
          </div>
          <div className="grafikon__platno">
            <Bar data={poPaketu} options={opcijeStubaca} />
          </div>
        </section>

        <section className="grafikon">
          <div>
            <h3 className="grafikon__naslov">Pobede po igraču</h3>
            <p className="grafikon__opis">Broj dobijenih partija po imenu igrača. Nerešene se ne broje.</p>
          </div>
          <div className="grafikon__platno">
            <Bar data={poIgracu} options={opcijeStubaca} />
          </div>
        </section>

        <section className="grafikon grafikon--siroki">
          <div>
            <h3 className="grafikon__naslov">Trajanje poslednjih partija</h3>
            <p className="grafikon__opis">Poslednjih dvanaest partija, od najstarije ka najnovijoj.</p>
          </div>
          <div className="grafikon__platno">
            <Line data={trajanja} options={opcijeLinije} />
          </div>
        </section>
      </div>

      <p className="statistika__napomena">
        Iste partije u obliku tabele, sa filterima i sortiranjem, stoje na stranici{' '}
        <Link to="/istorija">Istorija partija</Link>.
      </p>
    </>
  );
}
