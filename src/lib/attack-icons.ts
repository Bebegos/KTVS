export const attackIcons = [
  {
    id: 'bite',
    name: 'Ísırma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-bite" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <path d="M 35 30 Q 30 35 28 45 Q 25 55 35 60 Q 50 65 65 60 Q 75 55 72 45 Q 70 35 65 30" fill="#c0392b" stroke="#c0392b" stroke-width="1.5"/>
      <path d="M 38 38 L 48 52 M 62 38 L 52 52" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round" filter="url(#glow-bite)"/>
      <circle cx="40" cy="45" r="2.5" fill="#fff" opacity="0.8"/>
      <circle cx="60" cy="45" r="2.5" fill="#fff" opacity="0.8"/>
      <path d="M 35 60 L 32 70 M 42 62 L 42 72 M 50 63 L 50 73 M 58 62 L 58 72 M 65 60 L 68 70" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'claw',
    name: 'Pençe',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-claw">
          <feGaussianBlur stdDeviation="2"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <ellipse cx="50" cy="40" rx="12" ry="14" fill="#c0392b"/>
      <path d="M 38 52 L 25 70 M 50 54 L 50 75 M 62 52 L 75 70 M 45 55 L 38 72 M 55 55 L 62 72" stroke="#b8860b" stroke-width="3" stroke-linecap="round" filter="url(#glow-claw)"/>
      <circle cx="25" cy="72" r="3" fill="#b8860b"/>
      <circle cx="50" cy="77" r="3" fill="#b8860b"/>
      <circle cx="75" cy="72" r="3" fill="#b8860b"/>
      <circle cx="38" cy="74" r="2.5" fill="#b8860b"/>
      <circle cx="62" cy="74" r="2.5" fill="#b8860b"/>
    </svg>`,
  },
  {
    id: 'tail-swing',
    name: 'Kuyruk Sallama',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <ellipse cx="40" cy="45" rx="14" ry="18" fill="none" stroke="#c0392b" stroke-width="3"/>
      <path d="M 35 28 Q 15 35 10 55 Q 12 75 35 78 Q 50 80 45 55" fill="#c0392b" opacity="0.6" stroke="#c0392b" stroke-width="2"/>
      <path d="M 35 28 Q 15 35 10 55 Q 12 75 35 78" fill="none" stroke="#b8860b" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="8" cy="56" r="4" fill="#b8860b"/>
      <circle cx="40" cy="45" r="7" fill="#d4af37" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'stomp',
    name: 'Yere Basma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <rect x="30" y="35" width="40" height="35" rx="6" fill="#c0392b" opacity="0.5" stroke="#c0392b" stroke-width="2"/>
      <circle cx="38" cy="58" r="5" fill="#d4af37"/>
      <circle cx="62" cy="58" r="5" fill="#d4af37"/>
      <path d="M 25 75 L 75 75 L 70 85 L 30 85 Z" fill="#6b4423" opacity="0.6"/>
      <line x1="20" y1="78" x2="80" y2="78" stroke="#b8860b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 25 77 L 22 82 M 40 77 L 40 83 M 60 77 L 60 83 M 75 77 L 78 82" stroke="#b8860b" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'roar',
    name: 'Kükreme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-roar">
          <feGaussianBlur stdDeviation="3"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#b8860b" stroke-width="2.5"/>
      <circle cx="50" cy="38" r="16" fill="#b8860b" stroke="#b8860b" stroke-width="2"/>
      <circle cx="50" cy="38" r="22" fill="none" stroke="#b8860b" stroke-width="1.5" opacity="0.6" filter="url(#glow-roar)"/>
      <circle cx="50" cy="38" r="28" fill="none" stroke="#c0392b" stroke-width="1" opacity="0.4"/>
      <path d="M 50 20 L 52 32 M 50 20 L 48 32 M 35 32 L 40 42 M 65 32 L 60 42" stroke="#e8b620" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="47" cy="36" r="1.5" fill="#000"/>
      <circle cx="53" cy="36" r="1.5" fill="#000"/>
    </svg>`,
  },
  {
    id: 'fire-breath',
    name: 'Ateş Nefesi',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <circle cx="50" cy="32" r="11" fill="#c0392b" stroke="#c0392b" stroke-width="2"/>
      <circle cx="48" cy="30" r="7" fill="#e8b620" opacity="0.8"/>
      <path d="M 50 43 Q 35 55 30 75 Q 50 82 70 75 Q 65 55 50 43" fill="#c0392b" stroke="#c0392b" stroke-width="1.5"/>
      <path d="M 50 50 Q 38 62 35 78 Q 50 84 65 78 Q 62 62 50 50" fill="#e8b620" opacity="0.85"/>
      <path d="M 50 56 Q 42 66 40 76 Q 50 80 60 76 Q 58 66 50 56" fill="#f0d98c" opacity="0.7"/>
      <path d="M 38 60 Q 35 68 35 75 M 50 58 Q 50 68 50 78 M 62 60 Q 65 68 65 75" stroke="#f5e1a4" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'ice-breath',
    name: 'Buz Nefesi',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <circle cx="50" cy="32" r="11" fill="#d4af37" stroke="#d4af37" stroke-width="2"/>
      <circle cx="48" cy="30" r="7" fill="#f5e6c8" opacity="0.8"/>
      <path d="M 50 43 Q 35 55 30 75 Q 50 82 70 75 Q 65 55 50 43" fill="#d4af37" stroke="#d4af37" stroke-width="1.5"/>
      <path d="M 50 50 Q 38 62 35 78 Q 50 84 65 78 Q 62 62 50 50" fill="#f5e6c8" opacity="0.8"/>
      <path d="M 50 30 L 50 22 M 42 28 L 38 20 M 58 28 L 62 20" stroke="#f5e6c8" stroke-width="2" stroke-linecap="round"/>
      <path d="M 44 65 L 40 75 M 50 63 L 50 75 M 56 65 L 60 75" stroke="#f5e6c8" stroke-width="1.5" opacity="0.7" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'lightning',
    name: 'Yıldırım',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-lightning">
          <feGaussianBlur stdDeviation="1.5"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e8b620" stroke-width="2.5"/>
      <path d="M 50 18 L 45 38 L 55 38 L 38 72 L 50 55 L 42 55 L 62 18" fill="#e8b620" stroke="#e8b620" stroke-width="1.5" filter="url(#glow-lightning)"/>
      <path d="M 50 18 L 45 38 L 55 38 L 38 72 L 50 55 L 42 55 L 62 18" fill="none" stroke="#f5e1a4" stroke-width="0.8" opacity="0.8"/>
      <circle cx="48" cy="38" r="2" fill="#fff"/>
      <circle cx="45" cy="55" r="1.5" fill="#fff" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'poison',
    name: 'Zehir',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#a87432" stroke-width="2.5"/>
      <path d="M 50 25 L 45 35 Q 42 40 42 48 Q 42 58 50 65 Q 58 58 58 48 Q 58 40 55 35 Z" fill="#a87432" stroke="#a87432" stroke-width="2"/>
      <circle cx="50" cy="25" r="6" fill="#c9a227"/>
      <path d="M 38 52 Q 35 62 38 72 M 50 55 Q 50 68 50 78 M 62 52 Q 65 62 62 72" stroke="#e8c97a" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <circle cx="38" cy="74" r="2.5" fill="#e8c97a"/>
      <circle cx="50" cy="80" r="2" fill="#e8c97a"/>
      <circle cx="62" cy="74" r="2.5" fill="#e8c97a"/>
    </svg>`,
  },
  {
    id: 'headbutt',
    name: 'Başla Vuruş',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <circle cx="50" cy="35" r="16" fill="#c0392b" stroke="#c0392b" stroke-width="2"/>
      <circle cx="47" cy="32" r="3" fill="#d4af37"/>
      <circle cx="53" cy="32" r="3" fill="#d4af37"/>
      <path d="M 50 20 L 50 8" stroke="#b8860b" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 45 10 Q 50 5 55 10" stroke="#e8b620" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="50" cy="70" r="10" fill="none" stroke="#b8860b" stroke-width="2" opacity="0.6"/>
      <path d="M 38 50 L 30 50 M 62 50 L 70 50" stroke="#b8860b" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'meteor',
    name: 'Meteor',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-meteor">
          <feGaussianBlur stdDeviation="2.5"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <circle cx="40" cy="28" r="11" fill="#c0392b" stroke="#c0392b" stroke-width="2" filter="url(#glow-meteor)"/>
      <circle cx="40" cy="28" r="8" fill="#e8b620" opacity="0.8"/>
      <circle cx="38" cy="26" r="3" fill="#f0d98c"/>
      <path d="M 45 36 L 52 50 L 48 48 Z" stroke="#c0392b" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M 48 40 L 54 52 L 51 50 Z" stroke="#e8b620" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
      <circle cx="50" cy="70" r="12" fill="none" stroke="#b8860b" stroke-width="2" opacity="0.5"/>
      <path d="M 48 68 L 52 72 M 52 68 L 48 72" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'laser',
    name: 'Lazer',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-laser">
          <feGaussianBlur stdDeviation="2"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <circle cx="50" cy="32" r="9" fill="#c0392b" stroke="#c0392b" stroke-width="2"/>
      <circle cx="50" cy="32" r="6" fill="#e8b620"/>
      <rect x="48" y="42" width="4" height="33" fill="#c0392b" filter="url(#glow-laser)"/>
      <rect x="48.5" y="42" width="3" height="33" fill="#e8b620" opacity="0.7"/>
      <circle cx="50" cy="77" r="4" fill="#c0392b"/>
      <line x1="45" y1="55" x2="40" y2="65" stroke="#e8b620" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>
      <line x1="55" y1="55" x2="60" y2="65" stroke="#e8b620" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'explosion',
    name: 'Patlama',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-explosion">
          <feGaussianBlur stdDeviation="3"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="20" fill="#c0392b" opacity="0.6" filter="url(#glow-explosion)"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#c0392b" stroke-width="1.5" opacity="0.5"/>
      <circle cx="50" cy="50" r="15" fill="#e8b620" opacity="0.6"/>
      <circle cx="35" cy="38" r="8" fill="#e8b620" opacity="0.5"/>
      <circle cx="65" cy="38" r="8" fill="#e8b620" opacity="0.5"/>
      <circle cx="35" cy="62" r="7" fill="#c0392b" opacity="0.4"/>
      <circle cx="65" cy="62" r="7" fill="#c0392b" opacity="0.4"/>
      <path d="M 50 28 L 55 40 M 50 28 L 45 40 M 28 50 L 40 48 M 72 50 L 60 48" stroke="#f5e1a4" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'venom',
    name: 'Zehir Püskürtme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#a87432" stroke-width="2.5"/>
      <circle cx="50" cy="35" r="10" fill="#a87432" stroke="#a87432" stroke-width="2"/>
      <path d="M 42 48 L 28 62 M 50 52 L 50 75 M 58 48 L 72 62" stroke="#a87432" stroke-width="3" stroke-linecap="round"/>
      <path d="M 42 50 L 30 65 M 58 50 L 70 65" stroke="#e8c97a" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>
      <circle cx="26" cy="64" r="3" fill="#e8c97a"/>
      <circle cx="50" cy="77" r="3" fill="#e8c97a"/>
      <circle cx="74" cy="64" r="3" fill="#e8c97a"/>
      <path d="M 25 67 L 22 75 M 50 80 L 50 88 M 75 67 L 78 75" stroke="#c9a227" stroke-width="1" opacity="0.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'wind',
    name: 'Rüzgar',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <path d="M 20 38 Q 38 32 60 38" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 25 52 Q 50 46 75 52" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 18 66 Q 45 60 72 66" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 78 38 L 85 32 M 82 52 L 90 48 M 80 66 L 88 62" stroke="#f5e6c8" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <circle cx="78" cy="38" r="1.5" fill="#f5e6c8"/>
      <circle cx="82" cy="52" r="1.5" fill="#f5e6c8"/>
      <circle cx="80" cy="66" r="1.5" fill="#f5e6c8"/>
    </svg>`,
  },
  {
    id: 'water',
    name: 'Su',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <path d="M 35 42 Q 40 50 50 48 Q 60 50 65 42" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 35 58 Q 40 66 50 64 Q 60 66 65 58" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 35 72 Q 40 80 50 78 Q 60 80 65 72" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 32 45 Q 38 55 48 52 Q 58 55 68 45" fill="#f5e6c8" opacity="0.3"/>
      <circle cx="50" cy="50" r="2" fill="#f5e6c8" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'power',
    name: 'Güçlendirme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-power">
          <feGaussianBlur stdDeviation="2.5"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#b8860b" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="18" fill="#b8860b" opacity="0.5" filter="url(#glow-power)"/>
      <circle cx="50" cy="50" r="14" fill="#e8c97a" opacity="0.6"/>
      <circle cx="50" cy="50" r="10" fill="#e8b620"/>
      <circle cx="50" cy="50" r="6" fill="#fff" opacity="0.8"/>
      <path d="M 50 30 L 50 20 M 50 70 L 50 80 M 30 50 L 20 50 M 70 50 L 80 50" stroke="#b8860b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 35 35 L 28 28 M 65 35 L 72 28 M 35 65 L 28 72 M 65 65 L 72 72" stroke="#e8c97a" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'speed',
    name: 'Hızlı Koşu',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e8b620" stroke-width="2.5"/>
      <ellipse cx="50" cy="45" rx="11" ry="14" fill="#e8b620"/>
      <path d="M 40 55 L 28 70 M 50 56 L 50 75 M 60 55 L 72 70" stroke="#e8b620" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 62 40 L 75 35 L 72 50 Z" fill="#f5e1a4" opacity="0.8"/>
      <path d="M 68 38 L 78 32 M 72 50 L 82 48" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
      <circle cx="47" cy="43" r="1.5" fill="#000"/>
      <circle cx="53" cy="43" r="1.5" fill="#000"/>
    </svg>`,
  },
  {
    id: 'shield',
    name: 'Kalkan',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <path d="M 50 20 L 70 35 L 70 60 Q 70 75 50 85 Q 30 75 30 60 L 30 35 Z" fill="#d4af37" opacity="0.5" stroke="#d4af37" stroke-width="2"/>
      <path d="M 50 28 L 65 40 L 65 60 Q 65 72 50 80 Q 35 72 35 60 L 35 40 Z" fill="#f5e6c8" opacity="0.6"/>
      <path d="M 50 35 L 60 45 L 60 58 Q 60 68 50 74 Q 40 68 40 58 L 40 45 Z" fill="none" stroke="#e8b620" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="4" fill="#d4af37" opacity="0.8"/>
    </svg>`,
  },
  {
    id: 'stun',
    name: 'Sersem Etme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e8b620" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="25" fill="none" stroke="#e8b620" stroke-width="2" stroke-dasharray="5,5"/>
      <circle cx="50" cy="50" r="15" fill="#e8b620" opacity="0.4"/>
      <path d="M 50 35 L 50 25 M 50 65 L 50 75 M 35 50 L 25 50 M 65 50 L 75 50" stroke="#f5e1a4" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 38 38 L 32 32 M 62 38 L 68 32 M 38 62 L 32 68 M 62 62 L 68 68" stroke="#f5e1a4" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <circle cx="47" cy="48" r="2" fill="#000" opacity="0.6"/>
      <circle cx="53" cy="48" r="2" fill="#000" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'stop',
    name: 'Durdurma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <rect x="35" y="35" width="30" height="30" rx="4" fill="#c0392b" opacity="0.6" stroke="#c0392b" stroke-width="2"/>
      <circle cx="50" cy="50" r="8" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <path d="M 40 40 L 60 60 M 60 40 L 40 60" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 30 50 L 20 50 M 70 50 L 80 50 M 50 30 L 50 20 M 50 70 L 50 80" stroke="#b8860b" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    </svg>`,
  },
  {
    id: 'earthquake',
    name: 'Deprem',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#6b4423" stroke-width="2.5"/>
      <line x1="20" y1="50" x2="80" y2="50" stroke="#6b4423" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 30 35 Q 35 32 40 35 M 40 35 Q 45 32 50 35 M 50 35 Q 55 32 60 35 M 60 35 Q 65 32 70 35" fill="none" stroke="#b8860b" stroke-width="1.5" opacity="0.6"/>
      <path d="M 30 65 Q 35 68 40 65 M 40 65 Q 45 68 50 65 M 50 65 Q 55 68 60 65 M 60 65 Q 65 68 70 65" fill="none" stroke="#b8860b" stroke-width="1.5" opacity="0.6"/>
      <path d="M 35 25 L 40 30 M 40 30 L 35 35 M 65 25 L 70 30 M 70 30 L 65 35 M 35 70 L 40 75 M 40 75 L 35 80" stroke="#6b4423" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'aura',
    name: 'Aura',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-aura">
          <feGaussianBlur stdDeviation="3.5"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e8b620" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="20" fill="#e8b620" opacity="0.5" filter="url(#glow-aura)"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#e8b620" stroke-width="1.5" opacity="0.5"/>
      <circle cx="50" cy="50" r="15" fill="#f5e1a4" opacity="0.6"/>
      <circle cx="50" cy="50" r="10" fill="none" stroke="#f5e1a4" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="8" fill="#fff" opacity="0.5"/>
      <path d="M 50 25 L 50 15 M 50 75 L 50 85 M 25 50 L 15 50 M 75 50 L 85 50" stroke="#e8b620" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'slash',
    name: 'Kesme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <path d="M 28 28 L 72 72" stroke="#c0392b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 26 26 L 74 74" stroke="#b8860b" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <path d="M 30 25 L 25 30" stroke="#e8b620" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      <path d="M 75 70 L 70 75" stroke="#e8b620" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      <circle cx="50" cy="50" r="6" fill="none" stroke="#d4af37" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'spin',
    name: 'Dönerken Saldırı',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#b8860b" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="22" fill="none" stroke="#b8860b" stroke-width="2" stroke-dasharray="4,4" opacity="0.7"/>
      <path d="M 50 28 L 55 42 L 62 35 Q 70 40 68 50 Q 70 60 62 65 L 55 58 L 50 72 L 45 58 L 38 65 Q 30 60 32 50 Q 30 40 38 35 L 45 42" fill="#b8860b" opacity="0.6" stroke="#b8860b" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="8" fill="none" stroke="#d4af37" stroke-width="1.5"/>
      <path d="M 50 42 L 50 58" stroke="#d4af37" stroke-width="1" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'punch',
    name: 'Yumruk',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <rect x="35" y="38" width="30" height="24" rx="4" fill="#c0392b" stroke="#c0392b" stroke-width="2"/>
      <circle cx="40" cy="45" r="2.5" fill="#d4af37"/>
      <circle cx="50" cy="45" r="2.5" fill="#d4af37"/>
      <circle cx="60" cy="45" r="2.5" fill="#d4af37"/>
      <path d="M 50 64 L 50 80 Q 50 85 52 88" stroke="#b8860b" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="50" cy="85" r="3" fill="#b8860b"/>
      <path d="M 48 70 L 42 80 M 52 70 L 58 80" stroke="#b8860b" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'kick',
    name: 'Tekme',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <circle cx="50" cy="35" r="11" fill="#c0392b" stroke="#c0392b" stroke-width="2"/>
      <circle cx="48" cy="33" r="2" fill="#d4af37"/>
      <circle cx="52" cy="33" r="2" fill="#d4af37"/>
      <rect x="44" y="48" width="12" height="28" rx="2" fill="#c0392b" stroke="#c0392b" stroke-width="2"/>
      <rect x="46" y="78" width="8" height="10" rx="1.5" fill="#b8860b"/>
      <path d="M 44 55 L 38 62 M 56 55 L 62 62" stroke="#d4af37" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'smash',
    name: 'Çarpma',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-smash">
          <feGaussianBlur stdDeviation="2"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <rect x="38" y="20" width="24" height="28" rx="3" fill="#c0392b" stroke="#c0392b" stroke-width="2"/>
      <circle cx="50" cy="18" r="5" fill="#e8b620"/>
      <path d="M 30 50 L 50 50 L 70 50" stroke="#b8860b" stroke-width="3" stroke-linecap="round" filter="url(#glow-smash)"/>
      <circle cx="28" cy="50" r="3" fill="#b8860b"/>
      <circle cx="72" cy="50" r="3" fill="#b8860b"/>
      <path d="M 35 60 L 40 70 M 50 62 L 50 72 M 65 60 L 60 70" stroke="#b8860b" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'beam',
    name: 'Işın',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-beam">
          <feGaussianBlur stdDeviation="2.5"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e8b620" stroke-width="2.5"/>
      <circle cx="50" cy="32" r="10" fill="#e8b620" stroke="#e8b620" stroke-width="2"/>
      <circle cx="50" cy="32" r="6" fill="#f5e1a4" opacity="0.8"/>
      <rect x="47" y="42" width="6" height="35" fill="#e8b620" filter="url(#glow-beam)"/>
      <rect x="48" y="42" width="4" height="35" fill="#f5e1a4" opacity="0.7"/>
      <circle cx="50" cy="80" r="3" fill="#e8b620"/>
      <path d="M 44 50 L 40 55 M 56 50 L 60 55 M 44 65 L 38 72 M 56 65 L 62 72" stroke="#f5e1a4" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'inferno',
    name: 'İnferno',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-inferno">
          <feGaussianBlur stdDeviation="3"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <path d="M 38 42 Q 32 50 38 68 Q 50 78 62 68 Q 68 50 62 42 Q 50 48 50 48 Q 50 48 38 42" fill="#c0392b" opacity="0.7" filter="url(#glow-inferno)"/>
      <path d="M 42 45 Q 38 52 42 65 Q 50 73 58 65 Q 62 52 58 45" fill="#e8b620" opacity="0.8"/>
      <path d="M 46 48 Q 44 54 46 62 Q 50 68 54 62 Q 56 54 54 48" fill="#f0d98c" opacity="0.7"/>
      <circle cx="50" cy="55" r="3" fill="#fff" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'blizzard',
    name: 'Buzlu Fırtına',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <circle cx="38" cy="38" r="9" fill="#d4af37" opacity="0.6"/>
      <circle cx="62" cy="50" r="8" fill="#d4af37" opacity="0.6"/>
      <circle cx="50" cy="65" r="7" fill="#d4af37" opacity="0.6"/>
      <path d="M 50 28 L 50 15 M 50 72 L 50 85 M 28 50 L 15 50 M 72 50 L 85 50" stroke="#f5e6c8" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <path d="M 38 38 Q 50 35 62 40 Q 50 55 38 60" fill="none" stroke="#f5e6c8" stroke-width="1.5" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'nova',
    name: 'Nova',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-nova">
          <feGaussianBlur stdDeviation="3"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#c0392b" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="14" fill="#c0392b" filter="url(#glow-nova)"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="#c0392b" stroke-width="1.5" opacity="0.6"/>
      <circle cx="50" cy="50" r="26" fill="none" stroke="#b8860b" stroke-width="1" opacity="0.4"/>
      <path d="M 50 18 L 54 32 M 82 50 L 68 48 M 50 82 L 46 68 M 18 50 L 32 52 M 70 28 L 62 38 M 70 72 L 62 62 M 30 28 L 38 38 M 30 72 L 38 62" stroke="#e8b620" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    </svg>`,
  },
];

export function getAttackIcon(attackId: string) {
  return attackIcons.find(icon => icon.id === attackId);
}

export function getAllAttackIcons() {
  return attackIcons;
}
