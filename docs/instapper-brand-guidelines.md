# Instapper — Logo & Visual Brand Guidelines

> **Instapper** adalah browser extension open-source untuk mengambil / mengekstrak thumbnail postingan Instagram secara cepat.
>
> Dokumen ini menjadi panduan dasar agar logo, typography, warna, dan tampilan antarmuka Instapper tetap konsisten di browser extension, GitHub repository, website, dokumentasi, dan materi promosi.

---

## 1. Brand Direction

Instapper sebaiknya terasa:

- **Modern** — cocok dengan ekosistem browser extension dan web tools.
- **Technical, tetapi ramah** — tetap terasa sebagai developer tool tanpa terlihat terlalu kaku.
- **Cepat dan praktis** — visual harus menyampaikan ide *grab*, *extract*, atau *snap*.
- **Open-source friendly** — sederhana, mudah diaplikasikan, dan kuat pada ukuran kecil.
- **Tidak bergantung pada identitas Instagram** — Instapper memiliki brand sendiri dan tidak meniru logo Instagram.

Kata kunci visual:

**Extract · Snap · Thumbnail · Image · Browser · Fast · Developer Tool**

---

# 2. Logo Concept

## 2.1 Konsep Utama — Extracted Image

Logo Instapper menggunakan metafora sebuah **image / thumbnail yang sedang diekstrak keluar dari sebuah frame**.

Elemen utamanya terdiri dari:

1. **Frame**
   - Merepresentasikan halaman, viewport, container, atau sumber media.
   - Bentuk rounded membuat logo terasa modern dan cocok dengan UI browser.

2. **Image Tile**
   - Merepresentasikan thumbnail atau gambar yang ditemukan pada halaman.
   - Posisi tile yang keluar dari frame menyampaikan aksi *extract*, *grab*, atau *scrape*.

3. **Gerakan / Separation**
   - Jarak dan arah tile terhadap frame memberikan kesan bahwa gambar sedang dipindahkan keluar.
   - Ini menjadi metafora visual utama dari fungsi Instapper.

4. **Rounded Geometry**
   - Sudut yang membulat membuat logo terasa approachable.
   - Bentuk ini juga cocok dengan browser toolbar, extension card, favicon, dan UI modern.

---

## 2.2 Makna Logo

Logo dapat dibaca sebagai:

> **“Mengambil sebuah visual dari dalam halaman dan mengeluarkannya menjadi aset yang bisa digunakan.”**

Secara fungsi, ini berhubungan langsung dengan Instapper:

**Instagram Page → Thumbnail Detection → Extraction → User**

Logo tidak menggunakan kamera Instagram secara literal agar:

- tidak terlihat seperti produk resmi Instagram;
- tidak terlalu bergantung pada identitas visual platform lain;
- tetap relevan jika Instapper nantinya berkembang ke sumber atau fitur lain.

---

# 3. Logo Personality

Logo Instapper memiliki karakter:

- geometric;
- rounded;
- energetic;
- digital;
- lightweight;
- developer-oriented;
- friendly.

Hindari membuat logo menjadi terlalu:

- corporate;
- skeuomorphic;
- ornamental;
- kompleks;
- menyerupai logo Instagram secara langsung.

---

# 4. Logo Variants

Disarankan memiliki minimal empat variant resmi.

## Primary Logo

**Symbol + `instapper` wordmark**

Digunakan untuk:

- website;
- README;
- GitHub social preview;
- documentation;
- landing page;
- promotional assets.

---

## Symbol Only

Digunakan untuk:

- browser extension icon;
- favicon;
- avatar;
- toolbar;
- compact UI;
- application icon.

Pada ukuran kecil, gunakan **symbol saja** tanpa wordmark.

---

## Light Mode Variant

Logo untuk background terang.

Gunakan warna utama yang sedikit lebih dalam agar kontras tetap kuat.

Recommended frame range:

```text
#635BFF → #4338FF
```

Recommended extraction/image range:

```text
#2563FF → #22D3EE → #4AE3B5
```

---

## Dark Mode Variant

Logo untuk background gelap.

Gunakan warna yang sedikit lebih terang dan saturated.

Recommended range:

```text
#6D5CFF → #3B82F6 → #22D3EE → #4AE3B5
```

Tujuannya agar logo tetap terlihat hidup pada surface gelap.

---

# 5. Logo Color Palette

## Brand Indigo

```text
#635BFF
```

Fungsi:

- warna utama brand;
- frame logo;
- primary action;
- link penting;
- active indicator.

Karakter:

**technology · creativity · modernity**

---

## Electric Blue

```text
#2563FF
```

Fungsi:

- gradient;
- interactive state;
- progress;
- visual extraction element.

Karakter:

**speed · digital · functionality**

---

## Cyan

```text
#22D3EE
```

Fungsi:

- highlight;
- glow;
- icon accent;
- extraction state.

Karakter:

**fresh · fast · energetic**

---

## Mint

```text
#4AE3B5
```

Fungsi:

- secondary accent;
- success;
- visual highlight.

Karakter:

**success · completed extraction · freshness**

---

# 6. Recommended Brand Gradient

## Primary Gradient

```css
linear-gradient(
  135deg,
  #635BFF 0%,
  #2563FF 48%,
  #22D3EE 100%
)
```

Digunakan untuk:

- logo;
- primary hero accent;
- selected decorative component.

Jangan menggunakan gradient di terlalu banyak komponen UI.

---

## Fresh Gradient

```css
linear-gradient(
  135deg,
  #635BFF 0%,
  #22D3EE 60%,
  #4AE3B5 100%
)
```

Cocok untuk:

- artwork;
- hero illustration;
- social banner;
- open-source branding asset.

---

# 7. Typography

## 7.1 Logo / Brand Typeface

### Recommended: **Sora**

Sora cocok dengan Instapper karena memiliki:

- geometric construction;
- rounded detail;
- modern tech character;
- bentuk lowercase yang kuat;
- keterbacaan baik;
- personality yang lebih khas dibanding font UI generik.

Recommended wordmark:

```text
instapper
```

Gunakan lowercase agar terasa seperti:

- package;
- CLI tool;
- browser extension;
- open-source project.

### Suggested Weight

```text
Sora SemiBold — 600
Sora Bold     — 700
```

Pilihan utama:

> **Sora 700**

---

## Wordmark Styling

Disarankan menggunakan:

```text
instapper
```

bukan:

```text
Instapper
INSTAPPER
```

Lowercase membuat identitas terasa lebih modern dan developer-friendly.

Tracking:

```css
letter-spacing: -0.03em;
```

Jangan membuat tracking terlalu sempit agar huruf `pp` tetap jelas.

---

# 8. Product / Interface Typography

Untuk UI aplikasi, dokumentasi, website, dan browser extension:

## Primary UI Font — Inter

```text
Inter
```

Inter sangat cocok untuk:

- buttons;
- settings;
- extension popup;
- tables;
- metadata;
- documentation;
- navigation;
- forms.

Keunggulan:

- sangat mudah dibaca pada ukuran kecil;
- neutral;
- modern;
- memiliki banyak weight;
- cocok untuk developer tooling.

Recommended stack:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

---

## Developer / Code Font — JetBrains Mono

Untuk:

- code snippets;
- selector;
- URL;
- file path;
- debug information;
- developer documentation.

Gunakan:

```text
JetBrains Mono
```

Recommended stack:

```css
font-family:
  "JetBrains Mono",
  "SFMono-Regular",
  Consolas,
  monospace;
```

---

# 9. Type Scale

Recommended web / extension type scale:

| Usage | Size | Weight |
|---|---:|---:|
| Hero | 48–64px | 700 |
| H1 | 36–40px | 700 |
| H2 | 28–32px | 650–700 |
| H3 | 22–24px | 600 |
| Large body | 18px | 400–500 |
| Body | 16px | 400 |
| UI | 14px | 450–500 |
| Small / metadata | 12px | 450–500 |
| Code | 13–14px | 400 |

Untuk browser extension popup, prioritaskan ukuran:

```text
14px
16px
20px
24px
```

karena ruang UI relatif kecil.

---

# 10. UI Color System

## Dark Theme

Dark mode cocok menjadi default visual direction Instapper karena:

- thumbnail/media terlihat lebih menonjol;
- identitas indigo/cyan terlihat lebih vibrant;
- cocok dengan karakter developer tool.

### Background

```text
#090B12
```

### Surface

```text
#111318
```

### Elevated Surface

```text
#171A23
```

### Border

```text
#272B36
```

### Primary Text

```text
#F8FAFC
```

### Secondary Text

```text
#A7B0C0
```

### Muted Text

```text
#6F7888
```

---

# 11. Light Theme

## Background

```text
#F8FAFC
```

## Surface

```text
#FFFFFF
```

## Secondary Surface

```text
#F1F5F9
```

## Border

```text
#E2E8F0
```

## Primary Text

```text
#111318
```

## Secondary Text

```text
#475569
```

## Muted Text

```text
#94A3B8
```

---

# 12. Semantic Colors

Gunakan semantic colors secara konsisten.

## Success

```text
#22C55E
```

Contoh:

- thumbnail berhasil diambil;
- copy berhasil;
- extraction selesai.

---

## Warning

```text
#F59E0B
```

Contoh:

- beberapa thumbnail gagal;
- kualitas gambar terbatas;
- halaman belum selesai dimuat.

---

## Error

```text
#EF4444
```

Contoh:

- scraping gagal;
- thumbnail tidak ditemukan;
- permission error.

---

## Info

```text
#38BDF8
```

Contoh:

- status;
- informational tooltip;
- processing indicator.

---

# 13. Recommended CSS Tokens

```css
:root {
  /* Brand */
  --brand-indigo: #635BFF;
  --brand-blue: #2563FF;
  --brand-cyan: #22D3EE;
  --brand-mint: #4AE3B5;

  /* Light */
  --bg: #F8FAFC;
  --surface: #FFFFFF;
  --surface-secondary: #F1F5F9;
  --border: #E2E8F0;

  --text-primary: #111318;
  --text-secondary: #475569;
  --text-muted: #94A3B8;

  /* Semantic */
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #38BDF8;

  --brand-gradient:
    linear-gradient(
      135deg,
      #635BFF 0%,
      #2563FF 48%,
      #22D3EE 100%
    );
}

[data-theme="dark"] {
  --bg: #090B12;
  --surface: #111318;
  --surface-secondary: #171A23;
  --border: #272B36;

  --text-primary: #F8FAFC;
  --text-secondary: #A7B0C0;
  --text-muted: #6F7888;
}
```

---

# 14. Recommended UI Combination

Untuk Instapper, kombinasi utama yang paling direkomendasikan:

```text
Brand / Heading:
Sora

UI / Body:
Inter

Code:
JetBrains Mono
```

Dengan warna:

```text
Primary:
#635BFF

Secondary:
#2563FF

Highlight:
#22D3EE

Fresh Accent:
#4AE3B5

Dark Background:
#090B12

Dark Surface:
#111318
```

---

# 15. Example Button Styling

Primary button:

```css
.button-primary {
  color: #ffffff;

  background:
    linear-gradient(
      135deg,
      #635BFF,
      #2563FF
    );

  border: 0;
  border-radius: 10px;

  font-family: Inter, sans-serif;
  font-weight: 600;
}
```

Hover:

```css
.button-primary:hover {
  filter: brightness(1.08);
}
```

Avoid glow berlebihan.

---

# 16. Border Radius

Karena logo menggunakan rounded geometry, UI sebaiknya menggunakan radius yang selaras.

Recommended system:

```text
6px  — small controls
8px  — inputs / buttons
12px — cards
16px — large surfaces
20px — hero / promotional cards
```

Browser extension UI paling cocok menggunakan:

```text
8–12px
```

---

# 17. Icon Style

Icon UI Instapper sebaiknya:

- outline atau geometric;
- round cap;
- sederhana;
- stroke konsisten;
- tidak terlalu dekoratif.

Recommended stroke:

```text
1.75px – 2px
```

Hindari mencampur:

- filled icons;
- thin outline icons;
- skeuomorphic icons;

dalam satu interface.

---

# 18. Logo Clear Space

Gunakan minimal clear space sekitar logo sebesar:

```text
0.25× tinggi symbol
```

Jangan menempatkan elemen lain terlalu dekat dengan logo.

---

# 19. Minimum Size

## Symbol

Recommended minimum:

```text
16 × 16 px
```

Untuk ukuran tersebut, gunakan versi icon yang sudah disederhanakan.

Ideal browser toolbar:

```text
16px
32px
48px
128px
```

---

## Logo + Wordmark

Recommended minimum width:

```text
120px
```

Di bawah ukuran tersebut lebih baik menggunakan symbol saja.

---

# 20. Logo Don'ts

Jangan:

- stretch logo;
- mengubah aspect ratio;
- menambahkan drop shadow berat;
- menggunakan outline acak;
- menggunakan lebih dari satu gradient tambahan;
- memutar keseluruhan logo;
- mengganti warna menggunakan Instagram gradient;
- menambahkan logo Instagram ke dalam symbol;
- menambahkan terlalu banyak detail ke thumbnail;
- menggunakan wordmark dengan font script atau serif dekoratif.

---

# 21. Recommended Browser Extension Identity

Untuk toolbar:

```text
Symbol only
```

Untuk popup header:

```text
Symbol + instapper
```

Untuk Chrome / Firefox marketplace:

```text
Symbol besar
+
background sederhana
```

Untuk README:

```text
Symbol + wordmark
+
short tagline
```

---

# 22. Suggested Tagline

Beberapa tagline yang cocok dengan arah brand:

```text
Grab thumbnails. Instantly.
```

```text
Extract what you see.
```

```text
Snap the thumbnail.
```

```text
Grab images. Build more.
```

Untuk project open-source, pilihan yang paling fleksibel:

> **Grab thumbnails. Instantly.**

---

# 23. Brand Architecture Recommendation

Struktur visual yang direkomendasikan:

```text
INSTAPPER
│
├── Symbol
│   └── Extracted Image
│
├── Brand Typeface
│   └── Sora
│
├── UI Typeface
│   └── Inter
│
├── Code Typeface
│   └── JetBrains Mono
│
└── Core Colors
    ├── Indigo
    ├── Blue
    ├── Cyan
    └── Mint
```

---

# 24. Final Recommended Style

Arah visual utama Instapper:

> **A clean modern developer tool with energetic image-extraction branding.**

Kombinasi final:

| Category | Recommendation |
|---|---|
| Logo Concept | Extracted Image |
| Logo Style | Rounded geometric |
| Brand Typeface | Sora |
| UI Typeface | Inter |
| Mono Typeface | JetBrains Mono |
| Primary | `#635BFF` |
| Secondary | `#2563FF` |
| Highlight | `#22D3EE` |
| Accent | `#4AE3B5` |
| Dark Background | `#090B12` |
| Dark Surface | `#111318` |
| Light Background | `#F8FAFC` |
| Light Surface | `#FFFFFF` |
| Recommended Theme | Dark-first |
| Visual Character | Modern / Developer / Fast / Friendly |

---

## Closing Principle

Setiap keputusan visual Instapper sebaiknya mengikuti satu prinsip:

> **Simple enough for a browser icon, distinctive enough to become a recognizable open-source brand.**

Logo adalah elemen paling expressive. UI di sekitarnya sebaiknya lebih tenang agar identitas brand tetap terasa kuat tanpa membuat produk terlihat ramai.
