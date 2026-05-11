import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = "https://sistem-krs-topsus-production.up.railway.app";

function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, mahasiswa, dosen
  const [mahasiswa, setMahasiswa] = useState([]);
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal & Form
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // mhs_add, mhs_edit, dosen_add, dosen_edit
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resMhs, resDosen] = await Promise.all([
        fetch(`${API_URL}/mahasiswa/`),
        fetch(`${API_URL}/dosen/`)
      ]);
      setMahasiswa(await resMhs.json());
      setDosen(await resDosen.json());
    } catch (err) { console.error("Fetch Error:", err); }
    finally { setLoading(false); }
  };

  // --- LOGIKA CRUD ---
  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = modalType.includes('edit');
    const entity = modalType.includes('mhs') ? 'mahasiswa' : 'dosen';
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_URL}/${entity}/${currentData.id}` : `${API_URL}/${entity}/`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });
      if (res.ok) {
        alert("Data berhasil disimpan!");
        setShowModal(false);
        fetchInitialData();
      }
    } catch (err) { alert("Gagal menyimpan data"); }
  };

  const handleDelete = async (entity, id) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await fetch(`${API_URL}/${entity}/${id}`, { method: 'DELETE' });
      fetchInitialData();
    } catch (err) { alert("Gagal menghapus data"); }
  };

  const openModal = (type, data = null) => {
    setModalType(type);
    setCurrentData(data || (type.includes('mhs') 
      ? { nim: '', nama: '', no_hp: '', email: '', id_dpa: '' } 
      : { nip: '', nama: '', no_hp: '', email: '' }));
    setShowModal(true);
  };

  // --- KOMPONEN UI ---
  const Sidebar = () => (
    <div className="w-64 bg-indigo-900 text-white min-h-screen p-6 hidden md:block">
      <h2 className="text-2xl font-bold mb-10 border-b border-indigo-700 pb-4">KRS Admin</h2>
      <nav className="space-y-4">
        <button onClick={() => setActiveTab('home')} className={`w-full text-left p-3 rounded ${activeTab === 'home' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}>
          <i className="fa-solid fa-house mr-3"></i> Home
        </button>
        <button onClick={() => setActiveTab('mahasiswa')} className={`w-full text-left p-3 rounded ${activeTab === 'mahasiswa' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}>
          <i className="fa-solid fa-user-graduate mr-3"></i> Mahasiswa
        </button>
        <button onClick={() => setActiveTab('dosen')} className={`w-full text-left p-3 rounded ${activeTab === 'dosen' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}>
          <i className="fa-solid fa-chalkboard-user mr-3"></i> Dosen
        </button>
      </nav>
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard Ringkasan</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-indigo-600">
                <div className="text-slate-500 font-bold uppercase text-sm">Total Mahasiswa</div>
                <div className="text-5xl font-black mt-2 text-indigo-900">{mahasiswa.length}</div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-emerald-500">
                <div className="text-slate-500 font-bold uppercase text-sm">Total Dosen DPA</div>
                <div className="text-5xl font-black mt-2 text-emerald-700">{dosen.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'home' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold capitalize">Daftar {activeTab}</h1>
              <button onClick={() => openModal(`${activeTab === 'mahasiswa' ? 'mhs_add' : 'dosen_add'}`)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">
                + Tambah {activeTab}
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="p-4">Identitas</th>
                    <th className="p-4">Kontak</th>
                    <th className="p-4">{activeTab === 'mahasiswa' ? 'Pembimbing' : 'Status'}</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(activeTab === 'mahasiswa' ? mahasiswa : dosen).map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold">{item.nama}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.nim || item.nip}</div>
                      </td>
                      <td className="p-4 text-sm">
                        <div>{item.no_hp}</div>
                        <div className="text-indigo-400">{item.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          {activeTab === 'mahasiswa' ? (item.nama_dpa || "N/A") : "Aktif"}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button onClick={() => openModal(activeTab === 'mahasiswa' ? 'mhs_edit' : 'dosen_edit', item)} className="text-indigo-600 hover:text-indigo-900"><i className="fa-solid fa-pen-to-square"></i></button>
                        <button onClick={() => handleDelete(activeTab, item.id)} className="text-rose-500 hover:text-rose-800"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">{modalType.includes('add') ? 'Tambah' : 'Edit'} Data</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={currentData.nama} onChange={(e) => setCurrentData({...currentData, nama: e.target.value})} placeholder="Nama Lengkap" className="w-full p-3 border rounded-lg outline-indigo-500" required />
              <input value={currentData.nim || currentData.nip} onChange={(e) => setCurrentData({...currentData, [modalType.includes('mhs') ? 'nim' : 'nip']: e.target.value})} placeholder={modalType.includes('mhs') ? "NIM" : "NIP"} className="w-full p-3 border rounded-lg outline-indigo-500" required />
              <input value={currentData.no_hp} onChange={(e) => setCurrentData({...currentData, no_hp: e.target.value})} placeholder="No. HP" className="w-full p-3 border rounded-lg outline-indigo-500" required />
              <input value={currentData.email} onChange={(e) => setCurrentData({...currentData, email: e.target.value})} type="email" placeholder="Email" className="w-full p-3 border rounded-lg outline-indigo-500" required />
              
              {modalType.includes('mhs') && (
                <select value={currentData.id_dpa} onChange={(e) => setCurrentData({...currentData, id_dpa: e.target.value})} className="w-full p-3 border rounded-lg bg-white outline-indigo-500" required>
                  <option value="">Pilih Dosen DPA</option>
                  {dosen.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 rounded-lg font-bold">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
