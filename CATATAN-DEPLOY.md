# PorsiFit LP — Revisi v4 (siap deploy)

## Cara pasang ke repo
1. Salin **semua isi folder ini** ke root folder `porsifit-landing-page` di PC-mu, timpa file lama.
2. File lama yang sudah tidak dipakai boleh dihapus: `background.jpg`, `gambar1.jpg`, `gambar2.jpg`,
   `gambar3.jpg`, `paket1.jpg`, `paket2.jpg`, `PF_LOGO3.png`, `Color Palette PF.png`, `.DS_Store`.
   Semua sudah diganti versi ringan (`hero-bg.jpg`, `mealgrid.jpg`, `box.jpg`, `shape.jpg`, `glow.jpg`, `logo.png`).
3. `git add . && git commit -m "revisi LP pre-launch v4" && git push` lalu Vercel akan auto-deploy.

## Isi folder
| File | Keterangan |
|---|---|
| `index.html` | Struktur + copy final + tag GA4 |
| `style.css` | Seluruh styling, responsif mobile/tablet/desktop |
| `main.js` | Validasi form, kirim ke Google Sheet, modal, FAQ, event GA4 |
| `hero-bg.jpg` | Background hero (dari 11,8 MB jadi 273 KB) |
| `shape.jpg` `glow.jpg` | Foto paket, hasil crop poster lama tanpa teks bawaan |
| `box.jpg` | Foto box branded (hero badge + section value proposition) |
| `mealgrid.jpg` | Banner di section menu |
| `logo.png` | Logo hasil trim |
| `favicon-32.png` `apple-touch-icon.png` `icon-512.png` | Favicon |

## Google Analytics
Tag `G-839V1LL1NV` sudah terpasang di `<head>`. Event yang dikirim otomatis:
- `generate_lead` saat form berhasil dikirim (ini yang dijadikan **Key Event / konversi** di GA4)
- `cta_click` dengan parameter `cta_location` (navbar, paket-shape, paket-glow, promo, closing)
- `faq_open`, `view_privacy_policy`, `scroll_depth` (25/50/75/90%), `form_error`

Event tambahan kalau welcome pop-up diaktifkan: `welcome_popup_view`, `welcome_popup_dismiss`,
dan `cta_click` dengan `cta_location: welcome_popup`.

Aktifkan konversinya di GA4: **Admin → Events → tandai `generate_lead` sebagai Key Event.**

Catatan domain: situs redirect ke `www.porsifit.my.id`, pastikan property GA4 mencakup
subdomain www supaya traffic tidak terbelah. Kalau nanti pindah ke GTM, cukup ganti blok
gtag di `<head>` dengan container GTM, seluruh event di `main.js` sudah lewat `dataLayer`
jadi tetap terbaca.

## Welcome pop-up
Markup-nya sudah ada di `index.html`, tapi **nonaktif**. Untuk mengaktifkan, buka `main.js`
dan ubah satu baris:

```js
const WELCOME_POPUP = {
  enabled: false,   // ubah jadi true
```

Aturan tampilnya sudah diatur supaya tidak melanggar standar LP:
pop-up baru muncul setelah pengunjung melewati hero (jadi tidak pernah menutupi lead form
di atas fold), plus jeda 9 detik, cuma sekali per sesi, dan tidak muncul kalau pengunjung
sudah mengisi form. Copy-nya bertone pre-launch dan CTA-nya sama dengan CTA lain.
Atur jeda lewat `delayMs`.

## Yang masih perlu dilengkapi tim
- [ ] Validasi angka kalori & protein 10 menu ke tim dapur
- [ ] Konfirmasi dua klaim USP: "dimasak pagi, diantar hari itu" dan "menu ganti tiap hari"
- [ ] Validasi harga paket mingguan (Rp275rb/495rb/865rb dan Rp325rb/640rb/955rb)

## Tes sebelum submit
1. Isi form, pastikan Thank You pop-up muncul dan datanya masuk ke Google Sheet dalam hitungan detik.
2. Coba submit tanpa mencentang privacy policy, harus muncul peringatan.
3. Chrome DevTools device simulation: iPhone SE, iPad, desktop 1440px.
4. Cek form terlihat tanpa scroll di desktop.
