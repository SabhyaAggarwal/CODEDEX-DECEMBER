# Test Suite Documentation

## Overview
This directory contains comprehensive unit and integration tests for the Age Shifter game (`game.js`).

## Test Structure

### Files
- `setup.js` - Jest configuration and test utilities
- `__mocks__/phaser.js` - Mock implementation of Phaser.js framework
- `game.test.js` - Core game logic unit tests
- `menu.integration.test.js` - Menu system integration tests

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test:watch
```

### Generate Coverage Report
```bash
npm test:coverage
```

## Test Coverage

The test suite covers:

### Game Constants (100+ tests)
- AGES configuration (child, adult, elder stats)
- Level design constants (tunnel gaps, turret ranges)
- Jump heights, speeds, and dimensions
- Color schemes and indices

### Pure Functions
- `moveTurretWithPlayer()` - Turret/player synchronization
- `cleanupOffScreenBullets()` - Memory management
- `calculateAgeSwitchSteps()` - Age transition logic
- `calculateHealthPercentage()` - Boss health display
- `checkGhostCollision()` - Platform collision logic

### Game Mechanics
- Age switching (child ↔ adult ↔ elder)
- Boss health management and color transitions
- Level progression (5 levels total)
- Timer management (count-up system)
- Ghost platform visibility logic

### Level Design Validation
- Level 1: Redesigned with pillar gap and ascending platforms
- Level 2: Tunnel and moat with ghost platform crossing
- Spawn positions and finish zones
- Platform dimensions and spacing

### Boss Battle
- Turret movement bounds (Y: 300-400)
- Fire rate mechanics (200ms cooldown)
- Bullet velocities (player: 600, boss: -400)
- Boss oscillation pattern
- Health bar color coding

### Edge Cases
- Null/undefined object handling
- Boundary conditions (timer, health)
- Invalid age strings
- Off-screen detection with margins
- Physics body synchronization

### Menu System
- DOM element interactions
- State transitions (menu ↔ instructions ↔ game)
- Button click handlers
- Display property toggling

## Test Patterns

### Mock Objects
Tests use mock Phaser objects with jest functions to verify interactions:
```javascript
const mockPlayer = {
  x: 100,
  y: 350,
  body: {
    updateFromGameObject: jest.fn()
  }
};
```

### Parametric Tests
Multiple scenarios tested per function:
```javascript
test('should handle all age combinations', () => {
  expect(calculateSteps('child', 'adult')).toBe(1);
  expect(calculateSteps('child', 'elder')).toBe(2);
  // ... more cases
});
```

### Boundary Testing
Edge cases explicitly tested:
```javascript
test('should clamp to TURRET_MAX_Y', () => {
  moveTurretWithPlayer(1000); // Extreme value
  expect(turret.y).toBe(TURRET_MAX_Y);
});
```

## Key Changes Tested

The test suite validates these recent changes to `game.js`:

1. **Updated Jump Heights**
   - Child: -400 → -500
   - Elder: -250 → -450

2. **New Spawn Position**
   - Player X: 100 → 50

3. **Redesigned Level 1**
   - New pillar with 22px child gap
   - Three ascending ghost platforms
   - Elevated finish zone

4. **Redesigned Level 2**
   - Child-only tunnel section
   - "Endless moat" with ghost platforms
   - Final platform positioning

5. **Menu System**
   - Window load event handlers
   - Menu overlay display toggling
   - Game initialization on play

## Best Practices

### Test Naming
Tests use descriptive names that explain the expected behavior:
```javascript
test('should clamp to TURRET_MIN_Y when moving too far up', () => {
  // Test implementation
});
```

### Isolation
Each test is independent with proper setup/teardown:
```javascript
beforeEach(() => {
  bossHealth = 10;
  bossMaxHealth = 10;
});
```

### Assertions
Multiple assertions per test when validating related behavior:
```javascript
test('should move turret and player atomically', () => {
  moveTurretWithPlayer(15);
  expect(turret.y).toBe(player.y); // Same position
  expect(turret.y).toBe(365); // Correct value
});
```

## Extending Tests

To add new tests:

1. Add test cases to existing describe blocks for related functionality
2. Create new describe blocks for new features
3. Update this README with coverage information
4. Ensure tests are independent and properly isolated

## Notes

- Tests use Jest's fake timers for time-based logic
- Phaser is fully mocked to avoid browser dependencies
- DOM operations use jsdom environment
- Custom matcher `toBeWithinRange` available for numeric ranges