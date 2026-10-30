/* ==========================================================
   forgot.js - logika halaman Lupa Password E-Activity
   Alur: (1) verifikasi email + nomor HP, (2) buat password baru.

   CATATAN: ini versi latihan tanpa server. Aplikasi sungguhan
   mengirim link reset ke email, bukan memakai nomor HP seperti ini.
   ========================================================== */

/* 1. PENGATURAN */
const EMAIL_DUMMY = "user@example.com";   // akun dummy tidak bisa direset
const KEY_PENGGUNA = "penggunaTerdaftar"; // sama dengan register.js dan script.js
const PASSWORD_MIN = 8;

/* 2. ELEMEN */
const formVerifikasi = document.getElementById("verify-form");
const formReset = document.getElementById("reset-form");
const pesanVerifikasi = document.getElementById("verify-message");
const pesanReset = document.getElementById("reset-message");
const tombolReset = document.getElementById("reset-button");
const daftarKolom = ["email", "telepon", "password", "konfirmasi"];

// Menyimpan email yang sudah lolos verifikasi (langkah 1) untuk dipakai di langkah 2
let emailTerverifikasi = null;

/* 3. FUNGSI BANTUAN */
function setError(id, pesan) {
  document.getElementById(id).classList.add("invalid");
  document.getElementById(id + "-error").textContent = pesan;
  return false;
}

function hapusError(id) {
  document.getElementById(id).classList.remove("invalid");
  document.getElementById(id + "-error").textContent = "";
  return true;
}

function tampilkanPesan(elemen, teks, tipe) {
  elemen.textContent = teks;
  elemen.className = "form-message" + (tipe ? " " + tipe : "");
}

function ambilPengguna() {
  try {
    return JSON.parse(localStorage.getItem(KEY_PENGGUNA)) || [];
  } catch (error) {
    return [];
  }
}

/* 4. LANGKAH 1: VERIFIKASI */
function validasiEmail() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") {
    return setError("email", "Email wajib diisi");
  }
  if (!polaEmail.test(email)) {
    return setError("email", "Format email tidak valid");
  }
  return hapusError("email");
}

function validasiTelepon() {
  const telepon = document.getElementById("telepon").value.trim();

  if (telepon === "") {
    return setError("telepon", "Nomor HP wajib diisi");
  }
  if (/\D/.test(telepon)) {
    return setError("telepon", "Nomor HP hanya boleh berisi angka");
  }
  return hapusError("telepon");
}

formVerifikasi.addEventListener("submit", function (event) {
  event.preventDefault();
  tampilkanPesan(pesanVerifikasi, "", "");

  // Cek format dulu (keduanya dijalankan supaya pesan tampil bersamaan)
  const emailValid = validasiEmail();
  const teleponValid = validasiTelepon();
  if (!emailValid || !teleponValid) {
    return;
  }

  const email = document.getElementById("email").value.trim().toLowerCase();
  const telepon = document.getElementById("telepon").value.trim();

  // Akun dummy tidak tersimpan di localStorage, jadi tidak bisa direset
  if (email === EMAIL_DUMMY) {
    setError("email", "Akun dummy tidak bisa direset password-nya");
    return;
  }

  // Cari akun dengan email tersebut
  const pengguna = ambilPengguna().find(function (p) {
    return p.email === email;
  });

  if (!pengguna) {
    setError("email", "Email tidak terdaftar");
    return;
  }
  if (pengguna.telepon !== telepon) {
    setError("telepon", "Nomor HP tidak cocok dengan email ini");
    return;
  }

  // Verifikasi berhasil: tampilkan form password baru
  emailTerverifikasi = email;
  formVerifikasi.style.display = "none";
  formReset.style.display = "";   // "" = hapus pengaturan, kembali ke CSS bawaan
  tampilkanPesan(pesanReset, "Verifikasi berhasil. Silakan buat password baru.", "success");
  document.getElementById("password").focus();
});

/* 5. LANGKAH 2: PASSWORD BARU */
function validasiPassword() {
  const password = document.getElementById("password").value;

  if (password === "") {
    return setError("password", "Password baru wajib diisi");
  }
  if (password.length < PASSWORD_MIN) {
    return setError("password", "Password minimal " + PASSWORD_MIN + " karakter");
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return setError("password", "Password harus mengandung huruf dan angka");
  }

  // Password baru tidak boleh sama dengan yang lama
  const pengguna = ambilPengguna().find(function (p) {
    return p.email === emailTerverifikasi;
  });
  if (pengguna && pengguna.password === password) {
    return setError("password", "Password baru tidak boleh sama dengan password lama");
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

formReset.addEventListener("submit", function (event) {
  event.preventDefault();
  tampilkanPesan(pesanReset, "", "");

  const passwordValid = validasiPassword();
  const konfirmasiValid = validasiKonfirmasi();
  if (!passwordValid || !konfirmasiValid) {
    document.querySelector(".invalid").focus();
    return;
  }

  // Ganti password pada akun yang sudah diverifikasi
  const daftar = ambilPengguna();
  daftar.forEach(function (p) {
    if (p.email === emailTerverifikasi) {
      p.password = document.getElementById("password").value;
    }
  });
  localStorage.setItem(KEY_PENGGUNA, JSON.stringify(daftar));

  tombolReset.disabled = true;
  tampilkanPesan(
    pesanReset,
    "Password berhasil diubah. Mengalihkan ke halaman login...",
    "success"
  );

  setTimeout(function () {
    window.location.href = "index.html";
  }, 1500);
});

/* 6. TOMBOL LIHAT / SEMBUNYIKAN */
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