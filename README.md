# basochecker 🛠️

**basochecker** adalah tools berbasis web yang dibangun menggunakan **Next.js** dan library **viem** untuk melakukan pengecekan saldo dari berbagai jaringan blockchain hanya dengan memasukkan **Address**.

Gunakan dengan Bijak untuk pembelajaran,
JADI BUAT APA? IF YOU KNOW, YOU KNOW | YANG TAU TAU AJA

---

## ✨ Fitur
- Input **banyak** address, dipisahkan dengan baris (newline)
- Input **banyak** private key, dipisahkan dengan baris (newline)
- Input Kunci Pribadi dilakukan melalui halaman khusus di: `/private`
- Mendukung jaringan:
  - Ethereum
  - BNB Chain
  - Optimism
  - Arbitrum
  - Base
  - Linea
- Menampilkan output per kolom untuk tiap wallet (address)
- Tidak menyimpan data apa pun (client-side only)

---

## 🚀 Library yang Digunakan

- [Next.js](https://nextjs.org/) – Framework React modern
- [Viem](https://viem.sh/) – Library EVM untuk komunikasi RPC
- [Tailwind CSS](https://tailwindcss.com/) – Untuk styling modern dan responsif

---

## ⚠️ PERINGATAN PENTING

**JANGAN PERNAH MEMASUKKAN PRIVATE KEY ASLI ATAU YANG SEDANG DIGUNAKAN!**

**TOOLS INI HANYA UNTUK PENGUJIAN ATAU PRIVATE KEY DUMMY SAJA!**

Semua proses berjalan secara lokal di browser (client-side), namun **penggunaan private key asli SANGAT TIDAK DISARANKAN untuk alasan keamanan**.

---

## 📦 Instalasi Lokal

```bash
git clone https://github.com/Lunairefine/basochecker.git
cd basochecker
npm install
npm run dev
Buka di browser: http://localhost:3000/ | http://localhost:3000/private

---
📄 Lisensi
MIT License © Lunairefine

---