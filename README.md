# Aetheria: Card World

An AI-driven text adventure game where the entire world, characters, and actions are represented as cards. Manipulate the structure of reality through card-based interactions.

## Overview

Aetheria: Card World is an innovative narrative game that combines:
- **Card-based World Modeling**: Every entity in the game (locations, characters, items, abilities, relationships) is represented as a card in a hierarchical tree structure
- **AI-Powered Storytelling**: Uses LLM (Large Language Model) to generate dynamic narratives, world events, and action options
- **Real-time Streaming**: Narrative responses stream in real-time for an immersive experience
- **Relationship System**: Create semantic relationships between any two elements beyond simple parent-child hierarchy
- **Event Chain System**: Player actions can trigger cascading world events (NPC reactions, environmental changes, chain reactions)

## Features

### World as Cards
- Hierarchical card structure representing the entire game world
- Cards can be: locations, characters, items, abilities, status effects, containers, relationships, and more
- Each card has properties: type, name, description, icon, visibility, and enabled state
- Cards can contain other cards (e.g., a character card contains inventory, abilities, equipment)

### AI Integration
- Configurable LLM backend (supports OpenAI-compatible APIs)
- Real-time narrative streaming
- AI generates contextual action options based on selected cards
- Dynamic world state updates through XML-based operations

### Game Systems
- **Inventory System**: Manage items and equipment
- **Ability System**: Various ability sets (combat, magic, social, stealth, cyber, cultivation)
- **Quest System**: Track objectives and story progress
- **Status System**: Monitor character attributes and conditions

### World Presets
Choose from pre-built world templates:
- **Dark Dungeon**: Classic dungeon crawling with monsters and treasures
- **Neon City**: Cyberpunk future with hackers and corporations
- **Cultivation World**: Eastern fantasy with immortal cultivators
- **Wasteland**: Post-apocalyptic survival
- **Magic Academy**: Mystical school of sorcery
- **Custom World**: Build your own from scratch

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **OpenAI SDK** - LLM API integration
- **Lucide React** - Icon library
- **IndexedDB** - Local game save storage

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aetheria-card-world.git
cd aetheria-card-world

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Configuration

Before playing, you need to configure an LLM provider in the Settings screen:
1. Launch the app and click "Settings"
2. Enter your API Host (e.g., `https://api.openai.com/v1`)
3. Enter your API Key
4. Specify the model name (e.g., `gpt-4`, `gpt-3.5-turbo`)
5. Save settings

## How to Play

1. **Start a New Game**: Choose a world preset or create a custom world
2. **Explore the World Tree**: The left panel shows all cards in the world as a hierarchical tree
3. **Select Cards**: Click on cards to select them (multi-select supported)
4. **Generate Actions**: With cards selected, click "Generate Options" to get AI-suggested actions
5. **Execute Actions**: Choose an action to see the narrative unfold and world state update
6. **Watch Events Chain**: Your actions may trigger follow-up world events

### Card Interactions
- **Single Selection**: Click a card to view its details and relationships
- **Multi-Selection**: Select multiple cards to generate contextual actions involving all of them
- **Relationship View**: See how cards relate to each other beyond the tree structure

## XML Protocol

The game uses an XML-based protocol for AI communication:

### World State
```xml
<Element id="world-1" type="World" name="Dark Dungeon" ...>
  <Element id="loc-1" type="Location" name="Entrance" ...>
    <Element id="player-1" type="Character" name="Hero" ...>
      <Element id="item-1" type="Item" name="Torch" .../>
    </Element>
  </Element>
</Element>
```

### Operations
```xml
<Operations>
  <new parentId="player-1" type="Item" name="Key" icon="key" .../>
  <update id="player-1" description="Injured but determined"/>
  <delete id="item-torch"/>
  <move id="item-1" newParentId="loc-1"/>
</Operations>
```

### Rich Text Narrative
```
You found [[id:item-1|an ancient key]], it emits **a mysterious glow**.
But you also feel ~~a chill~~ running down your spine...
```

## Scripts

```bash
# Development
pnpm dev        # Start dev server

# Build
pnpm build      # Build for production

# Preview
pnpm preview    # Preview production build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
