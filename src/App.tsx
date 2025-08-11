import React, { useMemo, useState } from "react";

type TyreOffer = {
  site: string;
  brand: string;
  pattern: string;
  size: string; // e.g., 205/55 R16 91V
  stock: number;
  price: number;
  currency: string; // TRY | EUR | USD
  url: string;
};

const SITES = [
  { key: "lastikpark", label: "bayiportal.lastikpark.com", host: "bayiportal.lastikpark.com" },
  { key: "mollaoglu", label: "bayi.mollaoglu.com.tr", host: "bayi.mollaoglu.com.tr" },
  { key: "haskar", label: "b2b.haskar.com.tr", host: "b2b.haskar.com.tr" },
  { key: "cakiroglu", label: "b2b.cakirogluotomotiv.com", host: "b2b.cakirogluotomotiv.com" },
  { key: "mutaflar", label: "bayi.mutaflarotomotiv.com", host: "bayi.mutaflarotomotiv.com" },
  { key: "lasmax", label: "www.lasmaxbayi.com", host: "www.lasmaxbayi.com" },
];

const fmtPrice = (n: number, ccy: string) => `${n.toFixed(2)} ${ccy}`;

function downloadCSV(filename: string, rows: TyreOffer[]) {
  if (!rows.length) return;
  const header = ["site", "brand", "pattern", "size", "stock", "price", "currency", "url"];
  const escape = (v: any) => `"${String(v).replaceAll('"', '""')}"`;
  const csv = [
    header.join(","),
    ...rows.map((r) => [r.site, r.brand, r.pattern, r.size, r.stock, r.price, r.currency, r.url].map(escape).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 0);
}

const MOCK: TyreOffer[] = [
  {
    site: "bayiportal.lastikpark.com",
    brand: "Michelin",
    pattern: "Primacy 4+",
    size: "205/55 R16 91V",
    stock: 24,
    price: 3850,
    currency: "TRY",
    url: "https://bayiportal.lastikpark.com/#PortalMain",
  },
  {
    site: "bayi.mollaoglu.com.tr",
    brand: "Michelin",
    pattern: "Primacy 4+",
    size: "205/55 R16 91V",
    stock: 8,
    price: 3795,
    currency: "TRY",
    url: "https://bayi.mollaoglu.com.tr/tr/urunler",
  },
  {
    site: "b2b.haskar.com.tr",
    brand: "Michelin",
    pattern: "Primacy 4+",
    size: "205/55 R16 91V",
    stock: 5,
    price: 3920,
    currency: "TRY",
    url: "https://b2b.haskar.com.tr",
  },
  {
    site: "b2b.cakirogluotomotiv.com",
    brand: "Michelin",
    pattern: "Primacy 4+",
    size: "205/55 R16 91V",
    stock: 12,
    price: 3810,
    currency: "TRY",
    url: "https://b2b.cakirogluotomotiv.com/B2B_Stoklar.asp",
  },
];

export default function App() {
  const [width, setWidth] = useState("205");
  const [height, setHeight] = useState("55");
  const [rim, setRim] = useState("16");
  const [loadIndex, setLoadIndex] = useState("91");
  const [speedIndex, setSpeedIndex] = useState("V");
  const [brand, setBrand] = useState("Michelin");

  const [selectedSites, setSelectedSites] = useState<string[]>(SITES.map((s) => s.key));
  const [useMock, setUseMock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<TyreOffer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sizeText = `${width}/${height} R${rim} ${loadIndex}${speedIndex}`;

  const cheapestPrice = useMemo(() => {
    if (!offers.length) return undefined;
    return Math.min(...offers.map((o) => o.price));
  }, [offers]);

  const handleSiteToggle = (key: string) => {
    setSelectedSites((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  async function fetchOffers() {
    setLoading(true);
    setError(null);
    try {
      if (useMock) {
        await new Promise((r) => setTimeout(r, 500));
        const allowedHosts = SITES.filter(s => selectedSites.includes(s.key)).map(s => s.host);
        setOffers(MOCK.filter((m) => allowedHosts.includes(m.site)));
      } else {
        const params = new URLSearchParams({
          width,
          height,
          rim,
          loadIndex,
          speedIndex,
          brand,
          sites: selectedSites.join(","),
        });
        const res = await fetch(`/offers/search?${params.toString()}`);
        if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
        const data: TyreOffer[] = await res.json();
        setOffers(data);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Beklenmedik bir hata oluştu";
      setError(message);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }

  const sortedOffers = useMemo(() => {
    const list = [...offers];
    list.sort((a, b) => (sortAsc ? a.price - b.price : b.price - a.price));
    return list;
  }, [offers, sortAsc]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lastik Fiyat Karşılaştırma</h1>
          <div className="text-sm opacity-75">{new Date().toLocaleString()}</div>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          <section className="md:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl">
            <h2 className="font-semibold mb-4">Arama Kriterleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs mb-1">Genişlik</label>
                <input value={width} onChange={(e) => setWidth(e.target.value)} className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="205" />
              </div>
              <div>
                <label className="block text-xs mb-1">Yükseklik</label>
                <input value={height} onChange={(e) => setHeight(e.target.value)} className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="55" />
              </div>
              <div>
                <label className="block text-xs mb-1">Jant</label>
                <input value={rim} onChange={(e) => setRim(e.target.value)} className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="16" />
              </div>
              <div>
                <label className="block text-xs mb-1">Yük End.</label>
                <input value={loadIndex} onChange={(e) => setLoadIndex(e.target.value)} className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="91" />
              </div>
              <div>
                <label className="block text-xs mb-1">Hız End.</label>
                <input value={speedIndex} onChange={(e) => setSpeedIndex(e.target.value)} className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="V" />
              </div>
              <div>
                <label className="block text-xs mb-1">Marka (ops.)</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Michelin" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs mb-2">Siteler</div>
              <div className="flex flex-wrap gap-2">
                {SITES.map((s) => (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => handleSiteToggle(s.key)}
                    className={
                      "px-3 py-1.5 rounded-2xl border text-sm transition " +
                      (selectedSites.includes(s.key)
                        ? "bg-blue-600/20 border-blue-500 text-blue-200"
                        : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-800/80")
                    }
                    title={s.label}
                  >
                    {selectedSites.includes(s.key) ? "✓ " : ""}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col md:flex-row gap-3 items-start md:items-center">
              <button onClick={fetchOffers} disabled={loading || selectedSites.length === 0} className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-5 py-2 font-medium shadow-lg">
                {loading ? "Aranıyor..." : "Tüm Sitelerde Ara"}
              </button>

              <button onClick={() => downloadCSV(`prices_${sizeText}.csv`, sortedOffers)} disabled={!offers.length} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-4 py-2 font-medium shadow-lg">
                CSV İndir
              </button>

              <label className="flex items-center gap-2 text-sm select-none">
                <input type="checkbox" checked={useMock} onChange={(e) => setUseMock(e.target.checked)} />
                Mock veriyi kullan (demo)
              </label>

              <div className="text-sm opacity-70">Ölçü: <span className="font-mono">{sizeText}</span></div>
            </div>

            {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
          </section>

          <aside className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl">
            <h2 className="font-semibold mb-3">Özet</h2>
            <ul className="space-y-2 text-sm">
              <li>Seçili site sayısı: <b>{selectedSites.length}</b></li>
              <li>Bulunan teklif: <b>{offers.length}</b></li>
              <li>En uygun fiyat: <b>{cheapestPrice ? fmtPrice(cheapestPrice, offers[0]?.currency || "TRY") : "-"}</b></li>
            </ul>
          </aside>
        </div>

        <section className="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Sonuçlar</h2>
            <button onClick={() => setSortAsc((s) => !s)} disabled={!offers.length} className="text-sm rounded-lg border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800 disabled:opacity-60">
              Fiyata göre sırala: {sortAsc ? "Artan" : "Azalan"}
            </button>
          </div>

          {!offers.length && !loading && <div className="text-sm opacity-70">Henüz veri yok. Kriterleri girip arama yapın.</div>}
          {loading && <div className="py-10 text-center opacity-80">Arama yapılıyor, lütfen bekleyin…</div>}

          {!!offers.length && (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-800">
                  <th className="py-2 pr-3">Site</th>
                  <th className="py-2 pr-3">Marka</th>
                  <th className="py-2 pr-3">Desen</th>
                  <th className="py-2 pr-3">Ebat</th>
                  <th className="py-2 pr-3">Stok</th>
                  <th className="py-2 pr-3">Fiyat</th>
                  <th className="py-2 pr-3">Bağlantı</th>
                </tr>
              </thead>
              <tbody>
                {sortedOffers.map((o) => (
                  <tr key={`${o.site}-${o.url}`} className="border-b border-neutral-900/80 hover:bg-neutral-800/50">
                    <td className="py-2 pr-3 whitespace-nowrap">{o.site}</td>
                    <td className="py-2 pr-3">{o.brand}</td>
                    <td className="py-2 pr-3">{o.pattern}</td>
                    <td className="py-2 pr-3">{o.size}</td>
                    <td className="py-2 pr-3">{o.stock}</td>
                    <td className="py-2 pr-3 font-semibold">
                      <span className={cheapestPrice === o.price ? "px-2 py-0.5 rounded-lg bg-emerald-600/20 text-emerald-300" : ""}>{fmtPrice(o.price, o.currency)}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <a className="underline underline-offset-2 hover:no-underline" href={o.url} target="_blank" rel="noopener noreferrer">
                        Ürüne git
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="text-xs opacity-70 mt-6">
          Backend beklentisi: <code>/offers/search</code> endpoint'i; query string olarak
          <code> width,height,rim,loadIndex,speedIndex,brand,sites</code> alır ve
          <code>TyreOffer[]</code> döner.
        </footer>
      </div>
    </div>
  );
}
