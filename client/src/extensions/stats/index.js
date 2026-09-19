// Statistiky (B8, kontrakt kap. 12.2): obrazovka #/statistiky a položka v menu.
import './stats.css';
import { registerScreen } from '../../core/screens.js';
import { registerHeaderItem } from '../../core/header.js';
import { renderStats } from './screen.js';

const STATS_ICON = '<path d="M3.5 13V8.5M8 13V3.5M12.5 13V6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';

registerScreen({ name: 'stats', path: '/statistiky', render: renderStats });
registerHeaderItem({ id: 'statistiky', order: 50, label: 'Stats', href: '#/statistiky', routes: ['stats'], icon: STATS_ICON });
