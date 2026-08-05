# Full-Stack Dashboard Analytics & Containerized Deployment

Aplikasi Dashboard Analitik berbasis **React (Vite)** modern dan responsif yang terintegrasi penuh dengan backend **Go REST API**. Proyek ini dibangun untuk memenuhi seluruh persyaratan tugas teknis, mencakup manajemen sesi JWT, fungsionalitas CRUD data, visualisasi grafik analitik interaktif, penanganan error & rate-limit, serta penggelaran terwadahi (*containerized*) menggunakan **Docker / Podman**.

---

## 🖼️ Tampilan Aplikasi (Screenshots)

*Berikut adalah tangkapan layar antarmuka aplikasi dashboard yang telah diimplementasikan:*

## 🖼️ Tampilan Aplikasi (Screenshots)

*Berikut adalah tangkapan layar antarmuka aplikasi dashboard yang telah diimplementasikan:*

### 1. Dashboard Principal & Summary Cards
![Dashboard Overview](./frontend/screenshots/menuutama2.png)
*Menampilkan metrik utama (Total Records, Total Revenue, Alloc Memory), grafik interaktif, form input data, serta tabel manajemen record.*

### 2. Notifikasi Toast & Interactive Features
![Rate Limiting HTTP 429](./frontend/screenshots/rate%20limiting%20(HTTP%20429).png)
*Umpan balik visual real-time menggunakan Toast Notification untuk penanganan rate limiting (HTTP 429).*

### 3. Fungsionalitas CRUD & Seed Data
![Create Record](./frontend/screenshots/create%20record.png)
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