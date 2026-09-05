import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function DashboardPendaftar() {
    const navigasi = useNavigate();

    // State dasar dari localStorage
    const [dataPengguna, setDataPengguna] = useState(null);

    // State baru untuk menyimpan data lengkap dari database (termasuk nilai)
    const [dataLengkap, setDataLengkap] = useState(null);

    const [menuAktif, setMenuAktif] = useState('akun');

    useEffect(() => {
        const sesi = localStorage.getItem('sesiPengguna');
        if (!sesi) {
            navigasi('/');
        } else {
            const sesiParsed = JSON.parse(sesi);
            setDataPengguna(sesiParsed);
            // Panggil fungsi untuk mengambil data nilai dari Supabase
            ambilDataTerbaru(sesiParsed.email);
        }
    }, [navigasi]);

    // Fungsi untuk menarik data nilai spesifik milik mahasiswa yang sedang login
    const ambilDataTerbaru = async (emailPengguna) => {
        const { data, error } = await supabase
            .from('pendaftar')
            .select('*')
            .eq('email', emailPengguna)
            .single();

        if (error) {
            console.error("Gagal mengambil data lengkap:", error);
        } else {
            setDataLengkap(data);
        }
    };

    const tanganiKeluar = () => {
        localStorage.removeItem('sesiPengguna');
        navigasi('/');
    };

    if (!dataPengguna || !dataLengkap) return null;

    const renderKonten = () => {
        switch (menuAktif) {
            case 'akun':
                return (
                    <>
                        <section style={gaya.kartuSambutan}>
                            <h2 style={gaya.judulSambutan}>Profil Akademik</h2>
                            <p style={gaya.deskripsiSambutan}>Kelola data pribadi dan pantau status awal pendaftaran Anda.</p>
                        </section>
                        <div style={gaya.gridInfo}>
                            <article style={gaya.kartuInfo}>
                                <h3 style={gaya.judulKartu}>Status Pendaftaran</h3>
                                <div style={gaya.statusWadah}>
                                    <div style={gaya.indikatorAktif}></div>
                                    <span style={gaya.teksStatus}>Berkas Terekam</span>
                                </div>
                                <p style={gaya.teksDetail}>Data Anda telah diverifikasi oleh sistem. Tahap selanjutnya adalah memantau jadwal Ujian Tulis dan Wawancara pada menu yang tersedia.</p>
                            </article>
                            <article style={gaya.kartuInfo}>
                                <h3 style={gaya.judulKartu}>Informasi Pribadi</h3>
                                <ul style={gaya.daftarInfo}>
                                    <li style={gaya.itemInfo}><span style={gaya.labelInfo}>Nama Lengkap:</span><span style={gaya.nilaiInfo}>{dataLengkap.nama}</span></li>
                                    <li style={gaya.itemInfo}><span style={gaya.labelInfo}>Nomor Induk Mahasiswa:</span><span style={gaya.nilaiInfo}>{dataLengkap.nim}</span></li>
                                    <li style={gaya.itemInfo}><span style={gaya.labelInfo}>Alamat Email:</span><span style={gaya.nilaiInfo}>{dataLengkap.email}</span></li>
                                </ul>
                            </article>
                        </div>
                    </>
                );

            case 'ujian_tulis':
                return (
                    <article style={gaya.kartuInfoUtama}>
                        <h3 style={gaya.judulKartu}>Ujian Tulis Kompetensi</h3>
                        <p style={gaya.teksDetail}>Ujian tulis mencakup materi dasar Perangkat Keras, Topologi Jaringan Komputer, dan Troubleshooting dasar. Waktu pengerjaan dialokasikan selama 60 menit.</p>

                        <div style={gaya.kotakAksiAktif}>
                            <p style={{ margin: '0 0 15px 0', color: '#e2e8f0', fontSize: '14px' }}>
                                Status Ujian: <b style={{ color: '#34d399' }}>Tersedia</b>
                            </p>
                            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                                Silakan klik tombol di bawah ini untuk memulai ujian tulis. Pastikan koneksi internet Anda stabil. Ujian akan dilakukan melalui platform Google Forms.
                            </p>
                            <a href="https://forms.gle/HxAJd4DLwFUFQ7mv7/" target="_blank" rel="noopener noreferrer" style={gaya.tombolMulaiUjian}>
                                Buka Lembar Ujian (Google Form)
                            </a>
                        </div>
                    </article>
                );

            case 'wawancara':
                return (
                    <article style={gaya.kartuInfoUtama}>
                        <h3 style={gaya.judulKartu}>Jadwal Wawancara</h3>
                        <p style={gaya.teksDetail}>Sesi wawancara akan dilakukan secara tatap muka dengan koordinator laboratorium dan asisten senior. Pastikan Anda hadir tepat waktu dengan pakaian rapi.</p>
                        <div style={gaya.kotakAksi}>
                            <ul style={gaya.daftarInfo}>
                                <li style={gaya.itemInfo}><span style={gaya.labelInfo}>Tanggal Ujian:</span><span style={gaya.nilaiInfo}>Menunggu Keputusan Penguji</span></li>
                                <li style={gaya.itemInfo}><span style={gaya.labelInfo}>Ruang/Lokasi:</span><span style={gaya.nilaiInfo}>Lab Hardware & Jaringan (Gedung B)</span></li>
                            </ul>
                        </div>
                    </article>
                );

            case 'hasil':
                // Menentukan warna teks berdasarkan status kelulusan
                const warnaStatus = dataLengkap.status_kelulusan === 'LULUS' ? '#34d399' :
                    dataLengkap.status_kelulusan === 'TIDAK LULUS' ? '#f87171' : '#fed7aa';

                return (
                    <article style={gaya.kartuInfoUtama}>
                        <h3 style={gaya.judulKartu}>Hasil Seleksi Akhir</h3>
                        <p style={gaya.teksDetail}>Berikut adalah akumulasi nilai dari seluruh tahapan seleksi yang telah Anda selesaikan.</p>
                        <div style={gaya.gridInfo}>
                            <div style={gaya.kotakNilai}>
                                <span style={gaya.labelInfo}>Nilai Ujian Tulis</span>
                                <h4 style={gaya.angkaNilai}>{dataLengkap.nilai_tulis || 0}</h4>
                            </div>
                            <div style={gaya.kotakNilai}>
                                <span style={gaya.labelInfo}>Nilai Wawancara</span>
                                <h4 style={gaya.angkaNilai}>{dataLengkap.nilai_wawancara || 0}</h4>
                            </div>
                        </div>

                        {/* Menampilkan catatan penguji jika ada */}
                        {dataLengkap.catatan && (
                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e293b', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <span style={gaya.labelInfo}>Catatan Penguji:</span>
                                <p style={{ margin: '5px 0 0 0', color: '#e2e8f0', fontSize: '14px', fontStyle: 'italic' }}>"{dataLengkap.catatan}"</p>
                            </div>
                        )}

                        <div style={gaya.kotakStatusAkhir}>
                            <span style={{ fontSize: '14px', color: '#fdba74' }}>Status Kelulusan Anda</span>
                            <h3 style={{ margin: '5px 0 0 0', color: warnaStatus, fontSize: '24px', fontWeight: 'bold' }}>
                                {dataLengkap.status_kelulusan || 'PENDING'}
                            </h3>
                        </div>
                    </article>
                );

            case 'info_lab':
                return (
                    <article style={gaya.kartuInfoUtama}>
                        <h3 style={gaya.judulKartu}>Informasi Laboratorium</h3>
                        <p style={gaya.teksDetail}>Laboratorium Perangkat Keras dan Jaringan adalah infrastruktur pusat bagi mahasiswa untuk melaksanakan praktikum terkait perakitan komputer, manajemen server, dan instalasi topologi jaringan.</p>
                        <ul style={{ ...gaya.daftarInfo, marginTop: '20px' }}>
                            <li style={gaya.itemInfo}><span style={gaya.labelInfo}>Mata Kuliah Terkait:</span><span style={gaya.nilaiInfo}>Jaringan Komputer, Arsitektur Komputer, Sistem Operasi</span></li>
                            <li style={gaya.itemInfo}><span style={gaya.labelInfo}>Tugas Utama Asisten:</span><span style={gaya.nilaiInfo}>Mendampingi praktikan, memelihara perangkat lab, mengevaluasi modul mingguan.</span></li>
                        </ul>
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
                    <h1 style={gaya.logo}>Portal Seleksi</h1>
                    <span style={gaya.subtitleLogo}>Lab Hardware & Jaringan</span>
                </div>

                <nav style={gaya.menuNavigasi}>
                    <button style={menuAktif === 'akun' ? gaya.menuAktif : gaya.menuItem} onClick={() => setMenuAktif('akun')}>Akun & Profil</button>
                    <button style={menuAktif === 'ujian_tulis' ? gaya.menuAktif : gaya.menuItem} onClick={() => setMenuAktif('ujian_tulis')}>Ujian Tulis</button>
                    <button style={menuAktif === 'wawancara' ? gaya.menuAktif : gaya.menuItem} onClick={() => setMenuAktif('wawancara')}>Wawancara</button>
                    <button style={menuAktif === 'hasil' ? gaya.menuAktif : gaya.menuItem} onClick={() => setMenuAktif('hasil')}>Hasil Seleksi</button>
                    <button style={menuAktif === 'info_lab' ? gaya.menuAktif : gaya.menuItem} onClick={() => setMenuAktif('info_lab')}>Informasi Lab</button>
                </nav>

                <div style={gaya.footerSidebar}>
                    <p style={gaya.teksProfil}>{dataPengguna.nama}</p>
                    <button onClick={tanganiKeluar} style={gaya.tombolKeluar}>Keluar Sistem</button>
                </div>
            </aside>

            <main style={gaya.areaKonten}>
                <div style={gaya.pembungkusKonten}>
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
    subtitleLogo: { fontSize: '13px', color: '#3b82f6', fontWeight: '600' },
    menuNavigasi: { display: 'flex', flexDirection: 'column', padding: '24px 16px', flex: 1, gap: '8px' },
    menuItem: { padding: '14px 16px', backgroundColor: 'transparent', color: '#a3a3a3', border: 'none', borderRadius: '8px', textAlign: 'left', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    menuAktif: { padding: '14px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', textAlign: 'left', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
    footerSidebar: { padding: '24px', borderTop: '1px solid #262626' },
    teksProfil: { fontSize: '14px', fontWeight: '500', margin: '0 0 12px 0', color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis' },
    tombolKeluar: { width: '100%', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    areaKonten: { flex: 1, overflowY: 'auto' },
    pembungkusKonten: { maxWidth: '900px', margin: '0 auto', padding: '50px 40px' },
    kartuSambutan: { backgroundColor: '#1e3a8a', padding: '30px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #1e40af' },
    judulSambutan: { margin: '0 0 10px 0', fontSize: '24px', color: '#ffffff' },
    deskripsiSambutan: { margin: 0, color: '#bfdbfe', fontSize: '15px', lineHeight: '1.6' },
    gridInfo: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    kartuInfo: { backgroundColor: '#171717', padding: '24px', borderRadius: '12px', border: '1px solid #262626' },
    kartuInfoUtama: { backgroundColor: '#171717', padding: '40px', borderRadius: '12px', border: '1px solid #262626', minHeight: '60vh' },
    judulKartu: { margin: '0 0 20px 0', fontSize: '20px', color: '#ffffff', borderBottom: '1px solid #262626', paddingBottom: '16px' },
    statusWadah: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', backgroundColor: '#064e3b', padding: '10px 16px', borderRadius: '8px', width: 'fit-content' },
    indikatorAktif: { width: '10px', height: '10px', backgroundColor: '#34d399', borderRadius: '50%' },
    teksStatus: { color: '#34d399', fontWeight: '600', fontSize: '14px' },
    teksDetail: { fontSize: '15px', color: '#a3a3a3', lineHeight: '1.7', margin: 0 },
    daftarInfo: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' },
    itemInfo: { display: 'flex', flexDirection: 'column', gap: '6px' },
    labelInfo: { fontSize: '13px', color: '#737373', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    nilaiInfo: { fontSize: '15px', color: '#e5e5e5', fontWeight: '500' },
    kotakAksi: { marginTop: '25px', padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' },
    kotakAksiAktif: { marginTop: '25px', padding: '25px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #3b82f6' },
    tombolMulaiUjian: { display: 'inline-block', padding: '12px 24px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
    kotakNilai: { padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' },
    angkaNilai: { margin: '10px 0 0 0', fontSize: '32px', color: '#f8fafc' },
    kotakStatusAkhir: { marginTop: '24px', padding: '20px', backgroundColor: '#451a03', borderRadius: '8px', border: '1px solid #78350f', textAlign: 'center' }
};