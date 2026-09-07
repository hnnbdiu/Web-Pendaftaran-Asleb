import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { supabase } from './supabaseClient';

export default function Login() {
    const navigasi = useNavigate();

    const [modeMasuk, setModeMasuk] = useState(true);
    const [formData, setFormData] = useState({ nama: '', nim: '', prodi: '', email: '', password: '' });

    // State transisi untuk pengguna Google baru
    const [tahapLanjutanGoogle, setTahapLanjutanGoogle] = useState(false);
    const [dataGoogleSementara, setDataGoogleSementara] = useState({ email: '', nama: '' });
    const [dataTambahan, setDataTambahan] = useState({ nim: '', prodi: '' });

    const daftarAkunPenguji = ['raihanunbadiu@gmail.com', 'aslab.senior@gmail.com'];

    const tanganiPerubahan = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const tanganiPerubahanTambahan = (e) => setDataTambahan({ ...dataTambahan, [e.target.name]: e.target.value });

    const prosesMasuk = (email, nama, peran) => {
        localStorage.setItem('sesiPengguna', JSON.stringify({ email, nama, peran }));
        navigasi(peran === 'admin' ? '/admin-portal' : '/ujian');
    };

    // --- LOGIKA GOOGLE SSO DENGAN SUPABASE ---
    const tanganiSuksesGoogle = async (credentialResponse) => {
        try {
            const profil = jwtDecode(credentialResponse.credential);
            const email = profil.email;

            if (daftarAkunPenguji.includes(email)) {
                return prosesMasuk(email, profil.name, 'admin');
            }

            // Cek ke Database Supabase
            const { data: akunTerdaftar, error } = await supabase
                .from('pendaftar')
                .select('*')
                .eq('email', email)
                .single();

            if (akunTerdaftar) {
                prosesMasuk(email, akunTerdaftar.nama, akunTerdaftar.peran || 'pendaftar');
            } else {
                // Jika belum ada di database cloud, minta data tambahan
                setDataGoogleSementara({ email: profil.email, nama: profil.name });
                setTahapLanjutanGoogle(true);
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat memproses data Google.");
        }
    };

    // Simpan data tambahan pengguna Google ke Supabase
    const tanganiSimpanDataGoogle = async (e) => {
        e.preventDefault();
        if (!dataTambahan.nim || !dataTambahan.prodi) {
            return alert("NIM dan Program Studi wajib diisi.");
        }
        if (dataTambahan.prodi.toLowerCase().trim() !== 'teknik informatika') {
            return alert("Pendaftaran asisten lab hanya untuk mahasiswa Teknik Informatika.");
        }

        const { error } = await supabase.from('pendaftar').insert([
            {
                nama: dataGoogleSementara.nama,
                email: dataGoogleSementara.email,
                nim: dataTambahan.nim,
                prodi: dataTambahan.prodi,
                peran: 'pendaftar'
            }
        ]);

        if (error) {
            alert("Gagal menyimpan ke database: " + error.message);
            return;
        }

        alert("Registrasi Supabase berhasil.");
        prosesMasuk(dataGoogleSementara.email, dataGoogleSementara.nama, 'pendaftar');
    };

    // --- LOGIKA REGISTRASI MANUAL KE SUPABASE ---
    const tanganiDaftar = async (e) => {
        e.preventDefault();
        if (!formData.nama || !formData.nim || !formData.prodi || !formData.email || !formData.password) {
            return alert("Isi seluruh kolom pendaftaran.");
        }
        if (formData.prodi.toLowerCase().trim() !== 'teknik informatika') {
            return alert("Pendaftaran asisten lab hanya untuk mahasiswa Teknik Informatika.");
        }

        const { error } = await supabase.from('pendaftar').insert([
            {
                nama: formData.nama,
                nim: formData.nim,
                prodi: formData.prodi,
                email: formData.email,
                peran: 'pendaftar'
            }
        ]);

        if (error) {
            alert("Gagal mendaftar (Kemungkinan email sudah terdaftar): " + error.message);
            return;
        }

        alert("Registrasi manual berhasil disimpan ke database cloud.");
        prosesMasuk(formData.email, formData.nama, 'pendaftar');
    };

    // --- LOGIKA LOGIN MANUAL ---
    const tanganiMasuk = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return alert("Email dan kata sandi wajib diisi.");

        if (formData.email === 'admin' && formData.password === 'rahasia123') {
            return prosesMasuk('admin@sistem.local', 'Admin Lokal', 'admin');
        }

        const { data: pengguna, error } = await supabase
            .from('pendaftar')
            .select('*')
            .eq('email', formData.email)
            .single();

        if (pengguna) {
            prosesMasuk(pengguna.email, pengguna.nama, pengguna.peran || 'pendaftar');
        } else {
            alert("Akun tidak ditemukan di database cloud.");
        }
    };

    if (tahapLanjutanGoogle) {
        return (
            <div style={gaya.latarBelakang}>
                <div style={gaya.kartu} className="responsive-login-card">
                    <h1 className="text-2xl font-bold text-center mb-4">
                        Pendaftaran Asisten Laboratorium
                    </h1>
                    <h2 style={gaya.judul}>Selesaikan Pendaftaran</h2>
                    <p style={gaya.subjudul}>Data dasar ditarik dari Google. Lengkapi data akademik Anda ke database cloud.</p>
                    <form onSubmit={tanganiSimpanDataGoogle} style={gaya.formulir}>
                        {/* Input Nama sekarang bisa diedit manual oleh pendaftar */}
                        <input
                            type="text"
                            value={dataGoogleSementara.nama}
                            onChange={(e) => setDataGoogleSementara({ ...dataGoogleSementara, nama: e.target.value })}
                            style={gaya.input}
                            required
                        />

                        {/* Email tetap dikunci agar sinkronisasi SSO tidak rusak */}
                        <input
                            type="email"
                            value={dataGoogleSementara.email}
                            readOnly
                            style={{ ...gaya.input, backgroundColor: '#1a1a1a', color: '#737373', cursor: 'not-allowed' }}
                        />

                        <input type="text" name="nim" placeholder="NIM" onChange={tanganiPerubahanTambahan} style={gaya.input} required />
                        <input type="text" name="prodi" placeholder="Program Studi" onChange={tanganiPerubahanTambahan} style={gaya.input} required />
                        <button type="submit" style={gaya.tombolLanjut}>Simpan ke Database</button>
                    </form>
                    <p style={gaya.teksBeralih} onClick={() => setTahapLanjutanGoogle(false)}><span style={gaya.tautan}>Batal</span></p>
                </div>
            </div>
        );
    }

    return (
        <div style={gaya.latarBelakang}>
            <div style={gaya.kartu} className="responsive-login-card">
                <h2 style={gaya.judul}>{modeMasuk ? "Masuk" : "Daftar Akun Aslab"}</h2>
                <p style={gaya.subjudul}>{modeMasuk ? "Portal terintegrasi Cloud Database." : "Registrasi pendaftar baru."}</p>

                {modeMasuk && (
                    <>
                        <div style={gaya.wadahGoogle}>
                            <GoogleLogin onSuccess={tanganiSuksesGoogle} onError={() => alert("Gagal Google SSO.")} width="320" />
                        </div>
                        <div style={gaya.wadahPemisah}>
                            <hr style={gaya.garis} /><span style={gaya.teksPemisah}>ATAU MANUAL</span><hr style={gaya.garis} />
                        </div>
                    </>
                )}

                <form onSubmit={modeMasuk ? tanganiMasuk : tanganiDaftar} style={gaya.formulir}>
                    {!modeMasuk && (
                        <>
                            <input type="text" name="nama" placeholder="Nama Lengkap" onChange={tanganiPerubahan} style={gaya.input} />
                            <input type="text" name="nim" placeholder="NIM" onChange={tanganiPerubahan} style={gaya.input} />
                            <input type="text" name="prodi" placeholder="Program Studi" onChange={tanganiPerubahan} style={gaya.input} />
                        </>
                    )}
                    <input type="email" name="email" placeholder="Alamat Email" onChange={tanganiPerubahan} style={gaya.input} />
                    <input type="password" name="password" placeholder="Kata Sandi" onChange={tanganiPerubahan} style={gaya.input} />

                    <button type="submit" style={gaya.tombolLanjut}>{modeMasuk ? "Masuk" : "Daftar Sekarang"}</button>
                </form>

                <p style={gaya.teksBeralih}>
                    {modeMasuk ? "Belum terdaftar? " : "Sudah punya akun? "}
                    <span style={gaya.tautan} onClick={() => setModeMasuk(!modeMasuk)}>
                        {modeMasuk ? "Daftar manual di sini" : "Masuk di sini"}
                    </span>
                </p>
            </div>
        </div>
    );
}

const gaya = {
    latarBelakang: { backgroundColor: '#121212', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' },
    kartu: { backgroundColor: '#212121', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
    judul: { textAlign: 'center', fontSize: '24px', marginBottom: '10px', fontWeight: '600' },
    subjudul: { textAlign: 'center', fontSize: '13px', color: '#a0a0a0', marginBottom: '25px', lineHeight: '1.6' },
    wadahGoogle: { display: 'flex', justifyContent: 'center', marginBottom: '10px' },
    wadahPemisah: { display: 'flex', alignItems: 'center', margin: '20px 0' },
    garis: { flex: 1, border: 'none', borderTop: '1px solid #404040' },
    teksPemisah: { padding: '0 15px', color: '#888888', fontSize: '11px', fontWeight: '600', letterSpacing: '1px' },
    formulir: { display: 'flex', flexDirection: 'column', gap: '12px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #404040', backgroundColor: '#121212', color: '#ffffff', fontSize: '14px', outline: 'none' },
    tombolLanjut: { padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#ffffff', color: '#000000', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
    teksBeralih: { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#a0a0a0' },
    tautan: { color: '#3b82f6', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }
};