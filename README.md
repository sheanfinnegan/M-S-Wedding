# Michael & Sharen — Wedding Invitation

Website undangan pernikahan responsif dengan sampul interaktif, hitung mundur, jadwal, peta, galeri foto, dan form RSVP.

## Menjalankan website

Buka `index.html` di browser, atau publikasikan folder project ini ke static hosting seperti GitHub Pages, Netlify, atau hosting web Anda. Semua foto diambil dari folder `Photo`.

## Menghubungkan RSVP ke Google Sheets

1. Buat Google Sheet untuk daftar RSVP.
2. Pilih **Extensions → Apps Script**, tempel kode dari `google-apps-script.gs`, lalu simpan.
3. Pilih **Deploy → New deployment → Web app**. Atur **Execute as: Me** dan akses **Anyone**, lalu deploy dan salin URL Web App yang berakhir dengan `/exec`.
4. Buka `app.js`, isi nilai `RSVP_ENDPOINT` dengan URL tersebut, lalu publikasikan ulang website.

Sesudah terhubung, setiap kiriman RSVP akan menambahkan satu baris ke sheet: waktu kirim, nama, WhatsApp, kehadiran, jumlah tamu, dan pesan. Deploy ulang versi baru dari Apps Script jika suatu saat Anda mengubah script setelah deployment.

### Perilaku sebelum Sheets terhubung

Sampai `RSVP_ENDPOINT` diisi, form menyimpan RSVP di `localStorage` browser pengunjung dan menampilkan status bahwa Google Sheets belum terhubung. Data lokal itu hanya ada di perangkat pengunjung dan tidak dapat ditarik ke sheet; hubungkan endpoint sebelum membagikan undangan.

## Catatan konten

Waktu acara dan urutan acara adalah rancangan awal: tamu mulai hadir pukul 15.00, pemberkatan 15.30, dan resepsi 18.00 WIB. Silakan sesuaikan bila jadwal final sudah tersedia. Pemutar musik sudah disiapkan namun sumber audio belum diisi.

Link undangan personal dapat memakai query `?to=Nama%20Tamu`, misalnya `https://contoh.id/?to=Keluarga%20Budi`.
