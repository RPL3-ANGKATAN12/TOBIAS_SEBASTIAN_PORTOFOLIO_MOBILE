# Tobias Portofolio Mobile

Aplikasi portofolio Tobias. Dibuat dengan Vue 3, TypeScript, Vue Router, TailwindCSS dan Three.js, lalu dibungkus jadi aplikasi Android dengan Capacitor.

## Halaman

| File | Isi |
|---|---|
| `src/views/HomeView.vue` | Hero dengan kubus 3D, tentang saya, skill, dan daftar project terbaru |
| `src/views/ProjectView.vue` | Enam model yang saya latih dari nol, masing-masing dengan scene 3D sendiri, lalu daftar project lain dalam bentuk card |
| `src/views/ContactView.vue` | Email dan link GitHub, Hugging Face, Bench Labs |

## Komponen

| Komponen | Kegunaan |
|---|---|
| `Header.vue`, `SideBar.vue`, `Footer.vue` | Layout di `App.vue`. SideBar adalah menu geser untuk layar HP |
| `HeroSection.vue` | Bagian pembuka. Props `title`, slot default, `actions` dan `note` |
| `ButtonLink.vue` | Tombol navigasi. Props `to` (RouterLink) atau `href` (link biasa), `variant`, `size`, isi tombol lewat slot |
| `SectionName.vue` | Judul section. Props `title`, `index`, `level`, slot `title` dan slot default untuk deskripsi |
| `SkillList.vue` | Daftar skill dari props `skills` |
| `ProjectList.vue` | Grid card project dari props `items`, dengan scoped slot `stat` |
| `ContactMe.vue` | Blok kontak. Props `email` dan `links`, tombol salin email, slot default untuk catatan |

Komponen pendukung: `ProjectShowcase`, `ProjectCard`, `ProjectRail`, `CubeStage`, `ArrowIcon`, `BrandMark`. Scene kubusnya ada di `src/scene/`.

## Menjalankan

```bash
npm install
npm run dev
```

## Build ke Android

```bash
npm run build
npx cap sync android
npx cap open android
```

Selalu jalankan `npm run build` sebelum `npx cap sync android`, supaya perubahan kode ikut masuk ke aplikasi.

Ikon ada di `resources/icon.png` (1024×1024) dan splash di `resources/splash.png`. Setelah menggantinya jalankan:

```bash
npx capacitor-assets generate --android
npx cap sync android
```

## Catatan

- Angka download, like dan star diambil langsung dari API Hugging Face dan GitHub, lalu disimpan di `localStorage` selama satu jam. Angka di `src/lib/live.ts` hanya cadangan kalau API tidak bisa diakses.
- Vite tidak bisa build dari folder yang path-nya mengandung tanda `?`.
