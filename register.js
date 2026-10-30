/* ==========================================================
   register.js - logika halaman pendaftaran E-Activity
   Memvalidasi 5 kolom, lalu menyimpan akun baru di localStorage
   supaya bisa dipakai untuk login.

   CATATAN: password di sini disimpan apa adanya (tanpa enkripsi)
   hanya untuk latihan. Aplikasi sungguhan harus menyimpan password
   dalam bentuk hash di database (nanti dipelajari di Laravel).
   ========================================================== */

/* 1. PENGATURAN (ubah di sini kalau aturan berubah) */
const EMAIL_DUMMY = "user@example.com";   // sama dengan akun dummy di script.js
const KEY_PENGGUNA = "penggunaTerdaftar"; // nama "laci" penyimpanan akun
const NAMA_MIN = 3;
const NAMA_MAKS = 50;
const TELEPON_MIN = 10;
const TELEPON_MAKS = 13;
const PASSWORD_MIN = 8;

/* 2. ELEMEN */
const form = document.getElementById("register-form");
const pesanForm = document.getElementById("form-message");
const tombolDaftar = document.getElementById("register-button");
const daftarKolom = ["nama", "email", "telepon", "password", "konfirmasi"];

/* 3. FUNGSI BANTUAN */

// Menampilkan error di bawah kolom dengan id tertentu.
// Mengembalikan false supaya bisa langsung dipakai: return setError(...)
function setError(id, pesan) {
  document.getElementById(id).classList.add("invalid");
  document.getElementById(id + "-error").textContent = pesan;
  return false;
}

// Menghapus error dari kolom, mengembalikan true (artinya valid)
function hapusError(id) {
  document.getElementById(id).classList.remove("invalid");
  document.getElementById(id + "-error").textContent = "";
  return true;
}

function tampilkanPesan(teks, tipe) {
  pesanForm.textContent = teks;
  pesanForm.className = "form-message" + (tipe ? " " + tipe : "");
}

// Mengambil daftar akun dari localStorage.
// try/catch: kalau datanya rusak, program tidak berhenti dan memakai daftar kosong.
function ambilPengguna() {
  try {
    return JSON.parse(localStorage.getItem(KEY_PENGGUNA)) || [];
  } catch (error) {
    return [];
  }
}

function emailSudahTerdaftar(email) {
  if (email === EMAIL_DUMMY) {
    return true;
  }
  return ambilPengguna().some(function (pengguna) {
    return pengguna.email === email;
  });
}

/* 4. VALIDASI TIAP KOLOM */
function validasiNama() {
  const nama = document.getElementById("nama").value.trim();
  const polaNama = /^[A-Za-z\u00C0-\u024F .'-]+$/;

  if (nama === "") {
    return setError("nama", "Nama lengkap wajib diisi");
  }
  if (nama.length < NAMA_MIN) {
    return setError("nama", "Nama minimal " + NAMA_MIN + " karakter");
  }
  if (nama.length > NAMA_MAKS) {
    return setError("nama", "Nama maksimal " + NAMA_MAKS + " karakter");
  }
  if (!polaNama.test(nama)) {
    return setError("nama", "Nama hanya boleh berisi huruf");
  }
  return hapusError("nama");
}

function validasiEmail() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") {
    return setError("email", "Email wajib diisi");
  }
  if (!polaEmail.test(email)) {
    return setError("email", "Format email tidak valid");
  }
  if (emailSudahTerdaftar(email)) {
    return setError("email", "Email sudah terdaftar");
  }
  return hapusError("email");
}

function validasiTelepon() {
  const telepon = document.getElementById("telepon").value.trim();

  if (telepon === "") {
    return setError("telepon", "Nomor HP wajib diisi");
  }
  if (/\D/.test(telepon)) {
    // \D artinya "karakter yang bukan angka"
    return setError("telepon", "Nomor HP hanya boleh berisi angka");
  }
  if (
    !telepon.startsWith("08") ||
    telepon.length < TELEPON_MIN ||
    telepon.length > TELEPON_MAKS
  ) {
    return setError(
      "telepon",
      "Nomor HP harus diawali 08 dan terdiri dari " +
        TELEPON_MIN + " sampai " + TELEPON_MAKS + " digit"
    );
  }
  return hapusError("telepon");
}

function validasiPassword() {
  const password = document.getElementById("password").value;

  if (password === "") {
    return setError("password", "Password wajib diisi");
  }
  if (password.length < PASSWORD_MIN) {
    return setError("password", "Password minimal " + PASSWORD_MIN + " karakter");
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return setError("password", "Password harus mengandung huruf dan angka");
  }
  return hapusError("password");
}

function validasiKonfirmasi() {
  const password = document.getElementById("password").value;
  const konfirmasi = document.getElementById("konfirmasi").value;

  if (konfirmasi === "") {
    return setError("konfirmasi", "Konfirmasi password wajib diisi");
  }
  if (konfirmasi !== password) {
    return setError("konfirmasi", "Konfirmasi password tidak sama");
  }
  return hapusError("konfirmasi");
}

/* 5. SAAT FORM DIKIRIM */
form.addEventListener("submit", function (event) {
  event.preventDefault();
  tampilkanPesan("", "");

  // Semua validasi dijalankan (tidak berhenti di yang pertama gagal),
  // supaya semua pesan error tampil sekaligus.
  const hasil = [
    validasiNama(),
    validasiEmail(),
    validasiTelepon(),
    validasiPassword(),
    validasiKonfirmasi()
  ];

  if (hasil.includes(false)) {
    // Pindahkan kursor ke kolom bermasalah yang pertama
    document.querySelector(".invalid").focus();
    return;
  }

  // Semua valid: simpan akun baru
  const pengguna = ambilPengguna();
  pengguna.push({
    nama: document.getElementById("nama").value.trim(),
    email: document.getElementById("email").value.trim().toLowerCase(),
    telepon: document.getElementById("telepon").value.trim(),
    password: document.getElementById("password").value
  });
  localStorage.setItem(KEY_PENGGUNA, JSON.stringify(pengguna));

  // Nonaktifkan tombol supaya tidak terkirim dua kali
  tombolDaftar.disabled = true;
  tampilkanPesan("Pendaftaran berhasil. Mengalihkan ke halaman login...", "success");

  // Tunggu 1,5 detik lalu pindah ke halaman login
  setTimeout(function () {
    window.location.href = "index.html";
  }, 1500);
});

/* 6. TOMBOL LIHAT / SEMBUNYIKAN (untuk password dan konfirmasi) */
document.querySelectorAll(".toggle-password").forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    const kolom = document.getElementById(tombol.dataset.target);
    const sedangTersembunyi = kolom.type === "password";

    kolom.type = sedangTersembunyi ? "text" : "password";
    tombol.textContent = sedangTersembunyi ? "Sembunyikan" : "Lihat";
  });
});

/* 7. ERROR HILANG SAAT PENGGUNA MENGETIK ULANG */
daftarKolom.forEach(function (id) {
  document.getElementById(id).addEventListener("input", function () {
    hapusError(id);
  });
});