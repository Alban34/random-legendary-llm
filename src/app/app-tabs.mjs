export const APP_TABS = [
  {
    id: 'browse',
    label: 'Browse',
    shortLabel: 'Browse',
    icon: '📚',
    description: 'Explore included sets and collection coverage.'
  },
  {
    id: 'collection',
    label: 'Collection',
    shortLabel: 'Collection',
    icon: '🗂️',
    description: 'Review owned sets, persistence, and usage totals.'
  },
  {
    id: 'new-game',
    label: 'New Game',
    shortLabel: 'New Game',
    icon: '⚡',
    description: 'Generate, regenerate, and accept setups.'
  },
  {
    id: 'history',
    label: 'History',
    shortLabel: 'History',
    icon: '🕘',
    description: 'Inspect accepted setups and reset actions.'
  },
  {
    id: 'backup',
    label: 'Backup',
    shortLabel: 'Backup',
    icon: '💾',
    description: 'Export and restore portable app backups.'
  }
];

export const DEFAULT_TAB_ID = 'browse';

const TAB_IDS = APP_TABS.map((tab) => tab.id);

export function normalizeSelectedTab(value) {
  return TAB_IDS.includes(value) ? value : DEFAULT_TAB_ID;
}

export function getAdjacentTabId(currentId, direction) {
  const currentIndex = TAB_IDS.indexOf(normalizeSelectedTab(currentId));

  switch (direction) {
    case 'first':
      return TAB_IDS[0];
    case 'last':
      return TAB_IDS.at(-1);
    case 'previous':
      return TAB_IDS[(currentIndex - 1 + TAB_IDS.length) % TAB_IDS.length];
    case 'next':
    default:
      return TAB_IDS[(currentIndex + 1) % TAB_IDS.length];
  }
}

