import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    no_hp: '',
    email: '',
    id_dpa: ''
  });

  // Link Backend Railway
  const API_URL = "https://sistem-krs-topsus-production.up.railway.app";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resMhs, resDosen] = await Promise.all([
        fetch(`${API_URL}/mahasiswa/`),
        fetch(`${API_URL}/dosen/`)
      ]);
      
      const dataMhs = await resMhs.json();
      const dataDosen = await resDosen.json();
      
      // Pastikan data adalah array sebelum disimpan ke state
      setMahasiswa(Array.isArray(dataMhs) ? dataMhs : []);
      setDosen(Array.isArray(dataDosen) ? dataDosen : []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_dpa) return alert("Pilih Dosen Pembimbing terlebih dahulu!");

    try {
      const response = await fetch(`${API_URL}/mahasiswa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim: formData.nim,
          nama: formData.nama,
          no_hp: formData.no_hp,
          email: formData.email,
          id_dpa: parseInt(formData.id_dpa)
        }),
      });

      if (response.ok) {
        alert("Mahasiswa berhasil ditambahkan!");
        setFormData({ nim: '', nama: '', no_hp: '', email: '', id_dpa: '' });
        fetchInitialData(); // Refresh tabel
      } else {
        alert("Gagal menyimpan data. Periksa kembali inputan Anda.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">Sistem Pemetaan DPA</h1>
          <p className="mt-2 text-slate-500 uppercase tracking-widest text-sm font-semibold">Universitas Udayana • Teknologi Informasi</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Tambah Mahasiswa
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">NIM</label>
                <input name="nim" value={formData.nim} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all" placeholder="210555..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nama Lengkap</label>
                <input name="nama" value={formData.nama} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all" placeholder="Nama Mahasiswa" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">No. HP</label>
                <input name="no_hp" value={formData.no_hp} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all" placeholder="0812..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all" placeholder="email@student.unud.ac.id" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Dosen Pembimbing (DPA)</label>
                <select name="id_dpa" value={formData.id_dpa} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all" required>
                  <option value="">-- Pilih Dosen --</option>
                  {dosen.map(d => (
                    <option key={d.id} value={d.id}>{d.nama}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-200">
                Simpan Data
              </button>
            </form>
          </section>

          {/* Table Section */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">Daftar Mahasiswa Bimbingan</h2>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  Total: {mahasiswa.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Nama Mahasiswa</th>
                      <th className="px-6 py-4">NIM</th>
                      <th className="px-6 py-4">Kontak</th>
                      <th className="px-6 py-4">Pembimbing Akademik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">Memproses data...</td></tr>
                    ) : mahasiswa.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400">Belum ada data mahasiswa.</td></tr>
                    ) : mahasiswa.map((mhs) => (
                      <tr key={mhs.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">{mhs.nama}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-sm">{mhs.nim}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          <div>{mhs.no_hp}</div>
                          <div className="text-indigo-400">{mhs.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {mhs.nama_dpa || "Belum ditentukan"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>
      </div>
      
      <footer className="mt-20 text-center text-slate-400 text-sm">
        &copy; 2026 Alexa Paramitha - Tugas Akhir Sistem Informasi Terpadu
      </footer>
    </div>
  );
}

export default App;
