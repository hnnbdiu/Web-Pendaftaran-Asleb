import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, peranDibutuhkan }) {
  // Mengambil data sesi dari penyimpanan lokal peramban
  const sesiData = localStorage.getItem('sesiPengguna');
  const sesi = sesiData ? JSON.parse(sesiData) : null;

  // Jika pengguna belum masuk, kembalikan ke halaman utama
  if (!sesi) {
    return <Navigate to="/" replace />;
  }

  // Jika peran tidak sesuai, tolak akses dan kembalikan ke halaman yang berhak
  if (peranDibutuhkan && sesi.peran !== peranDibutuhkan) {
    alert("Akses Ditolak: Anda tidak memiliki otoritas untuk halaman ini.");
    return <Navigate to={sesi.peran === 'pendaftar' ? '/ujian' : '/admin-portal'} replace />;
  }

  // Jika verifikasi berhasil, render komponen halaman
  return children;
}