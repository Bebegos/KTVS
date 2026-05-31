# 🎨 Hearthstone Card System - Complete Implementation Guide

## Overview
A unified, consistent Hearthstone/World of Warcraft-themed card system for displaying dinosaurs throughout the application. All dinosaur displays use this system for a cohesive aesthetic.

---

## 📋 Card Components

### 1. **HearthstoneCard** (Base Component)
**Location:** `src/components/HearthstoneCard.tsx`

Base wrapper for all Hearthstone-styled cards. Provides the rustic metal frame, gold title bar, and parchment panel.

**Props:**
- `title?: string` - Title in the golden bar
- `subtitle?: string` - Subtitle below main content
- `mode?: CardMode` - 'display' | 'summary' | 'selection'
- `selected?: boolean` - Highlight selected state
- `onClick?: () => void` - Click handler
- `children: ReactNode` - Content area
- `actions?: Array<{label, onClick, variant}>` - Bottom action buttons
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<HearthstoneCard
  title="Dino Name"
  subtitle="Fire • Level 10"
  mode="display"
>
  {/* Content here */}
</HearthstoneCard>
```

---

### 2. **DinoCard** (Dinosaur Display)
**Location:** `src/components/DinoCard.tsx`

Complete dinosaur information in card format. Main card for listing and selection.

**Modes:**
- `display` - Full details: stats, XP, abilities
- `summary` - Compact: just name, level, element
- `selection` - Minimal: for choosing dinosaurs

**Features:**
- Stats grid (4 columns: STA, ATK, DEF, SPD)
- XP progress bar
- Class/Spec badges
- Abilities list (display mode only)
- Pending rewards animation
- Action buttons (View/Edit/Delete or Select)

**Example:**
```tsx
<DinoCard
  dino={dino}
  mode="display"
  onView={() => handleView(dino)}
  onEdit={() => handleEdit(dino)}
  onDelete={() => handleDelete(dino)}
/>
```

**Used in:**
- ✅ DinoList (My Dinosaurs page)
- ✅ AdventureSelectScreen
- ✅ DuelloVsSelectDino
- ✅ OfflineSelectDino

---

### 3. **BattleDinoCard** (Battle Display)
**Location:** `src/components/BattleDinoCard.tsx`

Dinosaur state during battle. Shows health, effects, and abilities.

**Features:**
- Current HP with color coding
- Health bar (red gradient)
- Class/Spec badges
- Active effects display
- Stats grid (ATK, DEF, SPD)
- Ability selection with cooldown
- Side-specific styling (cyan for player, purple for opponent)

**Example:**
```tsx
<BattleDinoCard
  dino={battleState.player.dino}
  currentHp={battleState.player.currentHp}
  side="player"
  effects={battleState.player.effects}
  abilities={battleState.player.abilities}
  selectedAbilityIdx={selectedAbility}
  onAbilitySelect={(idx) => selectAbility(idx)}
  abilityDisabledCheck={(idx) => !engine.canUseAbility('player', idx)}
  roundInProgress={roundInProgress}
/>
```

**Used in:**
- Battle screens (future integration)
- BattleScreenNew (future integration)
- DuelloBattleScreen (future integration)

---

### 4. **DinoBattlePreviewCard** (Pre-Battle Preview)
**Location:** `src/components/DinoBattlePreviewCard.tsx`

Clean dinosaur preview before battle starts.

**Features:**
- Clean, minimal design
- All stats in 4-column grid
- XP progress bar
- Ability count (quick view)
- Smooth entrance animation
- Optional label (OYUNCU, RAKİP, etc.)

**Example:**
```tsx
<DinoBattlePreviewCard
  dino={dino}
  label="OYUNCU"
/>
```

**Used in:**
- ✅ DuelloLobbyView
- Battle start screens (future)
- Adventure preview screens (future)

---

### 5. **DuelloLobbyView** (Waiting Room)
**Location:** `src/components/DuelloLobbyView.tsx`

Duello VS waiting room with side-by-side dinosaur display.

**Features:**
- Player dinosaur on left
- "VS" badge in center
- Opponent dinosaur on right (or waiting state)
- Session ID display
- "Start Battle" button when both ready
- Rotating loading animation
- Smooth entrance animations

**Example:**
```tsx
<DuelloLobbyView
  playerDino={playerDino}
  opponentDino={opponentDino}
  waiting={!opponentDino}
  sessionId={sessionId}
  onStartBattle={handleStartBattle}
  onBack={handleBack}
/>
```

**Used in:**
- ✅ DuelloVsMode (integration ready)

---

### 6. **PvPOpponentSelectScreen** (Matchmaking)
**Location:** `src/components/PvPOpponentSelectScreen.tsx`

Opponent selection for PvP battles.

**Features:**
- Opponent grid with DinoCard (summary mode)
- Level filtering (all/lower/equal/higher)
- Player name and win rate on hover
- Quick select button
- Loading state
- Responsive grid

**Example:**
```tsx
<PvPOpponentSelectScreen
  playerDino={playerDino}
  availableOpponents={opponents}
  onSelectOpponent={handleSelectOpponent}
  onBack={handleBack}
/>
```

**Used in:**
- Future PvP matchmaking
- Ready for integration

---

### 7. **BattleResultCard** (Post-Battle)
**Location:** `src/components/BattleResultCard.tsx`

Battle result summary with winner/loser comparison.

**Features:**
- Winner section (green, prominent)
- Loser section (red, muted)
- XP/Coin rewards clearly shown
- Battle duration
- Action buttons for next steps
- Trophy and down-arrow emojis for visual clarity

**Example:**
```tsx
<BattleResultCard
  result={{
    winner: winnerDino,
    loser: loserDino,
    winnerXp: 50,
    loserXp: 25,
    winnerCoins: 10,
    loserCoins: 5,
    duration: 30000,
  }}
  actions={[
    { label: 'Tekrar Oyna', onClick: handleRematch },
    { label: 'Geri Dön', onClick: handleBack, variant: 'purple' },
  ]}
/>
```

**Used in:**
- Battle completion screens (future)
- Adventure results (future)
- PvP results (future)

---

## 🎨 CSS System

**Main File:** `src/styles/hearthstone-card.css`

### CSS Classes
- `.hs-card-wrapper` - Base wrapper
- `.hs-card-outer-frame` - Metal frame with rivets
- `.hs-card-title-bar` - Golden title section
- `.hs-card-main` - Parchment main panel
- `.hs-card-content-area` - Content container
- `.hs-card-actions` - Action buttons area
- `.hs-card-bottom-accent` - Bottom metal detail

### Dinosaur-Specific
- `.dino-card` - DinoCard container
- `.dino-card-badges` - Class/Spec badges
- `.dino-card-stats` - Stats grid
- `.dino-card-xp-section` - XP bar
- `.dino-card-abilities-section` - Abilities list

### Battle-Specific
- `.battle-dino-card` - BattleDinoCard wrapper
- `.battle-dino-health-section` - HP bar
- `.battle-dino-abilities` - Ability grid
- `.battle-preview-card` - Preview card

### Specialized
- `.battle-lobby-waiting` - Waiting room card
- `.battle-result-card` - Result card
- `.battle-result-winner` - Winner section
- `.battle-result-loser` - Loser section

---

## 🔄 Integration Guide

### Current Integration (✅ Done)
1. **DinoList** - Uses DinoCard (display mode)
2. **AdventureSelectScreen** - Uses DinoCard (selection mode)
3. **DuelloVsSelectDino** - Uses DinoCard (selection mode)
4. **OfflineSelectDino** - Uses DinoCard (selection mode)
5. **DinoDetailPage** - Uses DinoCard as header
6. **DuelloLobbyView** - Uses DinoBattlePreviewCard

### Recommended Future Integration
1. **BattleScreenNew** - Replace CharacterCard with BattleDinoCard
2. **BattleTable** - Integrate BattleDinoCard
3. **AdventureBattleScreen** - Use BattleDinoCard for display
4. **DuelloBattleScreen** - Full BattleDinoCard integration
5. **Battle Results Screens** - Use BattleResultCard
6. **PvP Matchmaking** - Use PvPOpponentSelectScreen

---

## 📱 Responsive Design

All cards are fully responsive:
- **Mobile** (1 column): Stacked layout, readable text
- **Tablet** (2 columns): Comfortable viewing
- **Desktop** (3-4 columns): Full grid layout

Grid classes:
```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

---

## 🎯 Design Principles

1. **Consistent Aesthetic** - All cards follow Hearthstone/WoW style
2. **No Animations on Cards** - Cards themselves don't animate (motion handled by parent)
3. **Proper Z-Index** - Metal frame, title, panel, content properly layered
4. **Texture Overlay** - Subtle parchment texture for authenticity
5. **Color Scheme** - Gold (#d4af37), parchment, wood tones
6. **Typography** - Playfair Display (display), Cinzel (general)

---

## 🛠️ Development Tips

### Adding New Card Variant
1. Create new component using `HearthstoneCard` as base
2. Add specific CSS classes to `hearthstone-card.css`
3. Document in this guide
4. Test across responsive sizes

### Styling Guide
- Use parchment colors: `#fdf6e3`, `#f3e4c0`, `#e6cfa0`
- Gold accents: `#d4af37`, `#f5e1a4`
- Dark text: `#2a1810`
- Shadows for depth: `0 6px 16px rgba(0, 0, 0, 0.5)`
- Inset shadows for texture: `inset 0 1px 2px rgba(255, 255, 255, 0.9)`

### Common Props Pattern
```tsx
interface CardProps {
  dino: Dino
  mode?: 'display' | 'summary' | 'selection'
  actions?: ActionButton[]
  className?: string
  onClick?: () => void
}
```

---

## 📊 Consistency Checklist

- [ ] All dinosaur displays use card components
- [ ] Colors match Hearthstone palette
- [ ] Typography uses specified fonts
- [ ] Responsive layout works on all sizes
- [ ] Action buttons use `hs-btn` style
- [ ] No direct styling outside card system
- [ ] Animations are smooth and purposeful

---

## 🎬 Complete Card Usage Example

```tsx
import DinoCard from '../components/DinoCard'
import DinoBattlePreviewCard from '../components/DinoBattlePreviewCard'
import BattleResultCard from '../components/BattleResultCard'

// Selection screen
<DinoCard
  dino={dino}
  mode="selection"
  onClick={() => startAdventure(dino)}
/>

// Battle preview
<DinoBattlePreviewCard dino={playerDino} label="OYUNCU" />

// Battle result
<BattleResultCard
  result={battleResult}
  actions={[{ label: 'Continue', onClick: handleContinue }]}
/>
```

---

## 📞 Support

For questions or improvements:
1. Refer to component source code
2. Check CSS in `hearthstone-card.css`
3. Review existing implementations
4. Maintain consistent patterns

**Last Updated:** 2026-05-31
