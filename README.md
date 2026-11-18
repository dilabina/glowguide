# GlowGuide 🌸
### Aplikasi Rekomendasi Skincare & Makeup Berdasarkan Jenis Kulit, Masalah Kulit, & Bentuk Wajah

**GlowGuide** adalah aplikasi web kecantikan pintar yang dirancang khusus untuk perempuan di Indonesia, khususnya remaja dan wanita muda (siswi SMP/SMA, mahasiswi, dan pemula), untuk menemukan produk kecantikan lokal resmi BPOM & Halal yang sesuai dengan kebutuhan kulit tropis serta bentuk wajah mereka.

---

## ✨ Fitur-Fitur Utama

1. **Kuis Analisis Kecantikan Pintar (4 Langkah)**:
   - **Jenis Kulit**: Berminyak (*oily*), Kering (*dry*), Kombinasi (*combination*), Sensitif (*sensitive*), dan Normal seimbang, dilengkapi panduan tes mandiri 30 menit.
   - **Permasalahan Kulit**: Jerawat aktif, noda bekas jerawat (PIH / PIE), kulit kusam, pori-pori besar & komedo, skin barrier rusak, dan minyak berlebih.
   - **Bentuk Wajah**: Bulat (*round*), Oval, Kotak (*square*), Hati (*heart*), Lonjong (*oblong*), dan Berlian (*diamond*) lengkap dengan simulator pemindai proporsi wajah.
   - **Preferensi & Budget**: Kantong Pelajar/Remaja (< Rp 50.000), Menengah (Rp 50.000 - 150.000), Sultan (> Rp 150.000), serta opsi Halal Certified dan Ramah Remaja.

2. **Rekomendasi Rutinitas Skincare Personalisasi (Pagi & Malam)**:
   - **Rutinitas Pagi**: Sabun pembersih ber-pH rendah, hydrating toner, serum pencerah/jerawat, pelembap gel ringan, dan tabir surya (*sunscreen*) 2 ruas jari.
   - **Rutinitas Malam**: *Double cleansing* (micellar water), pembersih wajah, toner pemulihan/eksfoliasi, serum perbaikan barrier, dan pelembap malam.
   - **Estimasi Total Biaya Skincare**: Menghitung biaya pengeluaran produk bulanan secara transparan.

3. **Panduan Makeup & Visualizer Bentuk Wajah Interaktif (Canvas HTML5)**:
   - Visualisasi anatomi wajah dan zonasi riasan real-time.
   - Lapisan yang dapat diaktifkan/dinonaktifkan secara interaktif:
     - 🤎 **Shading / Shading**: Garis rahang tirus, pelipis, dan bawah tulang pipi.
     - 🌸 **Blush On**: Penempatan perona pipi (*lifted*, apel pipi, atau horizontal *sun-kissed*).
     - ✨ **Highlighter**: Titik pantul cahaya (tulang pipi, hidung, *cupid's bow*).
     - ✏️ **Bentuk Alis Ideal**: Penyeimbang proporsi (*high arch*, *soft curved*, atau alis lurus ala Korea).
     - 💄 **Riasan Bibir**: Rekomendasi teknik *ombre lips* favorit remaja Indonesia.

4. **Katalog Produk Kecantikan Indonesia**:
   - Puluhan produk dari brand lokal terpopuler: **Somethinc, Wardah, Emina, Skintific, Avoskin, Studio Tropik, Luxcrime, Dear Me Beauty, The Originote, Glad2Glow, Hanasui, Make Over, Rose All Day**.
   - Filter pencarian langsung berdasarkan nama, brand, jenis (Skincare/Makeup), kategori, rentang harga, dan jenis kulit.
   - Modal informasi detail: *Hero ingredients*, nomor registrasi BPOM, klaim Halal, petunjuk penggunaan, dan tips GlowGuide.

5. **Pengecek Benturan Kandungan (Skincare Clash Checker)**:
   - Analisis interaktif keamanan mencampur dua bahan aktif (Retinol, Vitamin C, AHA/BHA, Niacinamide, Salicylic Acid, Hyaluronic Acid, Centella Asiatica, Ceramide).
   - Indikator keamanan: *Pasangan Emas* 🟢, *Beri Jeda / Hati-hati* 🟡, dan *Hindari Bersamaan* 🔴.
   - Panduan metode *Skin Cycling* 4 malam bagi pemula.

6. **GlowPedia (Kamus Istilah Kecantikan Indonesia)**:
   - Penjelasan istilah populer: *Skin Barrier, Double Cleansing, PIH vs PIE, Non-Comedogenic, Purging vs Breakout, SPF vs PA++++, Ombre Lips*.

7. **Jurnal Rutinitas & Pelacak Air Minum Harian**:
   - Checklist langkah perawatan harian pagi & malam.
   - Pelacak 8 gelas air putih (2.000 ml) interaktif dengan efek suara tetesan air.
   - Penghitung hari konsisten (*streak tracker*).

8. **Daftar Keinginan (Wishlist) & Fitur Cetak**:
   - Simpan produk impian dan simulasikan total belanja.
   - Rangkuman dapat langsung dicetak atau disimpan ke PDF.

---

## 🚀 Cara Menjalankan Aplikasi

1. Buka berkas `index.html` langsung di peramban web modern manapun (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari):
   ```
   C:\Users\YOGA\.gemini\antigravity\scratch\glowguide\index.html
   ```
2. Aplikasi berjalan murni secara *client-side* (SPA) menggunakan HTML5, CSS3, Tailwind CSS (CDN), dan Vanilla ES6 JavaScript dengan dukungan penyimpanan data `localStorage`.

---

## 📂 Struktur Berkas

```
glowguide/
│
├── index.html          # Halaman utama aplikasi web & antarmuka responsif
├── styles.css          # Gaya visual kustom bertema kecantikan Indonesia
├── README.md           # Dokumentasi lengkap aplikasi
│
├── data/
│   ├── products.js     # Basis data produk kecantikan lokal (BPOM & Halal)
│   └── knowledge.js    # Basis pengetahuan jenis kulit, masalah kulit, bentuk wajah, dan kompatibilitas bahan aktif
│
└── js/
    └── app.js          # Logika aplikasi, state machine kuis, visualizer Canvas, audio FX, dan filter katalog
```

