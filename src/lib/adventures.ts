// Adventure Library - Quest-based PvE content with story elements
// Each adventure contains multiple enemies and narrative

export interface AdventureEnemy {
  name: string
  level: number
  hpMultiplier: number // Multiplier to player dino's maxHp
  atkMultiplier: number
  defMultiplier: number
  spdMultiplier: number
}

export interface AdventureScene {
  order: number
  title: string
  story: string // 1-2 cümle hikaye
  illustration: string // Emoji veya icon ID
  enemies: AdventureEnemy[]
  actionText?: string // "İlerle", "Incele", vs.
}

export interface Adventure {
  id: string
  name: string
  minLevel: number
  maxLevel: number
  description: string
  scenes: AdventureScene[]
  xpReward: number
  coinReward: number // DinoCoin ödülü
  difficulty: 'easy' | 'normal' | 'hard'
}

// ============= ADVENTURE LIBRARY =============

export const ADVENTURES: Record<string, Adventure> = {
  // LEVEL 1-3 ADVENTURES
  forest_hunt: {
    id: 'forest_hunt',
    name: '🌲 Ormanda Av Arama',
    minLevel: 1,
    maxLevel: 3,
    description: 'Küçük ormanda av arayarak hayatta kalın',
    difficulty: 'easy',
    xpReward: 30,
    coinReward: 50,
    scenes: [
      {
        order: 1,
        title: 'Ormana Giriş',
        story: 'Yoğun yeşilliğin içine giriyorsun. Etrafında kuş sesleri işitiliyor... Birden hışıltılar başlıyor!',
        illustration: '🌲',
        enemies: [
          {
            name: '🦗 Devasa Çekirge',
            level: 1,
            hpMultiplier: 0.6,
            atkMultiplier: 0.5,
            defMultiplier: 0.4,
            spdMultiplier: 1.2,
          },
        ],
        actionText: 'Çekirgeye Saldır',
      },
      {
        order: 2,
        title: 'Ormanın Derinleri',
        story: 'İlk düşmanı geçtin. Ormanın derinlerine ilerliyorsun. Aniden karşında daha büyük bir silüet beliriveriyor!',
        illustration: '🌲💨',
        enemies: [
          {
            name: '🐿️ Saldırgan Sincap',
            level: 1,
            hpMultiplier: 0.7,
            atkMultiplier: 0.6,
            defMultiplier: 0.5,
            spdMultiplier: 1.3,
          },
        ],
        actionText: 'Sincapla Savaş',
      },
      {
        order: 3,
        title: 'Ormanın Koruyucusu',
        story: 'Ormanın en derin yerine ulaşıyorsun. Eski bir ağaçta devasa bir yaratık saklanıyor!',
        illustration: '🦎',
        enemies: [
          {
            name: '🦎 Orman Igguanası',
            level: 2,
            hpMultiplier: 0.9,
            atkMultiplier: 0.8,
            defMultiplier: 0.7,
            spdMultiplier: 0.9,
          },
        ],
        actionText: 'Son Düşmanla Karşılaş',
      },
    ],
  },

  mountain_run: {
    id: 'mountain_run',
    name: '⛰️ Dağlarda Koşu',
    minLevel: 1,
    maxLevel: 3,
    description: 'Yüksek dağlarda hız ve dayanıklılığını test et',
    difficulty: 'easy',
    xpReward: 30,
    coinReward: 50,
    scenes: [
      {
        order: 1,
        title: 'Dağa Çıkış',
        story: 'Dağın yamaçlarına tırmanıyorsun. Soğuk rüzgarlar esiyor. Aniden bir ses!',
        illustration: '⛰️',
        enemies: [
          {
            name: '🦅 Hızlı Kartal',
            level: 1,
            hpMultiplier: 0.5,
            atkMultiplier: 0.7,
            defMultiplier: 0.3,
            spdMultiplier: 1.4,
          },
        ],
        actionText: 'Kartal Saldırısına Karşı Koy',
      },
      {
        order: 2,
        title: 'Dağın Tepesi',
        story: 'Üst yamaçlara ulaşıyorsun. Burası çok soğuk ve rüzgarla. Bir hayalet gölge senin peşinde!',
        illustration: '❄️',
        enemies: [
          {
            name: '🐺 Yüksek Dağ Kurdu',
            level: 1,
            hpMultiplier: 0.8,
            atkMultiplier: 0.7,
            defMultiplier: 0.6,
            spdMultiplier: 1.1,
          },
        ],
        actionText: 'Kurt Çetesiyle Savaş',
      },
      {
        order: 3,
        title: 'Zirve',
        story: 'Dağın en tepesine vardığında görüyorsun: Bütün krallığı gözlemleyen dev bir hayvan!',
        illustration: '🏔️',
        enemies: [
          {
            name: '🦌 Dağ Geyiği',
            level: 2,
            hpMultiplier: 1.0,
            atkMultiplier: 0.9,
            defMultiplier: 0.8,
            spdMultiplier: 1.0,
          },
        ],
        actionText: 'Dağ Geyiği\'ne Karşı Koy',
      },
    ],
  },

  // LEVEL 4-6 ADVENTURES
  swamp_mystery: {
    id: 'swamp_mystery',
    name: '🌿 Bataklıkta Gizem',
    minLevel: 4,
    maxLevel: 6,
    description: 'Sisli bataklıklarda tehlikeli yaratıkları ara',
    difficulty: 'normal',
    xpReward: 50,
    coinReward: 100,
    scenes: [
      {
        order: 1,
        title: 'Bataklığa Giriş',
        story: 'Dış sis içine giriyorsun. Su kokuyor ve tuhaf sesler geliyor. Birden su sıçrıyor!',
        illustration: '🌿',
        enemies: [
          {
            name: '🐢 Dev Kaplumbağa',
            level: 3,
            hpMultiplier: 1.1,
            atkMultiplier: 0.7,
            defMultiplier: 1.2,
            spdMultiplier: 0.7,
          },
        ],
        actionText: 'Kaplumbağaya Saldır',
      },
      {
        order: 2,
        title: 'Bataklığın Kalbi',
        story: 'Su daha derinleşiyor. Uzakta garip sesler ve bu sefer ortaya çıkan şey daha korkunç!',
        illustration: '💨🌿',
        enemies: [
          {
            name: '🐊 Korkunç Timsah',
            level: 4,
            hpMultiplier: 1.2,
            atkMultiplier: 1.0,
            defMultiplier: 0.9,
            spdMultiplier: 0.8,
          },
        ],
        actionText: 'Timsahla Savaş',
      },
      {
        order: 3,
        title: 'Bataklığın Hükümdarı',
        story: 'Bataklığın en karanlık köşesinde, eski ve çok tehlikeli bir varlık uyuyor. Ama artık uyanmış!',
        illustration: '👹',
        enemies: [
          {
            name: '🦖 Bataklık Canavar',
            level: 5,
            hpMultiplier: 1.4,
            atkMultiplier: 1.2,
            defMultiplier: 1.1,
            spdMultiplier: 0.9,
          },
        ],
        actionText: 'Son Düşmanla Yüzleş',
      },
    ],
  },

  volcano_trial: {
    id: 'volcano_trial',
    name: '🌋 Volkan Sınavı',
    minLevel: 4,
    maxLevel: 6,
    description: 'Ateş ve lavın ortasında güçünü kanıtla',
    difficulty: 'normal',
    xpReward: 50,
    coinReward: 100,
    scenes: [
      {
        order: 1,
        title: 'Volkan Eteği',
        story: 'Kızıl ışıltı gözlüğünü yakıyor. Etrafta moloz ve sıcak taşlar var. Birden hareketli bir gölge!',
        illustration: '🌋',
        enemies: [
          {
            name: '🦂 Dev Akrep',
            level: 3,
            hpMultiplier: 1.0,
            atkMultiplier: 1.1,
            defMultiplier: 0.8,
            spdMultiplier: 1.2,
          },
        ],
        actionText: 'Akrepla Karşılaş',
      },
      {
        order: 2,
        title: 'Lava Nehri',
        story: 'Daha yukarı tırmanıyorsun. Aşağıda kızıl lava akmaya başlıyor. Bir cehennem hayvanı ortaya çıkıyor!',
        illustration: '🔥',
        enemies: [
          {
            name: '🦑 Ateş Devesi',
            level: 4,
            hpMultiplier: 1.3,
            atkMultiplier: 1.2,
            defMultiplier: 0.9,
            spdMultiplier: 1.0,
          },
        ],
        actionText: 'Ateş Devesiyle Savaş',
      },
      {
        order: 3,
        title: 'Volkan Zirvesi',
        story: 'Tepede ulaşıyorsun ve gölüyorsün: Volkanın en derin yerinden yükselen antik bir yaratık!',
        illustration: '👹🌋',
        enemies: [
          {
            name: '🐉 Volkan Dragyonu',
            level: 5,
            hpMultiplier: 1.5,
            atkMultiplier: 1.4,
            defMultiplier: 1.2,
            spdMultiplier: 0.8,
          },
        ],
        actionText: 'Dragona Karşı Çık',
      },
    ],
  },
}

// ============= HELPER FUNCTIONS =============

export function getAdventuresByLevel(level: number): Adventure[] {
  return Object.values(ADVENTURES).filter(
    (adventure) => level >= adventure.minLevel && level <= adventure.maxLevel
  )
}

export function getAdventure(adventureId: string): Adventure | null {
  return ADVENTURES[adventureId] || null
}

export function getTotalEnemyCount(adventure: Adventure): number {
  return adventure.scenes.reduce((sum, scene) => sum + scene.enemies.length, 0)
}
