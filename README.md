# Tobias Portofolio Mobile

Aplikasi portofolio saya untuk tugas Mobile App RPL3 Angkatan 12. Isinya model-model AI kecil yang saya latih sendiri dari nol, dan tiap model punya scene kubus 3D sendiri. Dibuat pakai Vue 3, TypeScript, Vue Router, TailwindCSS dan Three.js, lalu dijadikan aplikasi Android dengan Capacitor.

## Download

File APK bisa diambil di halaman [Releases](https://github.com/RPL3-ANGKATAN12/TOBIAS_SEBASTIAN_PORTOFOLIO_MOBILE/releases/latest).

Cara pasang di HP:

1. Download file `.apk` dari halaman Releases.
2. Buka filenya lewat File Manager.
3. Kalau muncul "Install unknown apps", buka Settings lalu izinkan dari sumber itu.
4. Tap Install, lalu buka aplikasinya.

## Halaman

| File | Isi |
|---|---|
| `src/views/HomeView.vue` | Hero dengan kubus 3D, tentang saya, skill, dan project terbaru |
| `src/views/ProjectView.vue` | Enam model yang saya latih dari nol, masing-masing dengan scene 3D sendiri, lalu project lain dalam bentuk card |
| `src/views/ContactView.vue` | Email dan link ke GitHub, Hugging Face dan Bench Labs |

## Komponen

| Komponen | Kegunaan |
|---|---|
| `Header.vue`, `SideBar.vue`, `Footer.vue` | Layout di `App.vue`. SideBar jadi menu geser di layar HP |
| `HeroSection.vue` | Bagian pembuka. Props `title`, slot default, slot `actions` dan `note` |
| `ButtonLink.vue` | Tombol navigasi. Props `to` untuk RouterLink atau `href` untuk link biasa, plus `variant` dan `size`. Teks tombolnya lewat slot |
| `SectionName.vue` | Judul section. Props `title`, `index`, `level`, slot `title` dan slot default untuk deskripsi |
| `SkillList.vue` | Daftar skill dari props `skills` |
| `ProjectList.vue` | Grid card project dari props `items`, dengan scoped slot `stat` |
| `ContactMe.vue` | Blok kontak. Props `email` dan `links`, tombol salin email, slot default untuk catatan |

Selain itu ada komponen pendukung: `ProjectShowcase`, `ProjectCard`, `ProjectRail`, `CubeStage`, `ArrowIcon` dan `BrandMark`. Scene kubusnya ada di `src/scene/`.

## Progres Hari 3

1. Stage 1: menyimpan projek ke GitHub kelas.
2. Stage 2: layout di `App.vue` dengan Header, SideBar dan Footer.
3. Stage 3: halaman Home dengan HeroSection, ButtonLink, SectionName dan SkillList.
4. Stage 4: halaman Project dengan ProjectList.
5. Stage 5: halaman Contact dengan ContactMe.

## Menjalankan

Butuh Node.js. Setelah clone:

```bash
npm install
npm run dev
```

Lalu buka alamat yang muncul di terminal.

## Build ke Android

Butuh Android Studio (sudah termasuk Android SDK dan JDK).

```bash
npm run build
npx cap sync android
npx cap open android
```

Di Android Studio pilih Build, lalu Build Bundle(s) / APK(s), lalu Build APK(s). Hasilnya ada di `android/app/build/outputs/apk/debug/app-debug.apk`.

Setiap habis mengubah kode, jalankan `npm run build` dulu sebelum `npx cap sync android`. Kalau tidak, aplikasinya masih pakai versi lama.

Ikon ada di `resources/icon.png` (1024x1024) dan splash di `resources/splash.png`. Kalau diganti, jalankan:

```bash
npx capacitor-assets generate --android
npx cap sync android
```

## Catatan

Angka download, like dan star diambil langsung dari API Hugging Face dan GitHub, lalu disimpan di `localStorage` selama satu jam. Angka di `src/lib/live.ts` cuma cadangan kalau API-nya tidak bisa diakses.
