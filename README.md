# Full-Stack Dashboard Analytics & Containerized Deployment

Aplikasi Dashboard Analitik berbasis **React (Vite)** modern dan responsif yang terintegrasi penuh dengan backend **Go REST API**. Proyek ini dibangun untuk memenuhi seluruh persyaratan tugas teknis, mencakup manajemen sesi JWT, fungsionalitas CRUD data, visualisasi grafik analitik interaktif, penanganan error & rate-limit, serta penggelaran terwadahi (*containerized*) menggunakan **Docker / Podman**.

---

## 🖼️ Tampilan Aplikasi (Screenshots)

*Berikut adalah tangkapan layar antarmuka aplikasi dashboard yang telah diimplementasikan:*

## 🖼️ Tampilan Aplikasi (Screenshots)

*Berikut adalah tangkapan layar antarmuka aplikasi dashboard yang telah diimplementasikan:*

### 1. Dashboard Principal & Summary Cards
<img width="815" height="1464" alt="Menampilkan metrik utama" src="https://github.com/user-attachments/assets/a4800f65-a836-4752-803d-cafe069c4e25" />
<img width="2846" height="1560" alt="menu utama 1" src="https://github.com/user-attachments/assets/4420f525-c16b-467a-92f9-798070204f34" />
<img width="2875" height="1612" alt="menuutama2" src="https://github.com/user-attachments/assets/2c714a0b-5be5-4b46-9be4-9f1f7c08bd32" />

*Menampilkan metrik utama (Total Records, Total Revenue, Alloc Memory), grafik interaktif, form input data, serta tabel manajemen record.*

### 2. Notifikasi Toast & Interactive Features
<img width="2880" height="1800" alt="rate limiting (HTTP 429)" src="https://github.com/user-attachments/assets/05933e78-76a9-4dba-82a0-e8ac6a1531fa" />

*Umpan balik visual real-time menggunakan Toast Notification untuk penanganan rate limiting (HTTP 429).*

### 3. Fungsionalitas CRUD & Seed Data
<img width="2880" height="1800" alt="create record" src="https://github.com/user-attachments/assets/9e354222-eff4-44e0-9df3-8a7966b142c7" />
<img width="2880" height="1800" alt="delete record" src="https://github.com/user-attachments/assets/1128948d-10c8-4090-9148-3ece4e1231fc" />
<img width="2880" height="1800" alt="generate seed data" src="https://github.com/user-attachments/assets/d63253c3-8d8c-4e18-a421-0f365a1cd294" />

*Pengujian penambahan record baru serta fitur otomatisasi seed data.*

---

## 🔑 Kredensial & Keamanan Autentikasi

* **Username Default:** `user`
* **Password Default:** `pass`
* **Tipe Autentikasi:** JWT Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)
* **Masa Berlaku Token:** 24 Jam

---

## 🐳 Cara Menjalankan Menggunakan Kontainer (Docker / Podman)

Metode ini direkomendasikan karena menjalankan frontend dan backend secara otomatis dalam satu jaringan isolasi (*bridge network*) dengan satu perintah.

### Prasyarat
* Docker Desktop / Engine & Docker Compose (atau Podman & Podman Compose).

### Langkah Penggelaran:

1. **Buka Terminal di Root Proyek (`dashboard-app`)**
2. **Jalankan Orkestrasi Kontainer:**
   ```bash
   docker-compose up -d --build
