export const attackIcons = [
  {
    id: 'bite',
    name: 'Ísırma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <path d="M 40 35 Q 30 45 35 55 Q 45 50 50 52 Q 55 50 65 55 Q 70 45 60 35" fill="#ff006e" stroke="#ff006e" stroke-width="1"/>
      <circle cx="38" cy="48" r="3" fill="#00f3ff"/>
      <circle cx="62" cy="48" r="3" fill="#00f3ff"/>
    </svg>`,
  },
  {
    id: 'scratch',
    name: 'Tırmalama',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <line x1="30" y1="35" x2="50" y2="55" stroke="#d946ef" stroke-width="3" stroke-linecap="round"/>
      <line x1="35" y1="25" x2="55" y2="45" stroke="#d946ef" stroke-width="3" stroke-linecap="round"/>
      <line x1="25" y1="45" x2="45" y2="65" stroke="#d946ef" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="8" fill="none" stroke="#00f3ff" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'tail-swing',
    name: 'Kuyruk Sallama',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <ellipse cx="40" cy="50" rx="15" ry="25" fill="none" stroke="#ff006e" stroke-width="3"/>
      <path d="M 35 30 Q 20 40 15 60 Q 20 75 35 70" fill="none" stroke="#ff006e" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="50" r="6" fill="#d946ef"/>
    </svg>`,
  },
  {
    id: 'stomp',
    name: 'Yere Basma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <rect x="35" y="55" width="30" height="25" rx="5" fill="#ff006e" opacity="0.7"/>
      <circle cx="40" cy="62" r="4" fill="#00f3ff"/>
      <circle cx="60" cy="62" r="4" fill="#00f3ff"/>
      <line x1="30" y1="82" x2="70" y2="82" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
      <path d="M 25 85 L 30 82 M 75 85 L 70 82" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'roar',
    name: 'Kükreme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="50" cy="40" r="18" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="50" cy="40" r="25" fill="none" stroke="#00f3ff" stroke-width="1" opacity="0.5"/>
      <circle cx="50" cy="40" r="32" fill="none" stroke="#ff006e" stroke-width="1" opacity="0.3"/>
      <line x1="45" y1="45" x2="43" y2="38" stroke="#d946ef" stroke-width="1"/>
      <line x1="55" y1="45" x2="57" y2="38" stroke="#d946ef" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'fire-breath',
    name: 'Ateş Nefesi',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="50" cy="35" r="10" fill="#ff006e"/>
      <circle cx="48" cy="33" r="6" fill="#fbbf24"/>
      <path d="M 50 45 Q 40 55 35 70 Q 50 75 65 70 Q 60 55 50 45" fill="#ff006e"/>
      <path d="M 50 50 Q 42 60 38 72 Q 50 76 62 72 Q 58 60 50 50" fill="#fbbf24" opacity="0.8"/>
      <path d="M 50 55 Q 45 62 42 70 Q 50 73 58 70 Q 55 62 50 55" fill="#fed7aa" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'ice-breath',
    name: 'Buz Nefesi',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <circle cx="50" cy="35" r="10" fill="#00f3ff"/>
      <circle cx="48" cy="33" r="6" fill="#cffafe"/>
      <path d="M 50 45 Q 40 55 35 70 Q 50 75 65 70 Q 60 55 50 45" fill="#00f3ff"/>
      <path d="M 50 50 Q 42 60 38 72 Q 50 76 62 72 Q 58 60 50 50" fill="#cffafe" opacity="0.8"/>
      <line x1="45" y1="55" x2="40" y2="68" stroke="#e0f2fe" stroke-width="1"/>
      <line x1="55" y1="55" x2="60" y2="68" stroke="#e0f2fe" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'lightning',
    name: 'Yıldırım',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <path d="M 50 20 L 45 40 L 55 40 L 40 75 L 50 55 L 40 55 L 60 20" fill="#fbbf24" stroke="#fbbf24" stroke-width="1"/>
      <path d="M 50 20 L 45 40 L 55 40 L 40 75 L 50 55 L 40 55 L 60 20" fill="none" stroke="#fef3c7" stroke-width="0.5" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'poison',
    name: 'Zehir',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" stroke-width="2"/>
      <circle cx="50" cy="35" r="12" fill="#8b5cf6"/>
      <path d="M 40 50 Q 35 60 40 75 Q 50 82 60 75 Q 65 60 60 50" fill="#8b5cf6" opacity="0.8"/>
      <circle cx="50" cy="35" r="7" fill="#c4b5fd" opacity="0.6"/>
      <circle cx="46" cy="62" r="2" fill="#e9d5ff"/>
      <circle cx="54" cy="68" r="2" fill="#e9d5ff"/>
    </svg>`,
  },
  {
    id: 'water',
    name: 'Su',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <path d="M 35 45 Q 40 55 50 50 Q 60 55 65 45" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 35 60 Q 40 70 50 65 Q 60 70 65 60" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 35 75 Q 40 85 50 80 Q 60 85 65 75" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="3" fill="#cffafe"/>
    </svg>`,
  },
  {
    id: 'earthquake',
    name: 'Deprem',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#92400e" stroke-width="2"/>
      <line x1="25" y1="50" x2="75" y2="50" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>
      <line x1="30" y1="35" x2="70" y2="35" stroke="#d946ef" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
      <line x1="30" y1="65" x2="70" y2="65" stroke="#d946ef" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
      <path d="M 35 25 L 40 30 M 40 30 L 35 35" stroke="#92400e" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 60 25 L 65 30 M 65 30 L 60 35" stroke="#92400e" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'jump-attack',
    name: 'Zıplama Saldırısı',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="50" cy="35" r="12" fill="#d946ef"/>
      <ellipse cx="50" cy="35" rx="8" ry="7" fill="none" stroke="#ff006e" stroke-width="1"/>
      <ellipse cx="45" cy="60" rx="8" ry="6" fill="none" stroke="#d946ef" stroke-width="2"/>
      <ellipse cx="55" cy="60" rx="8" ry="6" fill="none" stroke="#d946ef" stroke-width="2"/>
      <path d="M 50 25 Q 45 15 50 5" fill="none" stroke="#ff006e" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'headbutt',
    name: 'Başla Vuruş',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="50" cy="35" r="16" fill="#ff006e"/>
      <circle cx="46" cy="32" r="3" fill="#00f3ff"/>
      <circle cx="54" cy="32" r="3" fill="#00f3ff"/>
      <line x1="50" y1="20" x2="50" y2="5" stroke="#d946ef" stroke-width="3" stroke-linecap="round"/>
      <path d="M 45 10 Q 50 5 55 10" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'ram',
    name: 'Çarptırma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <ellipse cx="50" cy="40" rx="16" ry="20" fill="#ff006e" opacity="0.7"/>
      <line x1="50" y1="25" x2="45" y2="15" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <line x1="50" y1="25" x2="55" y2="15" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 50 15 L 50 5" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
      <circle cx="50" cy="70" r="8" fill="none" stroke="#d946ef" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'claw',
    name: 'Pençe',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="50" cy="45" r="10" fill="#ff006e"/>
      <line x1="42" y1="50" x2="30" y2="60" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
      <line x1="50" y1="55" x2="50" y2="70" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
      <line x1="58" y1="50" x2="70" y2="60" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
      <circle cx="28" cy="62" r="2" fill="#d946ef"/>
      <circle cx="50" cy="72" r="2" fill="#d946ef"/>
      <circle cx="72" cy="62" r="2" fill="#d946ef"/>
    </svg>`,
  },
  {
    id: 'venom',
    name: 'Zehir Püskürtme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" stroke-width="2"/>
      <circle cx="50" cy="40" r="10" fill="#8b5cf6"/>
      <path d="M 45 50 L 30 65" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
      <path d="M 50 52 L 50 75" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
      <path d="M 55 50 L 70 65" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
      <circle cx="28" cy="67" r="2" fill="#c4b5fd"/>
      <circle cx="50" cy="77" r="2" fill="#c4b5fd"/>
      <circle cx="72" cy="67" r="2" fill="#c4b5fd"/>
    </svg>`,
  },
  {
    id: 'stone',
    name: 'Taş Fırlatma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#92400e" stroke-width="2"/>
      <circle cx="45" cy="45" r="8" fill="#92400e"/>
      <circle cx="45" cy="45" r="5" fill="#d2b48c" opacity="0.7"/>
      <path d="M 60 30 Q 65 20 70 10" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>
      <polygon points="70,10 72,15 75,12" fill="#92400e"/>
      <circle cx="30" cy="70" r="6" fill="#92400e" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'wind',
    name: 'Rüzgar',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <path d="M 25 40 Q 40 35 60 40" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 30 55 Q 50 50 75 55" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 20 70 Q 45 65 70 70" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="75" cy="40" r="2" fill="#cffafe"/>
      <circle cx="80" cy="55" r="2" fill="#cffafe"/>
      <circle cx="75" cy="70" r="2" fill="#cffafe"/>
    </svg>`,
  },
  {
    id: 'meteor',
    name: 'Meteor',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="40" cy="30" r="10" fill="#ff006e"/>
      <circle cx="40" cy="30" r="7" fill="#fbbf24" opacity="0.8"/>
      <circle cx="38" cy="28" r="3" fill="#fed7aa"/>
      <path d="M 45 38 L 50 50 L 42 48" stroke="#ff006e" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 48 40 L 52 48 L 50 46" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="50" cy="70" r="8" fill="none" stroke="#d946ef" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'laser',
    name: 'Lazer',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="50" cy="40" r="8" fill="#ff006e"/>
      <circle cx="50" cy="40" r="5" fill="#fbbf24"/>
      <line x1="50" y1="48" x2="50" y2="75" stroke="#ff006e" stroke-width="3" stroke-linecap="round"/>
      <line x1="50" y1="48" x2="50" y2="75" stroke="#fbbf24" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
      <circle cx="50" cy="78" r="3" fill="#ff006e"/>
    </svg>`,
  },
  {
    id: 'explosion',
    name: 'Patlama',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="50" cy="50" r="20" fill="#ff006e" opacity="0.6"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#ff006e" stroke-width="1" opacity="0.4"/>
      <circle cx="50" cy="50" r="15" fill="#fbbf24" opacity="0.5"/>
      <path d="M 50 30 L 55 40 M 50 30 L 45 40 M 35 50 L 45 48 M 65 50 L 55 48" stroke="#ff006e" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'energy-ball',
    name: 'Enerji Topu',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="50" cy="45" r="12" fill="#d946ef" opacity="0.8"/>
      <circle cx="50" cy="45" r="10" fill="#f0abfc" opacity="0.6"/>
      <circle cx="50" cy="45" r="7" fill="#fbbf24"/>
      <circle cx="50" cy="45" r="3" fill="#fff"/>
      <circle cx="42" cy="40" r="1.5" fill="#cffafe"/>
      <circle cx="58" cy="40" r="1.5" fill="#cffafe"/>
      <circle cx="50" cy="55" r="1.5" fill="#cffafe"/>
    </svg>`,
  },
  {
    id: 'freeze',
    name: 'Dondurma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <circle cx="50" cy="45" r="12" fill="#00f3ff" opacity="0.7"/>
      <circle cx="50" cy="45" r="9" fill="#cffafe" opacity="0.8"/>
      <path d="M 50 38 L 50 52 M 44 45 L 56 45 M 45 40 L 55 50 M 55 40 L 45 50" stroke="#00f3ff" stroke-width="1" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'burn',
    name: 'Yakma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <path d="M 50 30 Q 45 40 45 50 Q 45 60 50 65 Q 55 60 55 50 Q 55 40 50 30" fill="#ff006e" opacity="0.7"/>
      <path d="M 50 35 Q 48 42 48 50 Q 48 57 50 62 Q 52 57 52 50 Q 52 42 50 35" fill="#fbbf24" opacity="0.8"/>
      <circle cx="50" cy="50" r="2" fill="#fff" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'shock',
    name: 'Şok',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.5"/>
      <circle cx="50" cy="50" r="25" fill="none" stroke="#fbbf24" stroke-width="0.5" opacity="0.3"/>
      <circle cx="50" cy="50" r="8" fill="#fbbf24"/>
      <circle cx="50" cy="50" r="5" fill="#fef3c7"/>
    </svg>`,
  },
  {
    id: 'acid',
    name: 'Asit',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" stroke-width="2"/>
      <circle cx="50" cy="40" r="10" fill="#22c55e"/>
      <circle cx="50" cy="40" r="7" fill="#86efac"/>
      <path d="M 45 52 Q 40 65 45 75" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
      <path d="M 50 55 Q 50 70 50 80" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
      <path d="M 55 52 Q 60 65 55 75" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
      <circle cx="45" cy="76" r="1.5" fill="#86efac" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'powder',
    name: 'Toz',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="50" cy="40" r="9" fill="#f59e0b"/>
      <circle cx="40" cy="55" r="3" fill="#fbbf24"/>
      <circle cx="60" cy="55" r="3" fill="#fbbf24"/>
      <circle cx="50" cy="70" r="3.5" fill="#fbbf24"/>
      <circle cx="35" cy="65" r="2" fill="#fed7aa" opacity="0.7"/>
      <circle cx="65" cy="65" r="2" fill="#fed7aa" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'spore',
    name: 'Spor',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" stroke-width="2"/>
      <circle cx="50" cy="45" r="8" fill="#8b5cf6"/>
      <circle cx="38" cy="55" r="4" fill="#a78bfa" opacity="0.7"/>
      <circle cx="62" cy="55" r="4" fill="#a78bfa" opacity="0.7"/>
      <circle cx="45" cy="70" r="3" fill="#c4b5fd" opacity="0.6"/>
      <circle cx="55" cy="72" r="3" fill="#c4b5fd" opacity="0.6"/>
      <circle cx="50" cy="80" r="2.5" fill="#e9d5ff" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'bubble',
    name: 'Baloncuk',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <circle cx="50" cy="45" r="12" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <circle cx="50" cy="45" r="12" fill="#cffafe" opacity="0.2"/>
      <circle cx="48" cy="43" r="3" fill="#cffafe" opacity="0.6"/>
      <circle cx="35" cy="60" r="6" fill="none" stroke="#00f3ff" stroke-width="1.5" opacity="0.7"/>
      <circle cx="65" cy="65" r="5" fill="none" stroke="#00f3ff" stroke-width="1.5" opacity="0.6"/>
      <circle cx="50" cy="75" r="4" fill="none" stroke="#00f3ff" stroke-width="1.5" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'pulse',
    name: 'Nabız',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <path d="M 20 50 L 35 50 L 40 35 L 45 60 L 50 50 L 60 50 L 80 50" stroke="#d946ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="4" fill="#d946ef"/>
    </svg>`,
  },
  {
    id: 'wave',
    name: 'Dalga',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <path d="M 30 50 Q 35 40 40 50 T 60 50 T 80 50" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 30 65 Q 35 55 40 65 T 60 65 T 80 65" fill="none" stroke="#d946ef" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
      <circle cx="50" cy="50" r="2" fill="#cffafe"/>
    </svg>`,
  },
  {
    id: 'surge',
    name: 'Dalgalanma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="50" cy="50" r="25" fill="none" stroke="#d946ef" stroke-width="1.5" opacity="0.6"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="#d946ef" stroke-width="1" opacity="0.4"/>
      <path d="M 50 25 L 50 75" stroke="#ff006e" stroke-width="1" opacity="0.5"/>
      <path d="M 25 50 L 75 50" stroke="#ff006e" stroke-width="1" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'aura',
    name: 'Aura',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="50" cy="50" r="20" fill="#fbbf24" opacity="0.4"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.5"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="#fef3c7" stroke-width="1" opacity="0.7"/>
      <circle cx="50" cy="50" r="8" fill="#fef3c7" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'flash',
    name: 'Flaş',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="50" cy="50" r="30" fill="#fbbf24" opacity="0.5"/>
      <circle cx="50" cy="50" r="20" fill="#fef3c7" opacity="0.7"/>
      <circle cx="50" cy="50" r="10" fill="#fff" opacity="0.6"/>
      <path d="M 50 30 L 55 45 L 50 40 L 45 45 Z" fill="#fbbf24"/>
    </svg>`,
  },
  {
    id: 'glow',
    name: 'Işıltı',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="50" cy="50" r="22" fill="#d946ef" opacity="0.3"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#d946ef" stroke-width="0.5" opacity="0.6"/>
      <circle cx="50" cy="50" r="16" fill="none" stroke="#f0abfc" stroke-width="0.5" opacity="0.8"/>
      <circle cx="50" cy="50" r="8" fill="#f0abfc" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'punch',
    name: 'Yumruk',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <rect x="38" y="40" width="24" height="20" rx="3" fill="#ff006e"/>
      <circle cx="42" cy="45" r="2.5" fill="#00f3ff"/>
      <circle cx="50" cy="45" r="2.5" fill="#00f3ff"/>
      <circle cx="58" cy="45" r="2.5" fill="#00f3ff"/>
      <path d="M 50 60 L 50 75" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'kick',
    name: 'Tekme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="50" cy="40" r="10" fill="#ff006e"/>
      <circle cx="50" cy="40" r="6" fill="#00f3ff" opacity="0.6"/>
      <rect x="45" y="50" width="10" height="25" rx="2" fill="#ff006e"/>
      <rect x="46" y="76" width="8" height="12" rx="2" fill="#d946ef"/>
      <path d="M 50 50 L 50 75" stroke="#00f3ff" stroke-width="0.5" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'spin',
    name: 'Dönerken Saldırı',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="#d946ef" stroke-width="2" stroke-dasharray="5,5" opacity="0.7"/>
      <path d="M 50 30 L 55 40 L 60 35 Q 70 40 65 50 Q 70 60 60 65 L 55 60 L 50 70 L 45 60 L 40 65 Q 30 60 35 50 Q 30 40 40 35 L 45 40" fill="#d946ef" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'wing-attack',
    name: 'Kanat Saldırısı',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <circle cx="50" cy="45" r="8" fill="#00f3ff"/>
      <path d="M 42 48 Q 25 40 20 55 Q 25 60 42 52" fill="#d946ef" opacity="0.7"/>
      <path d="M 58 48 Q 75 40 80 55 Q 75 60 58 52" fill="#d946ef" opacity="0.7"/>
      <path d="M 40 50 Q 22 45 15 58 Q 22 65 40 55" fill="#ff006e" opacity="0.5"/>
      <path d="M 60 50 Q 78 45 85 58 Q 78 65 60 55" fill="#ff006e" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'peck',
    name: 'Gagalama',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="50" cy="35" r="12" fill="#ff006e"/>
      <polygon points="45,48 55,48 50,60" fill="#fbbf24"/>
      <circle cx="47" cy="32" r="2" fill="#00f3ff"/>
      <circle cx="53" cy="32" r="2" fill="#00f3ff"/>
      <path d="M 50 60 L 50 75" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'spit',
    name: 'Tükürme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" stroke-width="2"/>
      <circle cx="50" cy="40" r="10" fill="#22c55e"/>
      <circle cx="50" cy="40" r="6" fill="#86efac" opacity="0.7"/>
      <path d="M 55 45 L 70 35 M 55 47 L 72 42 M 55 49 L 70 50" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="72" cy="36" r="2" fill="#86efac"/>
    </svg>`,
  },
  {
    id: 'stab',
    name: 'Bıçaklama',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" stroke-width="2"/>
      <circle cx="50" cy="40" r="8" fill="#8b5cf6"/>
      <polygon points="50,20 48,50 52,50" fill="#8b5cf6" stroke="#8b5cf6" stroke-width="1"/>
      <line x1="50" y1="18" x2="50" y2="10" stroke="#a78bfa" stroke-width="1"/>
      <path d="M 48 25 Q 45 22 43 20" stroke="#a78bfa" stroke-width="0.5"/>
    </svg>`,
  },
  {
    id: 'slash',
    name: 'Kesme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <path d="M 30 30 L 70 70" stroke="#ff006e" stroke-width="3" stroke-linecap="round"/>
      <path d="M 28 28 L 72 72" stroke="#d946ef" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <circle cx="50" cy="50" r="8" fill="none" stroke="#fbbf24" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'crush',
    name: 'Ezme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#92400e" stroke-width="2"/>
      <rect x="30" y="30" width="40" height="8" rx="2" fill="#92400e"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="#92400e" stroke-width="2"/>
      <circle cx="50" cy="50" r="10" fill="#d2b48c" opacity="0.5"/>
      <line x1="35" y1="50" x2="65" y2="50" stroke="#ff006e" stroke-width="1" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'smash',
    name: 'Çarpma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <rect x="40" y="20" width="20" height="25" rx="3" fill="#ff006e"/>
      <circle cx="50" cy="20" r="4" fill="#fbbf24"/>
      <path d="M 30 50 L 50 50 L 70 50" stroke="#d946ef" stroke-width="2" stroke-linecap="round"/>
      <circle cx="30" cy="50" r="2" fill="#d946ef"/>
      <circle cx="70" cy="50" r="2" fill="#d946ef"/>
    </svg>`,
  },
  {
    id: 'beam',
    name: 'Işın',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="50" cy="35" r="8" fill="#fbbf24"/>
      <circle cx="50" cy="35" r="5" fill="#fef3c7"/>
      <rect x="45" y="43" width="10" height="35" fill="#fbbf24" opacity="0.7"/>
      <rect x="46" y="43" width="8" height="35" fill="#fef3c7" opacity="0.5"/>
      <circle cx="50" cy="80" r="4" fill="#fbbf24"/>
    </svg>`,
  },
  {
    id: 'nova',
    name: 'Nova',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <circle cx="50" cy="50" r="12" fill="#ff006e"/>
      <circle cx="50" cy="50" r="18" fill="none" stroke="#ff006e" stroke-width="1" opacity="0.6"/>
      <circle cx="50" cy="50" r="25" fill="none" stroke="#d946ef" stroke-width="0.5" opacity="0.4"/>
      <path d="M 50 20 L 52 35 M 80 50 L 65 48 M 50 80 L 48 65 M 20 50 L 35 52" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'inferno',
    name: 'İnferno',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#ff006e" stroke-width="2"/>
      <path d="M 40 45 Q 35 50 40 70 Q 50 80 60 70 Q 65 50 60 45" fill="#ff006e" opacity="0.7"/>
      <path d="M 42 48 Q 38 52 42 68 Q 50 77 58 68 Q 62 52 58 48" fill="#fbbf24" opacity="0.8"/>
      <path d="M 44 50 Q 42 54 44 65 Q 50 72 56 65 Q 58 54 56 50" fill="#fed7aa" opacity="0.6"/>
      <circle cx="50" cy="60" r="3" fill="#fff" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'blizzard',
    name: 'Buzlu Fırtına',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#00f3ff" stroke-width="2"/>
      <circle cx="40" cy="40" r="8" fill="#00f3ff" opacity="0.6"/>
      <circle cx="60" cy="55" r="7" fill="#00f3ff" opacity="0.6"/>
      <circle cx="50" cy="70" r="6" fill="#00f3ff" opacity="0.6"/>
      <path d="M 50 30 L 50 70" stroke="#cffafe" stroke-width="1" opacity="0.5"/>
      <path d="M 30 50 L 70 50" stroke="#cffafe" stroke-width="1" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'eclipse',
    name: 'Tutulma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" stroke-width="2"/>
      <circle cx="45" cy="45" r="16" fill="#1f2937" opacity="0.8"/>
      <circle cx="50" cy="50" r="16" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="55" cy="55" r="12" fill="none" stroke="#00f3ff" stroke-width="1" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'earthquake-2',
    name: 'Büyük Deprem',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#92400e" stroke-width="2"/>
      <path d="M 20 75 Q 30 70 40 75 T 60 75 T 80 75" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>
      <path d="M 25 60 Q 35 55 45 60 T 65 60 T 85 60" stroke="#92400e" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
      <circle cx="50" cy="40" r="3" fill="#ff006e"/>
    </svg>`,
  },
  {
    id: 'mirage',
    name: 'Serap',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="35" cy="45" r="10" fill="#d946ef" opacity="0.4"/>
      <circle cx="50" cy="50" r="10" fill="#d946ef" opacity="0.3"/>
      <circle cx="65" cy="45" r="10" fill="#d946ef" opacity="0.4"/>
      <path d="M 30 70 Q 40 65 50 70 T 70 70" stroke="#f0abfc" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'void',
    name: 'Boşluk',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" stroke-width="2"/>
      <circle cx="50" cy="50" r="25" fill="#1f2937" opacity="0.6"/>
      <circle cx="50" cy="50" r="20" fill="#374151" opacity="0.5"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="#6b7280" stroke-width="1" opacity="0.4"/>
      <circle cx="50" cy="50" r="3" fill="#d946ef" opacity="0.8"/>
    </svg>`,
  },
  {
    id: 'prism',
    name: 'Prizma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <polygon points="50,30 65,65 35,65" fill="none" stroke="#fbbf24" stroke-width="2"/>
      <path d="M 50 30 L 50 65" stroke="#d946ef" stroke-width="1" opacity="0.6"/>
      <circle cx="35" cy="65" r="2" fill="#00f3ff"/>
      <circle cx="65" cy="65" r="2" fill="#00f3ff"/>
      <circle cx="50" cy="30" r="2" fill="#ff006e"/>
    </svg>`,
  },
  {
    id: 'quantum',
    name: 'Kuantum',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
      <circle cx="50" cy="50" r="10" fill="#d946ef" opacity="0.5"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="#d946ef" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="#d946ef" stroke-width="0.5" stroke-dasharray="3,3" opacity="0.4"/>
      <circle cx="40" cy="50" r="2" fill="#00f3ff"/>
      <circle cx="60" cy="50" r="2" fill="#00f3ff"/>
    </svg>`,
  },
];

export function getAttackIcon(attackId: string) {
  return attackIcons.find(icon => icon.id === attackId);
}

export function getAllAttackIcons() {
  return attackIcons;
}
