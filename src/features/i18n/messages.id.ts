import type { Message, MessageKey } from './locale';

/**
 * Indonesian messages. Typed as a complete record of the English key set, so a
 * missing or misspelled key fails the build rather than showing a blank label.
 *
 * Indonesian does not inflect for number, so the plural branches the English
 * catalog needs are simply absent here.
 */
export const id: Record<MessageKey, Message> = {
  // Shared
  'common.cancel': 'Batal',
  'common.ok': 'Oke',
  'common.csv': 'CSV',
  'common.zip': 'ZIP',

  // Navigation
  'nav.home': 'Beranda',
  'nav.history': 'Riwayat',
  'nav.about': 'Tentang',
  'nav.settings': 'Pengaturan',
  'nav.ariaLabel': 'Navigasi utama',

  // Header
  'header.popout': 'Buka di jendela baru',
  'header.backHome': 'Kembali ke Beranda',
  'header.backHistory': 'Kembali ke Riwayat',
  'header.connected': 'Terhubung',
  'header.ready': 'Siap',
  'header.switchTab': 'Pindah ke tab yang terhubung',
  'header.noTab': 'Tab Instagram tidak ditemukan',
  'header.themeToLight': 'Ganti ke mode terang',
  'header.themeToDark': 'Ganti ke mode gelap',

  // Stats counter
  'stats.label': 'Dalam rentang / total',
  'stats.title': '{count} dari {total} thumbnail masuk dalam rentang tanggal yang dipilih',

  // Action bar
  'action.pause': 'Jeda',
  'action.pauseHint': 'Jeda pengambilan',
  'action.continue': 'Lanjutkan',
  'action.continueHint': 'Lanjutkan pengambilan',
  'action.start': 'Mulai',
  'action.startHint': 'Mulai pengambilan',
  'action.reset': 'Reset',
  'action.csvHint': 'Unduh CSV — sebagian tautan kedaluwarsa bisa gagal',
  'action.exportBlocked': 'Ekspor bisa dipakai setelah pengambilan berhenti.',

  // Export progress
  'progress.starting': 'Memulai…',
  'progress.fetching': 'Mengambil {done}/{total}',
  'progress.creatingZip': 'Membuat ZIP…',

  // Export modal
  'export.title': 'Ekspor ZIP',
  'export.count': (p) => `${p.count} thumbnail akan diunduh.`,
  'export.layoutLegend': 'Susunan ZIP',
  'export.flat': 'Tanpa pengurutan',
  'export.flatHint': 'Semua file di tingkat teratas',
  'export.byDate': 'Kelompokkan per tanggal',
  'export.byDateHint': 'Folder seperti 2025-03/, terlama lebih dulu',
  'export.confirm': 'Ekspor',
  'export.progressTitle': 'Mengekspor ZIP',
  'export.progressBody': (p) =>
    `Mengunduh ${p.count} thumbnail dan ${
      p.layout === 'by-date' ? 'menyusunnya per bulan' : 'menaruhnya dalam satu folder'
    }.`,
  'export.doneTitle': 'Unduhan selesai',
  'export.doneBody': (p) =>
    `${p.exported} thumbnail berhasil diunduh${
      Number(p.failed) > 0 ? `, ${p.failed} gagal diambil` : ''
    }.`,
  'export.doneHint': 'Jendela ini menutup sendiri dalam beberapa detik.',
  'export.errorTitle': 'Ekspor gagal',
  'export.errorFallback': 'Terjadi kesalahan saat membuat ZIP.',

  // Reset dialog (extract page)
  'clear.title': 'Mulai koleksi baru?',
  'clear.description':
    '{count} thumbnail dalam rentang tanggal yang dipilih disimpan ke Riwayat, lalu koleksi dibersihkan supaya Anda bisa mengambil dari awal.',
  'clear.confirm': 'Simpan dan bersihkan',

  // Clear history dialog
  'clearHistory.title': 'Hapus semua riwayat?',
  'clearHistory.description':
    'Semua sesi yang tersimpan akan dihapus permanen. ZIP atau CSV yang sudah Anda ekspor tidak terpengaruh.',
  'clearHistory.confirm': 'Hapus semua',

  // Home
  'home.title': 'Fitur',
  'home.tagline': 'Ambil thumbnail. Seketika.',
  'home.extract.title': 'Ambil Thumbnail',
  'home.extract.description': 'Ambil thumbnail dari halaman Instagram',

  // Extract page
  'extract.title': 'Ambil thumbnail',
  'extract.tagline': 'Ambil thumbnail. Seketika.',
  'extract.dateRange': 'Rentang tanggal',
  'extract.from': 'Tanggal awal',
  'extract.to': 'Tanggal akhir',
  'extract.toWord': 'sampai',

  // Date range presets
  'range.all': 'Semua tanggal',
  'range.1m': '1 bulan terakhir',
  'range.3m': '3 bulan terakhir',
  'range.6m': '6 bulan terakhir',
  'range.8m': '8 bulan terakhir',
  'range.12m': '12 bulan terakhir',
  'range.custom': 'Rentang khusus',

  // Status messages
  'msg.downloadStarted': 'Unduhan dimulai.',
  'msg.downloadFailed': 'Unduhan gagal.',
  'msg.exportCanceled': 'Ekspor dibatalkan.',
  'msg.exportFailed': 'Ekspor gagal.',
  'msg.exportedAll': '{count} gambar berhasil diekspor.',
  'msg.exportedSome': '{count} gambar diekspor, {failed} gagal.',
  'msg.dataCleared': 'Data sudah dibersihkan.',
  'msg.stoppedByRange': 'Berhenti: sudah melewati postingan yang lebih lama dari rentang tanggal.',
  'msg.refreshInstagram': 'Muat ulang halaman Instagram lalu coba lagi.',

  // History
  'history.title': 'Riwayat',
  'history.subtitle': 'Sesi pengambilan sebelumnya',
  'history.activeSession': 'Sesi Aktif',
  'history.collected': (p) => `${p.count} thumbnail terkumpul`,
  'history.deleteSession': 'Hapus sesi',
  'history.clearAll': 'Hapus Semua Riwayat',
  'history.empty': 'Belum ada riwayat',

  // Session detail
  'detail.title': 'Detail Sesi',
  'detail.date': 'Tanggal',
  'detail.source': 'Sumber',
  'detail.thumbnails': 'Thumbnail',
  'detail.downloading': 'Mengunduh…',
  'detail.noImages': 'Gambar tidak disimpan pada sesi ini. Ambil ulang untuk mengunduhnya.',

  // About
  'about.version': 'Versi',
  'about.contributors': 'Kontributor',
  'about.source': 'Sumber',
  'about.disclaimer': 'Tidak berafiliasi dengan Instagram atau Meta. Gunakan dengan bijak.',

  // Settings
  'settings.title': 'Pengaturan',
  'settings.subtitle': 'Preferensi',
  'settings.exportSection': 'Ekspor',
  'settings.zipFormat': 'Format gambar ZIP',
  'settings.zipFormatHelp':
    'Setiap thumbnail dikonversi ke format ini saat mengekspor ZIP. Gambar yang sudah dalam format ini dibiarkan apa adanya.',
  'settings.jpeg': 'JPEG',
  'settings.jpegHint': 'Ukuran lebih kecil',
  'settings.png': 'PNG',
  'settings.pngHint': 'Tanpa kompresi',
  'settings.languageSection': 'Bahasa',
  'settings.language': 'Bahasa antarmuka',
  'settings.languageHelp': 'Langsung berlaku di seluruh ekstensi.',
  'settings.english': 'English',
  'settings.indonesian': 'Bahasa Indonesia',
};
