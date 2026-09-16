import type { Message } from './locale';

/**
 * English messages. This file is the source of truth for the key set — every
 * other catalog is typed against it, so a missing translation is a build error.
 */
export const en = {
  // Shared
  'common.cancel': 'Cancel',
  'common.ok': 'OK',
  'common.csv': 'CSV',
  'common.zip': 'ZIP',

  // Navigation
  'nav.home': 'Home',
  'nav.history': 'History',
  'nav.about': 'About',
  'nav.settings': 'Settings',
  'nav.ariaLabel': 'Main navigation',

  // Header
  'header.popout': 'Pop out to new window',
  'header.backHome': 'Back to Home',
  'header.backHistory': 'Back to History',
  'header.connected': 'Connected',
  'header.ready': 'Ready',
  'header.switchTab': 'Switch to connected tab',
  'header.noTab': 'No Instagram tab found',
  'header.themeToLight': 'Switch to light mode',
  'header.themeToDark': 'Switch to dark mode',

  // Stats counter
  'stats.label': 'In range / total',
  'stats.title': '{count} of {total} thumbnails fall inside the selected date range',

  // Action bar
  'action.pause': 'Pause',
  'action.pauseHint': 'Pause scraping',
  'action.continue': 'Continue',
  'action.continueHint': 'Continue scraping',
  'action.start': 'Start',
  'action.startHint': 'Start scraping',
  'action.reset': 'Reset',
  'action.csvHint': 'Download CSV — some expired links may fail',
  'action.exportBlocked': 'Exports unlock once scraping stops.',

  // Export progress
  'progress.starting': 'Starting…',
  'progress.fetching': 'Fetching {done}/{total}',
  'progress.creatingZip': 'Creating ZIP…',

  // Export modal
  'export.title': 'Export ZIP',
  'export.count': (p) =>
    `${p.count} thumbnail${Number(p.count) === 1 ? '' : 's'} will be downloaded.`,
  'export.layoutLegend': 'ZIP layout',
  'export.flat': 'No sorting',
  'export.flatHint': 'Every file at the top level',
  'export.byDate': 'Group by date',
  'export.byDateHint': 'Folders like 2025-03/, oldest first',
  'export.confirm': 'Export',
  'export.progressTitle': 'Exporting ZIP',
  'export.progressBody': (p) =>
    `Downloading ${p.count} thumbnail${Number(p.count) === 1 ? '' : 's'} and ${
      p.layout === 'by-date' ? 'filing them by month' : 'keeping one flat folder'
    }.`,
  'export.doneTitle': 'Download complete',
  'export.doneBody': (p) =>
    `${p.exported} thumbnail${Number(p.exported) === 1 ? '' : 's'} downloaded${
      Number(p.failed) > 0 ? `, ${p.failed} could not be fetched` : ''
    }.`,
  'export.doneHint': 'This closes on its own in a few seconds.',
  'export.errorTitle': 'Export failed',
  'export.errorFallback': 'Something went wrong while building the ZIP.',

  // Reset dialog (extract page)
  'clear.title': 'Start a new collection?',
  'clear.description':
    'The current session is saved to History first, then the thumbnails are cleared so you can scrape fresh.',
  'clear.confirm': 'Save and clear',

  // Clear history dialog
  'clearHistory.title': 'Delete all history?',
  'clearHistory.description':
    'This permanently removes every saved session. Any ZIP or CSV you already exported is not affected.',
  'clearHistory.confirm': 'Delete all',

  // Home
  'home.title': 'Features',
  'home.tagline': 'Grab thumbnails. Instantly.',
  'home.extract.title': 'Extract Thumbnail',
  'home.extract.description': 'Scrape thumbnails from Instagram pages',

  // Extract page
  'extract.title': 'Extract thumbnails',
  'extract.tagline': 'Grab thumbnails. Instantly.',
  'extract.dateRange': 'Date range',
  'extract.from': 'From date',
  'extract.to': 'To date',
  'extract.toWord': 'to',

  // Date range presets
  'range.all': 'All dates',
  'range.1m': 'Last 1 month',
  'range.3m': 'Last 3 months',
  'range.6m': 'Last 6 months',
  'range.8m': 'Last 8 months',
  'range.12m': 'Last 12 months',
  'range.custom': 'Custom range',

  // Status messages
  'msg.downloadStarted': 'Download started.',
  'msg.downloadFailed': 'Download failed.',
  'msg.exportCanceled': 'Export canceled.',
  'msg.exportFailed': 'Export failed.',
  'msg.exportedAll': 'Exported {count} images.',
  'msg.exportedSome': 'Exported {count} images, {failed} failed.',
  'msg.dataCleared': 'Data cleared.',
  'msg.stoppedByRange': 'Stopped: reached posts older than the selected date range.',
  'msg.refreshInstagram': 'Refresh the Instagram page and try again.',

  // History
  'history.title': 'History',
  'history.subtitle': 'Past scraping sessions',
  'history.activeSession': 'Active Session',
  'history.collected': (p) => `${p.count} thumbnail${Number(p.count) === 1 ? '' : 's'} collected`,
  'history.deleteSession': 'Delete session',
  'history.clearAll': 'Clear All History',
  'history.empty': 'No history yet',

  // Session detail
  'detail.title': 'Session Detail',
  'detail.date': 'Date',
  'detail.source': 'Source',
  'detail.thumbnails': 'Thumbnails',
  'detail.downloading': 'Downloading…',
  'detail.noImages': 'Images were not stored in this session. Re-scrape to download.',

  // About
  'about.version': 'Version',
  'about.contributors': 'Contributors',
  'about.source': 'Source',
  'about.disclaimer': 'Not affiliated with Instagram or Meta. Use responsibly.',

  // Settings
  'settings.title': 'Settings',
  'settings.subtitle': 'Preferences',
  'settings.exportSection': 'Export',
  'settings.zipFormat': 'ZIP image format',
  'settings.zipFormatHelp':
    'Every thumbnail is converted to this format when exporting a ZIP. Images already in this format are kept untouched.',
  'settings.jpeg': 'JPEG',
  'settings.jpegHint': 'Smaller files',
  'settings.png': 'PNG',
  'settings.pngHint': 'Lossless',
  'settings.languageSection': 'Language',
  'settings.language': 'Interface language',
  'settings.languageHelp': 'Applies immediately, everywhere in the extension.',
  'settings.english': 'English',
  'settings.indonesian': 'Bahasa Indonesia',
} satisfies Record<string, Message>;
