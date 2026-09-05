import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function DashboardAdmin() {
    const navigasi = useNavigate();
    const [dataAdmin, setDataAdmin] = useState(null);
    const [menuAktif, setMenuAktif] = useState('daftar');

    // State untuk menyimpan data dari database
    const [daftarPendaftar, setDaftarPendaftar] = useState([]);

    // State untuk form penilaian
    const [formPenilaian, setFormPenilaian] = useState({
        id: '',
        nilai_tulis: 0,
        nilai_wawancara: 0,
        catatan: '',
        status_kelulusan: 'PENDING'
    });

    useEffect(() => {
        const sesi = localStorage.getItem('sesiPengguna');
        if (!sesi) {
            navigasi('/');
            return;
        }

        const sesiParsed = JSON.parse(sesi);
        if (sesiParsed.peran !== 'admin') {
            navigasi('/dashboard');
            return;
        }

        setDataAdmin(sesiParsed);
        ambilDataPendaftar();
    }, [navigasi]);

    const ambilDataPendaftar = async () => {
        const { data, error } = await supabase
            .from('pendaftar')
            .select('*')
            .neq('peran', 'admin') // Mengambil semua data selain admin
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Gagal mengambil data:", error);
        } else {
            setDaftarPendaftar(data);
        }
    };

    const tanganiKeluar = () => {
        localStorage.removeItem('sesiPengguna');
        navigasi('/');
    };

    const tanganiPerubahanForm = (e) => {
        setFormPenilaian({ ...formPenilaian, [e.target.name]: e.target.value });
    };

    const pilihPendaftarUntukDinilai = (e) => {
        const idTerpilih = e.target.value;
        const mhs = daftarPendaftar.find(p => p.id === idTerpilih);

        if (mhs) {
            setFormPenilaian({
                id: mhs.id,
                nilai_tulis: mhs.nilai_tulis || 0,
                nilai_wawancara: mhs.nilai_wawancara || 0,
                catatan: mhs.catatan || '',
                status_kelulusan: mhs.status_kelulusan || 'PENDING'
            });
        } else {
            setFormPenilaian({ id: '', nilai_tulis: 0, nilai_wawancara: 0, catatan: '', status_kelulusan: 'PENDING' });
        }
    };

    const simpanPenilaian = async (e) => {
        e.preventDefault();
        if (!formPenilaian.id) {
            return alert("Silakan pilih calon asisten terlebih dahulu.");
        }

        const { error } = await supabase
            .from('pendaftar')
            .update({
                nilai_tulis: parseInt(formPenilaian.nilai_tulis),
                nilai_wawancara: parseInt(formPenilaian.nilai_wawancara),
                catatan: formPenilaian.catatan,
                status_kelulusan: formPenilaian.status_kelulusan
            })
            .eq('id', formPenilaian.id);

        if (error) {
            alert("Gagal menyimpan data penilaian: " + error.message);
        } else {
            alert("Data penilaian berhasil diperbarui.");
            ambilDataPendaftar(); // Refresh data pada tabel
            setMenuAktif('daftar'); // Arahkan kembali ke tabel
        }
    };

    // Logika untuk menghapus data pendaftar
    const tanganiHapusPendaftar = async (id, nama) => {
        const konfirmasi = window.confirm(`Apakah Anda yakin ingin menghapus data ${nama} secara permanen?`);
        if (!konfirmasi) return;

        const { error } = await supabase
            .from('pendaftar')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Gagal menghapus data: " + error.message);
        } else {
            alert("Data berhasil dihapus dari basis data.");
            ambilDataPendaftar(); // Memperbarui tampilan tabel secara otomatis
        }
    };

    if (!dataAdmin) return null;

    const renderKonten = () => {
        switch (menuAktif) {
            case 'daftar':
                return (
                    <article style={gaya.kartuInfoUtama}>
                        <h3 style={gaya.judulKartu}>Daftar Calon Asisten</h3>
                        <div style={gaya.wadahTabel}>
                            <table style={gaya.tabel}>
                                <thead>
                                    <tr>
                                        <th style={gaya.th}>NIM</th>
                                        <th style={gaya.th}>Nama Lengkap</th>
                                        <th style={gaya.th}>Program Studi</th>
                                        <th style={gaya.th}>Nilai Tulis</th>
                                        <th style={gaya.th}>Wawancara</th>
                                        <th style={gaya.th}>Status</th>
                                        <th style={gaya.th}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {daftarPendaftar.length === 0 ? (
                                        <tr><td colSpan="7" style={gaya.tdTengah}>Belum ada pendaftar.</td></tr>
                                    ) : (
                                        daftarPendaftar.map((p) => (
                                            <tr key={p.id} style={gaya.tr}>
                                                <td style={gaya.td}>{p.nim}</td>
                                                <td style={gaya.td}>{p.nama}</td>
                                                <td style={gaya.td}>{p.prodi}</td>
                                                <td style={gaya.td}>{p.nilai_tulis || 0}</td>
                                                <td style={gaya.td}>{p.nilai_wawancara || 0}</td>
                                                <td style={gaya.td}>
                                                    <span style={p.status_kelulusan === 'LULUS' ? gaya.badgeLulus : p.status_kelulusan === 'TIDAK LULUS' ? gaya.badgeGagal : gaya.badgePending}>
                                                        {p.status_kelulusan || 'PENDING'}
                                                    </span>
                                                </td>
                                                <td style={gaya.td}>
                                                    <button
                                                        onClick={() => tanganiHapusPendaftar(p.id, p.nama)}
                                                        style={gaya.tombolHapusKecil}
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </article>
                );

            case 'penilaian':
                return (
                    <article style={gaya.kartuInfoUtama}>
                        <h3 style={gaya.judulKartu}>Formulir Evaluasi & Penilaian</h3>
                        <form onSubmit={simpanPenilaian} style={gaya.formulir}>
                            <div style={gaya.grupInput}>
                                <label style={gaya.labelInfo}>Pilih Calon Asisten</label>
                                <select style={gaya.input} value={formPenilaian.id} onChange={pilihPendaftarUntukDinilai} required>
                                    <option value="">-- Pilih Mahasiswa --</option>
                                    {daftarPendaftar.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nim} - {p.nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={gaya.gridInput}>
                                <div style={gaya.grupInput}>
                                    <label style={gaya.labelInfo}>Nilai Ujian Tulis (0-100)</label>
                                    <input type="number" name="nilai_tulis" min="0" max="100" style={gaya.input} value={formPenilaian.nilai_tulis} onChange={tanganiPerubahanForm} required />
                                </div>
                                <div style={gaya.grupInput}>
                                    <label style={gaya.labelInfo}>Nilai Wawancara (0-100)</label>
                                    <input type="number" name="nilai_wawancara" min="0" max="100" style={gaya.input} value={formPenilaian.nilai_wawancara} onChange={tanganiPerubahanForm} required />
                                </div>
                            </div>

                            <div style={gaya.grupInput}>
                                <label style={gaya.labelInfo}>Catatan Penguji</label>
                                <textarea name="catatan" rows="4" style={gaya.textarea} value={formPenilaian.catatan} onChange={tanganiPerubahanForm} placeholder="Kelebihan/Kekurangan teknis dan komunikasi..."></textarea>
                            </div>

                            <div style={gaya.grupInput}>
                                <label style={gaya.labelInfo}>Keputusan Akhir (Status Kelulusan)</label>
                                <select name="status_kelulusan" style={gaya.input} value={formPenilaian.status_kelulusan} onChange={tanganiPerubahanForm}>
                                    <option value="PENDING">PENDING (Belum Diputuskan)</option>
                                    <option value="LULUS">LULUS SELEKSI</option>
                                    <option value="TIDAK LULUS">TIDAK LULUS</option>
                                </select>
                            </div>

                            <button type="submit" style={gaya.tombolSimpan}>Simpan Penilaian Mahasiswa</button>
                        </form>
                    </article>
                );

            default:
                return null;
        }
    };

    return (
        <div style={gaya.tataLetak}>
            <aside style={gaya.sidebar}>
                <div style={gaya.headerSidebar}>
                    <h1 style={gaya.logo}>Portal Admin</h1>
                    <span style={gaya.subtitleLogo}>Evaluator Asisten Lab</span>
                </div>

                <nav style={gaya.menuNavigasi}>
                    <button style={menuAktif === 'daftar' ? gaya.menuAktif : gaya.menuItem} onClick={() => setMenuAktif('daftar')}>Data Calon Asisten</button>
                    <button style={menuAktif === 'penilaian' ? gaya.menuAktif : gaya.menuItem} onClick={() => setMenuAktif('penilaian')}>Input Penilaian</button>
                </nav>

                <div style={gaya.footerSidebar}>
                    <p style={gaya.teksProfil}>{dataAdmin.nama}</p>
                    <button onClick={tanganiKeluar} style={gaya.tombolKeluar}>Keluar Sistem</button>
                </div>
            </aside>

            <main style={gaya.areaKonten}>
                <div style={gaya.pembungkusKonten}>
                    <section style={gaya.kartuSambutan}>
                        <h2 style={gaya.judulSambutan}>Panel Penguji Seleksi</h2>
                        <p style={gaya.deskripsiSambutan}>Tinjau data pendaftar, kelola nilai ujian, dan tetapkan hasil akhir kelulusan asisten laboratorium.</p>
                    </section>
                    {renderKonten()}
                </div>
            </main>
        </div>
    );
}

const gaya = {
    tataLetak: { display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#e5e5e5' },
    sidebar: { width: '280px', backgroundColor: '#171717', borderRight: '1px solid #262626', display: 'flex', flexDirection: 'column' },
    headerSidebar: { padding: '30px 24px', borderBottom: '1px solid #262626' },
    logo: { fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: '0 0 5px 0' },
    subtitleLogo: { fontSize: '13px', color: '#f59e0b', fontWeight: '600' },
    menuNavigasi: { display: 'flex', flexDirection: 'column', padding: '24px 16px', flex: 1, gap: '8px' },
    menuItem: { padding: '14px 16px', backgroundColor: 'transparent', color: '#a3a3a3', border: 'none', borderRadius: '8px', textAlign: 'left', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    menuAktif: { padding: '14px 16px', backgroundColor: '#d97706', color: '#ffffff', border: 'none', borderRadius: '8px', textAlign: 'left', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
    footerSidebar: { padding: '24px', borderTop: '1px solid #262626' },
    teksProfil: { fontSize: '14px', fontWeight: '500', margin: '0 0 12px 0', color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis' },
    tombolKeluar: { width: '100%', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    areaKonten: { flex: 1, overflowY: 'auto' },
    pembungkusKonten: { maxWidth: '1000px', margin: '0 auto', padding: '50px 40px' },
    kartuSambutan: { backgroundColor: '#451a03', padding: '30px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #78350f' },
    judulSambutan: { margin: '0 0 10px 0', fontSize: '24px', color: '#ffffff' },
    deskripsiSambutan: { margin: 0, color: '#fcd34d', fontSize: '15px', lineHeight: '1.6' },
    kartuInfoUtama: { backgroundColor: '#171717', padding: '40px', borderRadius: '12px', border: '1px solid #262626', minHeight: '50vh' },
    judulKartu: { margin: '0 0 25px 0', fontSize: '20px', color: '#ffffff', borderBottom: '1px solid #262626', paddingBottom: '16px' },
    wadahTabel: { overflowX: 'auto' },
    tabel: { width: '100%', borderCollapse: 'collapse', textAlign: 'center' },
  th: { padding: '14px', borderBottom: '1px solid #404040', color: '#a3a3a3', fontSize: '14px', fontWeight: '600', textAlign: 'center' },
  td: { padding: '14px', borderBottom: '1px solid #262626', color: '#e5e5e5', fontSize: '14px', verticalAlign: 'middle', textAlign: 'center' }, 
    tdTengah: { padding: '20px', textAlign: 'center', color: '#737373', fontSize: '14px' },
    tr: { transition: 'background-color 0.2s' },
    badgePending: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#374151', color: '#d1d5db', padding: '8px 12px 6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', minWidth: '90px', lineHeight: '1' },
  badgeLulus: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#064e3b', color: '#34d399', padding: '8px 12px 6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', minWidth: '90px', lineHeight: '1' },
  badgeGagal: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7f1d1d', color: '#f87171', padding: '8px 12px 6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', minWidth: '90px', lineHeight: '1' },
    formulir: { display: 'flex', flexDirection: 'column', gap: '20px' },
    grupInput: { display: 'flex', flexDirection: 'column', gap: '8px' },
    gridInput: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    labelInfo: { fontSize: '14px', color: '#a3a3a3', fontWeight: '600' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #404040', backgroundColor: '#121212', color: '#ffffff', fontSize: '15px', outline: 'none' },
    textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #404040', backgroundColor: '#121212', color: '#ffffff', fontSize: '15px', outline: 'none', resize: 'vertical' },
    tombolSimpan: { padding: '14px', backgroundColor: '#d97706', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
    tombolHapusKecil: { padding: '6px 12px', backgroundColor: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }
};