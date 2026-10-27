/* ==========================================================
   script.js - logika halaman login LoginTest
   Mengisi pesan error, mengecek akun, dan mengatur fitur
   show/hide password, ingat saya, serta batas percobaan login.
   ========================================================== */

/* 1. PENGATURAN
   Nilai-nilai ini sama dengan yang ada di dokumen perencanaan.
   Kalau aturannya berubah, cukup ubah di bagian ini saja. */
   const AKUN_DUMMY = {
    email: "user@example.com",
    password: "Password123"
  };
  const PASSWORD_MIN = 8;          // panjang minimal password
  const MAKS_GAGAL = 3;            // maksimal percobaan gagal
  const DURASI_KUNCI_DETIK = 30;   // lama akun terkunci
  
  /* Nama "laci" penyimpanan di browser (localStorage / sessionStorage) */
  const KEY_GAGAL = "loginGagal";
  const KEY_KUNCI = "kunciSampai";
  const KEY_EMAIL_INGAT = "emailTersimpan";
  const KEY_SESI = "sudahLogin";
  
  /* 2. AMBIL ELEMEN DARI HTML
     getElementById mencari elemen berdasarkan id di index.html. */
  const form = document.getElementById("login-form");
  const inputEmail = document.getElementById("email");
  const inputPassword = document.getElementById("password");
  const errorEmail = document.getElementById("email-error");
  const errorPassword = document.getElementById("password-error");
  const pesanForm = document.getElementById("form-message");
  const tombolLogin = document.getElementById("login-button");
  const tombolLihat = document.getElementById("toggle-password");
  const cekIngat = document.getElementById("remember");
  
  /* 3. FUNGSI BANTUAN UNTUK PESAN */
  
  // Menampilkan pesan error di bawah satu kolom
  function tampilkanError(input, elemenError, pesan) {
    elemenError.textContent = pesan;
    input.classList.add("invalid");
  }
  
  // Menghapus pesan error dari satu kolom
  function hapusError(input, elemenError) {
    elemenError.textContent = "";
    input.classList.remove("invalid");
  }
  
  // Menampilkan pesan umum di atas form.
  // tipe: "error", "success", atau "" (kosong = pesan dihapus)
  function tampilkanPesan(teks, tipe) {
    pesanForm.textContent = teks;
    pesanForm.className = "form-message" + (tipe ? " " + tipe : "");
  }
  
  /* 4. VALIDASI
     Mengembalikan true kalau valid, false kalau ada masalah. */
  function validasiEmail() {
    const email = inputEmail.value.trim();
    // Pola sederhana: ada teks, lalu "@", lalu teks, titik, teks
    const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (email === "") {
      tampilkanError(inputEmail, errorEmail, "Email wajib diisi");
      return false;
    }
    if (!polaEmail.test(email)) {
      tampilkanError(inputEmail, errorEmail, "Format email tidak valid");
      return false;
    }
    hapusError(inputEmail, errorEmail);
    return true;
  }
  
  function validasiPassword() {
    const password = inputPassword.value;
  
    if (password === "") {
      tampilkanError(inputPassword, errorPassword, "Password wajib diisi");
      return false;
    }
    if (password.length < PASSWORD_MIN) {
      tampilkanError(
        inputPassword,
        errorPassword,
        "Password minimal " + PASSWORD_MIN + " karakter"
      );
      return false;
    }
    hapusError(inputPassword, errorPassword);
    return true;
  }
  
  /* 5. BATAS PERCOBAAN LOGIN (AKUN TERKUNCI SEMENTARA)
     Waktu kunci disimpan di localStorage, jadi me-refresh halaman
     tidak membuat kunci hilang. */
  function sisaDetikKunci() {
    const sampai = Number(localStorage.getItem(KEY_KUNCI)) || 0;
    const sisa = Math.ceil((sampai - Date.now()) / 1000);
    return sisa > 0 ? sisa : 0;
  }
  
  function mulaiKunci() {
    tombolLogin.disabled = true;
  
    // Fungsi kecil untuk memperbarui pesan hitung mundur
    function perbarui() {
      const sisa = sisaDetikKunci();
  
      if (sisa <= 0) {
        // Waktu kunci habis: buka kembali
        clearInterval(timer);
        localStorage.removeItem(KEY_KUNCI);
        localStorage.removeItem(KEY_GAGAL);
        tombolLogin.disabled = false;
        tampilkanPesan("", "");
        return;
      }
      tampilkanPesan(
        "Terlalu banyak percobaan. Coba lagi dalam " + sisa + " detik.",
        "error"
      );
    }
  
    // setInterval menjalankan perbarui() setiap 1000 ms (1 detik)
    const timer = setInterval(perbarui, 1000);
    perbarui();
  }
  
  /* 6. SAAT FORM DIKIRIM (tombol Login ditekan atau tekan Enter) */
  form.addEventListener("submit", function (event) {
    // Mencegah browser memuat ulang halaman
    event.preventDefault();
    tampilkanPesan("", "");
  
    // Kalau masih terkunci, hentikan
    if (sisaDetikKunci() > 0) {
      mulaiKunci();
      return;
    }
  
    // Jalankan kedua validasi (keduanya dijalankan supaya dua pesan
    // error bisa tampil bersamaan)
    const emailValid = validasiEmail();
    const passwordValid = validasiPassword();
    if (!emailValid || !passwordValid) {
      return;
    }
  
    const email = inputEmail.value.trim().toLowerCase();
    const password = inputPassword.value;
  
    // Cocokkan dengan akun dummy
    if (email === AKUN_DUMMY.email && password === AKUN_DUMMY.password) {
      // LOGIN BERHASIL
      localStorage.removeItem(KEY_GAGAL);
  
      // Fitur "Ingat saya": simpan atau hapus email
      if (cekIngat.checked) {
        localStorage.setItem(KEY_EMAIL_INGAT, email);
      } else {
        localStorage.removeItem(KEY_EMAIL_INGAT);
      }
  
      // Tandai bahwa pengguna sudah login (dipakai dashboard.html)
      sessionStorage.setItem(KEY_SESI, "true");
  
      tampilkanPesan("Login berhasil. Mengalihkan ke dashboard...", "success");
      window.location.href = "dashboard.html";
      return;
    }
  
    // LOGIN GAGAL: tambah hitungan percobaan gagal
    const gagal = (Number(localStorage.getItem(KEY_GAGAL)) || 0) + 1;
    localStorage.setItem(KEY_GAGAL, String(gagal));
  
    if (gagal >= MAKS_GAGAL) {
      localStorage.setItem(
        KEY_KUNCI,
        String(Date.now() + DURASI_KUNCI_DETIK * 1000)
      );
      mulaiKunci();
    } else {
      tampilkanPesan("Email atau password salah", "error");
    }
  });
  
  /* 7. TOMBOL LIHAT / SEMBUNYIKAN PASSWORD */
  tombolLihat.addEventListener("click", function () {
    const sedangTersembunyi = inputPassword.type === "password";
  
    inputPassword.type = sedangTersembunyi ? "text" : "password";
    tombolLihat.textContent = sedangTersembunyi ? "Sembunyikan" : "Lihat";
    tombolLihat.setAttribute(
      "aria-label",
      sedangTersembunyi ? "Sembunyikan password" : "Tampilkan password"
    );
  });
  
  /* 8. PESAN ERROR HILANG SAAT PENGGUNA MENGETIK ULANG */
  inputEmail.addEventListener("input", function () {
    hapusError(inputEmail, errorEmail);
  });
  inputPassword.addEventListener("input", function () {
    hapusError(inputPassword, errorPassword);
  });
  
  /* 9. SAAT HALAMAN DIBUKA
     - Isi email otomatis kalau "Ingat saya" pernah dicentang
     - Kalau akun masih terkunci, lanjutkan hitung mundurnya */
  const emailTersimpan = localStorage.getItem(KEY_EMAIL_INGAT);
  if (emailTersimpan) {
    inputEmail.value = emailTersimpan;
    cekIngat.checked = true;
  }
  
  if (sisaDetikKunci() > 0) {
    mulaiKunci();
  }