import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = "https://sistem-krs-topsus-production.up.railway.app";

function App() {
  // State Autentikasi
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(''); // admin, dosen, mahasiswa
  const [username, setUsername] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [userLinkId, setUserLinkId] = useState('');

  // State Data Dashboard
  const [activeTab, setActiveTab] = useState('home'); // home, mahasiswa, dosen
  const [mahasiswa, setMahasiswa] = useState([]);
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State Modals & Form CRUD (Khusus Admin)
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // mhs_add, mhs_edit, dosen_add, dosen_edit
  const [currentData, setCurrentData] = useState(null);

  // Cek session saat pertama kali web dibuka
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const savedUser = localStorage.getItem('username');
    const savedLinkId = localStorage.getItem('link_id'); // <--- Baca link_id
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUsername(savedUser || '');
      setUserLinkId(savedLinkId || ''); // <--- Set ke state
      fetchInitialData();
    }
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const resMhs = await fetch(`${API_URL}/mahasiswa/`);
      const resDosen = await fetch(`${API_URL}/dosen/`);
      const dataMhs = await resMhs.json();
      const dataDosen = await resDosen.json();
      
      setMahasiswa(Array.isArray(dataMhs) ? dataMhs : []);
      setDosen(Array.isArray(dataDosen) ? dataDosen : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- LOGIKA AUTHENTICATION ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // FastAPI menerima data login dalam format form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', loginData.username);
        localStorage.setItem('link_id', data.link_id); // <--- Simpan link_id ke storage
        
        setIsLoggedIn(true);
        setUserRole(data.role);
        setUsername(loginData.username);
        setUserLinkId(data.link_id); // <--- Set ke state
        setLoginData({ username: '', password: '' });
        fetchInitialData();
      } else {
        alert(data.detail || "Gagal Login, periksa akun Anda.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi saat login.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('');
    setUsername('');
    setActiveTab('home');
  };

  // --- LOGIKA CRUD (Hanya Dieksekusi Admin) ---
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

  // --- SCREEN 1: HALAMAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-indigo-700">Sistem KRS TI</h1>
            <p className="text-slate-400 text-sm mt-1">Universitas Udayana Portal Terintegrasi</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Username</label>
              <input value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Masukkan username" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
              <input type="password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-md">
              Masuk Ke Sistem
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: MAIN DASHBOARD DENGAN RBAC MATRIKS ---
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 bg-indigo-900 text-white min-h-screen p-6 hidden md:block">
        <div className="mb-8 border-b border-indigo-700 pb-4">
          <h2 className="text-2xl font-bold">KRS Admin</h2>
          <div className="mt-2 text-xs bg-indigo-800 px-3 py-1 rounded inline-block uppercase font-bold text-emerald-400 tracking-wider">
            Role: {userRole}
          </div>
        </div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('home')} className={`w-full text-left p-3 rounded flex items-center ${activeTab === 'home' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}>
            Home
          </button>
          
          {/* SEMUA ROLE BISA LIHAT HALAMAN DAFTAR DOSEN */}
          <button onClick={() => setActiveTab('dosen')} className={`w-full text-left p-3 rounded flex items-center ${activeTab === 'dosen' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}>
            Daftar Dosen
          </button>

          {/* HANYA ADMIN DAN DOSEN YANG BISA LIHAT TAB DAFTAR MAHASISWA */}
          {(userRole === 'admin' || userRole === 'dosen') && (
            <button onClick={() => setActiveTab('mahasiswa')} className={`w-full text-left p-3 rounded flex items-center ${activeTab === 'mahasiswa' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}>
              Daftar Mahasiswa
            </button>
          )}

          <button onClick={handleLogout} className="w-full text-left p-3 rounded flex items-center text-rose-300 hover:bg-rose-950/30 mt-20">
            Keluar (Logout)
          </button>
        </nav>
      </div>

      {/* WORKSPACE AREA */}
      <main className="flex-1 p-6 md:p-10">
        
        {/* TAB 1: HOME PANEL */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h1 className="text-2xl font-bold text-slate-800">Selamat Datang kembali, <span className="text-indigo-600 capitalize">{username}</span>!</h1>
              <p className="text-slate-400 mt-1">Sistem informasi pemetaan Relasi Dosen Pembimbing Akademik.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-indigo-600">
                <div className="text-slate-500 font-bold uppercase text-xs">Total Mahasiswa Terdaftar</div>
                <div className="text-4xl font-black mt-2 text-indigo-900">{mahasiswa.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-emerald-500">
                <div className="text-slate-500 font-bold uppercase text-xs">Total Dosen Akademik</div>
                <div className="text-4xl font-black mt-2 text-emerald-700">{dosen.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 & 3: KONTEN MAHASISWA DAN DOSEN BERBASIS RBAC */}
        {activeTab !== 'home' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold capitalize">Data {activeTab}</h1>
              
              {/* TOMBOL TAMBAH DATA BARU: HANYA MUNCUL JIKA USER ADALAH ADMIN */}
              {userRole === 'admin' && (
                <button onClick={() => openModal(`${activeTab === 'mahasiswa' ? 'mhs_add' : 'dosen_add'}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-md shadow-indigo-100">
                  + Tambah Data
                </button>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-500 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="p-4">Identitas Resmi</th>
                    <th className="p-4">Informasi Kontak</th>
                    <th className="p-4">{activeTab === 'mahasiswa' ? 'Pembimbing Akademik' : 'Status Relasi'}</th>
                    {/* FILTER KOLOM AKSI: HANYA DITAMPILKAN KE ADMIN */}
                    {userRole === 'admin' && <th className="p-4 text-center">Aksi Manajemen</th>}
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {loading ? (
                    <tr><td colSpan="4" className="p-8 text-center italic text-slate-400">Sedang memproses permintaan data...</td></tr>
                  ) : (
                    // PENYARINGAN DATA SESUAI PERMINTAAN ROLE
                    // Sekarang kita filter berdasarkan ID Dosen (id_dpa) yang cocok dengan link_id user yang login
                    (activeTab === 'mahasiswa' 
                      ? (userRole === 'dosen' 
                          ? mahasiswa.filter(m => m.id_dpa === Number(userLinkId)) 
                          : mahasiswa)
                      : dosen
                    ).map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{item.nama}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{item.nim || item.nip}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-semibold">{item.no_hp}</div>
                          <div className="text-xs text-indigo-500 font-mono mt-0.5">{item.email}</div>
                        </td>
                        <td className="p-4">
                          {activeTab === 'mahasiswa' ? (
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.nama_dpa === username ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 text-indigo-700'}`}>
                              {item.nama_dpa}
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">
                              {/* Mahasiswa bisa mendeteksi siapa pembimbingnya di list dosen */}
                              {userRole === 'mahasiswa' && mahasiswa.find(m => m.nim === username)?.id_dpa === item.id ? "DPA Kamu" : "Dosen Aktif"}
                            </span>
                          )}
                        </td>
                        
                        {/* AKSI EDIT DAN DELETE BUTTON: HANYA DI-RENDER UNTUK ADMIN */}
                        {userRole === 'admin' && (
                          <td className="p-4 text-center space-x-3 text-xs font-bold uppercase">
                            <button onClick={() => openModal(activeTab === 'mahasiswa' ? 'mhs_edit' : 'dosen_edit', item)} className="text-indigo-600 hover:underline">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(activeTab, item.id)} className="text-rose-500 hover:underline">
                              Hapus
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* POP-UP MODAL CRUD FORM: HANYA TERBUKA JIKA DI-TRIGGER ADMIN */}
      {showModal && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-5">{modalType.includes('add') ? 'Tambah' : 'Perbarui'} Data {activeTab}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input value={currentData.nama} onChange={(e) => setCurrentData({...currentData, nama: e.target.value})} placeholder="Nama Lengkap" className="w-full p-2.5 border rounded-lg text-sm" required />
              <input value={currentData.nim || currentData.nip} onChange={(e) => setCurrentData({...currentData, [activeTab === 'mahasiswa' ? 'nim' : 'nip']: e.target.value})} placeholder={activeTab === 'mahasiswa' ? "NIM Mahasiswa" : "NIP Dosen"} className="w-full p-2.5 border rounded-lg text-sm font-mono" required />
              <input value={currentData.no_hp} onChange={(e) => setCurrentData({...currentData, no_hp: e.target.value})} placeholder="Nomor Telepon" className="w-full p-2.5 border rounded-lg text-sm" required />
              <input value={currentData.email} onChange={(e) => setCurrentData({...currentData, email: e.target.value})} type="email" placeholder="Alamat Email Resmi" className="w-full p-2.5 border rounded-lg text-sm" required />
              
              {activeTab === 'mahasiswa' && (
                <select value={currentData.id_dpa} onChange={(e) => setCurrentData({...currentData, id_dpa: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm bg-white" required>
                  <option value="">-- Tetapkan Dosen DPA --</option>
                  {dosen.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
              )}

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
