import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Form Mahasiswa
  const [formMhs, setFormMhs] = useState({ nim: '', nama: '', no_hp: '', email: '', id_dpa: '' });
  
  // State Form Dosen
  const [formDosen, setFormDosen] = useState({ nip: '', nama: '', no_hp: '', email: '' });

  const API_URL = "https://sistem-krs-topsus-production.up.railway.app";

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resMhs, resDosen] = await Promise.all([
        fetch(`${API_URL}/mahasiswa/`),
        fetch(`${API_URL}/dosen/`)
      ]);
      const dataMhs = await resMhs.json();
      const dataDosen = await resDosen.json();
      setMahasiswa(Array.isArray(dataMhs) ? dataMhs : []);
      setDosen(Array.isArray(dataDosen) ? dataDosen : []);
    } catch (err) { console.error("Error:", err); } 
    finally { setLoading(false); }
  };

  // Submit Dosen
  const handleSubmitDosen = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/dosen/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDosen),
      });
      if (res.ok) {
        alert("Dosen berhasil ditambah!");
        setFormDosen({ nip: '', nama: '', no_hp: '', email: '' });
        fetchInitialData();
      }
    } catch (err) { alert("Gagal simpan dosen"); }
  };

  // Submit Mahasiswa
  const handleSubmitMhs = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/mahasiswa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formMhs, id_dpa: parseInt(formMhs.id_dpa) }),
      });
      if (res.ok) {
        alert("Mahasiswa berhasil ditambah!");
        setFormMhs({ nim: '', nama: '', no_hp: '', email: '', id_dpa: '' });
        fetchInitialData();
      }
    } catch (err) { alert("Gagal simpan mahasiswa"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-700">Sistem Pemetaan DPA</h1>
          <p className="text-slate-500 uppercase tracking-widest text-sm font-semibold">Teknologi Informasi • Universitas Udayana</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Form Dosen */}
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="font-bold mb-4 text-indigo-600 border-b pb-2 text-sm uppercase">Tambah Dosen</h2>
              <form onSubmit={handleSubmitDosen} className="space-y-3">
                <input name="nip" value={formDosen.nip} onChange={(e) => setFormDosen({...formDosen, nip: e.target.value})} className="w-full p-2 text-sm border rounded" placeholder="NIP" required />
                <input name="nama" value={formDosen.nama} onChange={(e) => setFormDosen({...formDosen, nama: e.target.value})} className="w-full p-2 text-sm border rounded" placeholder="Nama Dosen" required />
                <input name="no_hp" value={formDosen.no_hp} onChange={(e) => setFormDosen({...formDosen, no_hp: e.target.value})} className="w-full p-2 text-sm border rounded" placeholder="No HP" required />
                <input name="email" value={formDosen.email} onChange={(e) => setFormDosen({...formDosen, email: e.target.value})} className="w-full p-2 text-sm border rounded" placeholder="Email" required />
                <button className="w-full bg-emerald-600 text-white py-2 rounded text-sm font-bold">Simpan Dosen</button>
              </form>
            </section>

            {/* Form Mahasiswa */}
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="font-bold mb-4 text-indigo-600 border-b pb-2 text-sm uppercase">Tambah Mahasiswa</h2>
              <form onSubmit={handleSubmitMhs} className="space-y-3">
                <input name="nim" value={formMhs.nim} onChange={(e) => setFormMhs({...formMhs, nim: e.target.value})} className="w-full p-2 text-sm border rounded" placeholder="NIM" required />
                <input name="nama" value={formMhs.nama} onChange={(e) => setFormMhs({...formMhs, nama: e.target.value})} className="w-full p-2 text-sm border rounded" placeholder="Nama Mahasiswa" required />
                <input name="no_hp" value={formMhs.no_hp} onChange={(e) => setFormMhs({...formMhs, no_hp: e.target.value})} className="w-full p-2 text-sm border rounded" placeholder="No HP" required />
                <input name="email" value={formMhs.email} onChange={(e) => setFormMhs({...formMhs, email: e.target.value})} className="w-full p-2 text-sm border rounded" placeholder="Email" required />
                <select name="id_dpa" value={formMhs.id_dpa} onChange={(e) => setFormMhs({...formMhs, id_dpa: e.target.value})} className="w-full p-2 text-sm border rounded bg-white" required>
                  <option value="">-- Pilih DPA --</option>
                  {dosen.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
                <button className="w-full bg-indigo-600 text-white py-2 rounded text-sm font-bold">Simpan Mahasiswa</button>
              </form>
            </section>
          </div>

          {/* Section Tabel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-indigo-50 border-b flex justify-between items-center">
                <h2 className="font-bold text-slate-700 text-sm">Daftar Mahasiswa & DPA</h2>
                <span className="text-xs font-bold bg-indigo-200 px-2 py-1 rounded">Total: {mahasiswa.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-3 text-center">Nama Mahasiswa</th>
                      <th className="px-6 py-3 text-center">Kontak Mahasiswa</th>
                      <th className="px-6 py-3 text-center">Dosen Pembimbing (DPA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      <tr><td colSpan="3" className="p-10 text-center italic text-slate-400">Loading data...</td></tr>
                    ) : mahasiswa.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700 text-center">{m.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono text-center">{m.nim}</div>
                        </td>
                        <td className="px-6 py-4 text-[11px] text-center">
                          <div className="text-center">{m.no_hp}</div>
                          <div className="text-indigo-400 text-center">{m.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            {m.nama_dpa || "Belum Ada"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
