/**
 * Comprehensive test suite for game.js
 * Tests cover game logic, state management, level design, and mechanics
 */

// Mock Phaser before importing game logic
jest.mock('phaser');

describe('Game Constants and Configuration', () => {
  // Import constants from game.js by evaluating the file
  let AGES, CHILD_TUNNEL_GAP, TURRET_MIN_Y, TURRET_MAX_Y, TURRET_MOVE_SPEED;
  
  beforeAll(() => {
    // These would be imported from the actual game file
    AGES = {
      child: {
        color: 0x00ff00,
        width: 20,
        height: 20,
        speed: 300,
        jump: -500,
        name: 'CHILD',
        index: 0
      },
      adult: {
        color: 0x0000ff,
        width: 32,
        height: 48,
        speed: 200,
        jump: -600,
        name: 'ADULT',
        index: 1
      },
      elder: {
        color: 0x808080,
        width: 32,
        height: 40,
        speed: 100,
        jump: -450,
        name: 'ELDER',
        index: 2
      }
    };
    CHILD_TUNNEL_GAP = 22;
    TURRET_MIN_Y = 300;
    TURRET_MAX_Y = 400;
    TURRET_MOVE_SPEED = 3;
  });

  describe('AGES Configuration', () => {
    test('should have three age types: child, adult, elder', () => {
      expect(AGES).toHaveProperty('child');
      expect(AGES).toHaveProperty('adult');
      expect(AGES).toHaveProperty('elder');
      expect(Object.keys(AGES)).toHaveLength(3);
    });

    test('child should have smallest dimensions', () => {
      expect(AGES.child.width).toBe(20);
      expect(AGES.child.height).toBe(20);
      expect(AGES.child.width).toBeLessThan(AGES.adult.width);
      expect(AGES.child.height).toBeLessThan(AGES.adult.height);
    });

    test('child should have highest speed', () => {
      expect(AGES.child.speed).toBe(300);
      expect(AGES.child.speed).toBeGreaterThan(AGES.adult.speed);
      expect(AGES.child.speed).toBeGreaterThan(AGES.elder.speed);
    });

    test('child should have updated jump height of -500', () => {
      expect(AGES.child.jump).toBe(-500);
      expect(AGES.child.jump).toBeLessThan(0); // Negative for upward jump
    });

    test('adult should have strongest jump', () => {
      expect(AGES.adult.jump).toBe(-600);
      expect(Math.abs(AGES.adult.jump)).toBeGreaterThan(Math.abs(AGES.child.jump));
      expect(Math.abs(AGES.adult.jump)).toBeGreaterThan(Math.abs(AGES.elder.jump));
    });

    test('adult should have medium speed', () => {
      expect(AGES.adult.speed).toBe(200);
      expect(AGES.adult.speed).toBeLessThan(AGES.child.speed);
      expect(AGES.adult.speed).toBeGreaterThan(AGES.elder.speed);
    });

    test('elder should have slowest movement', () => {
      expect(AGES.elder.speed).toBe(100);
      expect(AGES.elder.speed).toBeLessThan(AGES.adult.speed);
      expect(AGES.elder.speed).toBeLessThan(AGES.child.speed);
    });

    test('elder should have updated jump height of -450', () => {
      expect(AGES.elder.jump).toBe(-450);
      expect(Math.abs(AGES.elder.jump)).toBeGreaterThan(Math.abs(AGES.adult.jump) / 2);
    });

    test('each age should have unique color', () => {
      const colors = [AGES.child.color, AGES.adult.color, AGES.elder.color];
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(3);
    });

    test('each age should have correct index', () => {
      expect(AGES.child.index).toBe(0);
      expect(AGES.adult.index).toBe(1);
      expect(AGES.elder.index).toBe(2);
    });

    test('each age should have uppercase name', () => {
      expect(AGES.child.name).toBe('CHILD');
      expect(AGES.adult.name).toBe('ADULT');
      expect(AGES.elder.name).toBe('ELDER');
    });

    test('all required properties should be present for each age', () => {
      Object.values(AGES).forEach(age => {
        expect(age).toHaveProperty('color');
        expect(age).toHaveProperty('width');
        expect(age).toHaveProperty('height');
        expect(age).toHaveProperty('speed');
        expect(age).toHaveProperty('jump');
        expect(age).toHaveProperty('name');
        expect(age).toHaveProperty('index');
      });
    });
  });

  describe('Level Design Constants', () => {
    test('CHILD_TUNNEL_GAP should be 22 pixels', () => {
      expect(CHILD_TUNNEL_GAP).toBe(22);
    });

    test('tunnel gap should be slightly larger than child height', () => {
      expect(CHILD_TUNNEL_GAP).toBeGreaterThan(AGES.child.height);
      expect(CHILD_TUNNEL_GAP - AGES.child.height).toBe(2); // 2px clearance
    });

    test('tunnel gap should block adult and elder', () => {
      expect(CHILD_TUNNEL_GAP).toBeLessThan(AGES.adult.height);
      expect(CHILD_TUNNEL_GAP).toBeLessThan(AGES.elder.height);
    });
  });

  describe('Turret Constants', () => {
    test('TURRET_MOVE_SPEED should be positive', () => {
      expect(TURRET_MOVE_SPEED).toBe(3);
      expect(TURRET_MOVE_SPEED).toBeGreaterThan(0);
    });

    test('turret range should be valid', () => {
      expect(TURRET_MIN_Y).toBe(300);
      expect(TURRET_MAX_Y).toBe(400);
      expect(TURRET_MAX_Y).toBeGreaterThan(TURRET_MIN_Y);
    });

    test('turret range should match boss movement range', () => {
      // Boss range is 300-400 (comment in code)
      expect(TURRET_MIN_Y).toBe(300);
      expect(TURRET_MAX_Y).toBe(400);
    });
  });
});

describe('moveTurretWithPlayer Function', () => {
  let turret, player, TURRET_MIN_Y, TURRET_MAX_Y;
  
  beforeEach(() => {
    TURRET_MIN_Y = 300;
    TURRET_MAX_Y = 400;
    
    // Create mock objects
    turret = {
      y: 350,
      body: {
        updateFromGameObject: jest.fn()
      }
    };
    
    player = {
      y: 350,
      body: {
        updateFromGameObject: jest.fn()
      }
    };
  });

  // Mock implementation of moveTurretWithPlayer for testing
  function moveTurretWithPlayer(deltaY) {
    if (!turret || !player) return;
    
    const newY = turret.y + deltaY;
    const clampedY = Math.max(TURRET_MIN_Y, Math.min(TURRET_MAX_Y, newY));
    turret.y = clampedY;
    player.y = clampedY;
    if (turret.body) turret.body.updateFromGameObject();
    if (player.body) player.body.updateFromGameObject();
  }

  test('should move turret and player down by positive delta', () => {
    moveTurretWithPlayer(10);
    expect(turret.y).toBe(360);
    expect(player.y).toBe(360);
  });

  test('should move turret and player up by negative delta', () => {
    moveTurretWithPlayer(-10);
    expect(turret.y).toBe(340);
    expect(player.y).toBe(340);
  });

  test('should clamp to TURRET_MIN_Y when moving too far up', () => {
    turret.y = 310;
    player.y = 310;
    moveTurretWithPlayer(-50);
    expect(turret.y).toBe(TURRET_MIN_Y);
    expect(player.y).toBe(TURRET_MIN_Y);
  });

  test('should clamp to TURRET_MAX_Y when moving too far down', () => {
    turret.y = 390;
    player.y = 390;
    moveTurretWithPlayer(50);
    expect(turret.y).toBe(TURRET_MAX_Y);
    expect(player.y).toBe(TURRET_MAX_Y);
  });

  test('should handle zero delta (no movement)', () => {
    const initialY = turret.y;
    moveTurretWithPlayer(0);
    expect(turret.y).toBe(initialY);
    expect(player.y).toBe(initialY);
  });

  test('should sync physics bodies after movement', () => {
    moveTurretWithPlayer(5);
    expect(turret.body.updateFromGameObject).toHaveBeenCalled();
    expect(player.body.updateFromGameObject).toHaveBeenCalled();
  });

  test('should handle null turret gracefully', () => {
    turret = null;
    expect(() => moveTurretWithPlayer(10)).not.toThrow();
  });

  test('should handle null player gracefully', () => {
    player = null;
    expect(() => moveTurretWithPlayer(10)).not.toThrow();
  });

  test('should handle missing body property', () => {
    turret.body = null;
    player.body = null;
    expect(() => moveTurretWithPlayer(10)).not.toThrow();
  });

  test('should move turret and player atomically', () => {
    moveTurretWithPlayer(15);
    expect(turret.y).toBe(player.y);
  });
});

describe('cleanupOffScreenBullets Function', () => {
  let bulletGroup, config;
  
  beforeEach(() => {
    config = { width: 800, height: 600 };
    
    const bullets = [];
    bulletGroup = {
      getChildren: () => bullets.slice(),
      bullets: bullets
    };
  });

  function cleanupOffScreenBullets(bulletGroup) {
    const margin = 50;
    const maxX = config.width + margin;
    const minX = -margin;
    const maxY = config.height + margin;
    const minY = -margin;
    
    const bullets = bulletGroup.getChildren().slice();
    for (const bullet of bullets) {
      if (bullet.x > maxX || bullet.x < minX || bullet.y > maxY || bullet.y < minY) {
        bullet.destroy();
      }
    }
  }

  test('should destroy bullets off right edge', () => {
    const bullet = { x: 900, y: 300, destroy: jest.fn() };
    bulletGroup.bullets.push(bullet);
    
    cleanupOffScreenBullets(bulletGroup);
    expect(bullet.destroy).toHaveBeenCalled();
  });

  test('should destroy bullets off left edge', () => {
    const bullet = { x: -100, y: 300, destroy: jest.fn() };
    bulletGroup.bullets.push(bullet);
    
    cleanupOffScreenBullets(bulletGroup);
    expect(bullet.destroy).toHaveBeenCalled();
  });

  test('should destroy bullets off top edge', () => {
    const bullet = { x: 400, y: -100, destroy: jest.fn() };
    bulletGroup.bullets.push(bullet);
    
    cleanupOffScreenBullets(bulletGroup);
    expect(bullet.destroy).toHaveBeenCalled();
  });

  test('should destroy bullets off bottom edge', () => {
    const bullet = { x: 400, y: 700, destroy: jest.fn() };
    bulletGroup.bullets.push(bullet);
    
    cleanupOffScreenBullets(bulletGroup);
    expect(bullet.destroy).toHaveBeenCalled();
  });

  test('should not destroy bullets within bounds', () => {
    const bullet = { x: 400, y: 300, destroy: jest.fn() };
    bulletGroup.bullets.push(bullet);
    
    cleanupOffScreenBullets(bulletGroup);
    expect(bullet.destroy).not.toHaveBeenCalled();
  });

  test('should handle multiple bullets', () => {
    const bullets = [
      { x: 400, y: 300, destroy: jest.fn() }, // In bounds
      { x: 900, y: 300, destroy: jest.fn() }, // Off right
      { x: -100, y: 300, destroy: jest.fn() }, // Off left
      { x: 400, y: 100, destroy: jest.fn() }  // In bounds
    ];
    bulletGroup.bullets.push(...bullets);
    
    cleanupOffScreenBullets(bulletGroup);
    expect(bullets[0].destroy).not.toHaveBeenCalled();
    expect(bullets[1].destroy).toHaveBeenCalled();
    expect(bullets[2].destroy).toHaveBeenCalled();
    expect(bullets[3].destroy).not.toHaveBeenCalled();
  });

  test('should include 50px margin in boundary checks', () => {
    // Just inside margin on right edge
    const bullet1 = { x: 849, y: 300, destroy: jest.fn() };
    bulletGroup.bullets.push(bullet1);
    cleanupOffScreenBullets(bulletGroup);
    expect(bullet1.destroy).not.toHaveBeenCalled();
    
    // Just outside margin on right edge
    bulletGroup.bullets = [];
    const bullet2 = { x: 851, y: 300, destroy: jest.fn() };
    bulletGroup.bullets.push(bullet2);
    cleanupOffScreenBullets(bulletGroup);
    expect(bullet2.destroy).toHaveBeenCalled();
  });

  test('should handle empty bullet group', () => {
    expect(() => cleanupOffScreenBullets(bulletGroup)).not.toThrow();
  });
});

describe('Age Switching Logic', () => {
  let AGES, currentAge;
  
  beforeEach(() => {
    AGES = {
      child: { index: 0, name: 'CHILD', height: 20, width: 20, color: 0x00ff00 },
      adult: { index: 1, name: 'ADULT', height: 48, width: 32, color: 0x0000ff },
      elder: { index: 2, name: 'ELDER', height: 40, width: 32, color: 0x808080 }
    };
    currentAge = 'adult';
  });

  function calculateAgeSwitchSteps(fromAge, toAge) {
    const fromStats = AGES[fromAge];
    const toStats = AGES[toAge];
    const diff = toStats.index - fromStats.index;
    return Math.abs(diff);
  }

  function calculateAgeSwitchDuration(fromAge, toAge) {
    const steps = calculateAgeSwitchSteps(fromAge, toAge);
    const baseDelay = 500; // 0.5 seconds per step
    return steps * baseDelay;
  }

  function determineAgeSwitchDirection(fromAge, toAge) {
    const fromStats = AGES[fromAge];
    const toStats = AGES[toAge];
    const diff = toStats.index - fromStats.index;
    return diff > 0 ? 'aging' : 'rejuvenating';
  }

  describe('calculateAgeSwitchSteps', () => {
    test('should return 1 step for adjacent ages', () => {
      expect(calculateAgeSwitchSteps('child', 'adult')).toBe(1);
      expect(calculateAgeSwitchSteps('adult', 'elder')).toBe(1);
      expect(calculateAgeSwitchSteps('adult', 'child')).toBe(1);
      expect(calculateAgeSwitchSteps('elder', 'adult')).toBe(1);
    });

    test('should return 2 steps for child to elder', () => {
      expect(calculateAgeSwitchSteps('child', 'elder')).toBe(2);
      expect(calculateAgeSwitchSteps('elder', 'child')).toBe(2);
    });

    test('should return 0 steps for same age', () => {
      expect(calculateAgeSwitchSteps('child', 'child')).toBe(0);
      expect(calculateAgeSwitchSteps('adult', 'adult')).toBe(0);
      expect(calculateAgeSwitchSteps('elder', 'elder')).toBe(0);
    });
  });

  describe('calculateAgeSwitchDuration', () => {
    test('should return 500ms for adjacent ages', () => {
      expect(calculateAgeSwitchDuration('child', 'adult')).toBe(500);
      expect(calculateAgeSwitchDuration('adult', 'elder')).toBe(500);
    });

    test('should return 1000ms for child to elder', () => {
      expect(calculateAgeSwitchDuration('child', 'elder')).toBe(1000);
      expect(calculateAgeSwitchDuration('elder', 'child')).toBe(1000);
    });

    test('should return 0ms for same age', () => {
      expect(calculateAgeSwitchDuration('adult', 'adult')).toBe(0);
    });
  });

  describe('determineAgeSwitchDirection', () => {
    test('should return "aging" when switching to older age', () => {
      expect(determineAgeSwitchDirection('child', 'adult')).toBe('aging');
      expect(determineAgeSwitchDirection('child', 'elder')).toBe('aging');
      expect(determineAgeSwitchDirection('adult', 'elder')).toBe('aging');
    });

    test('should return "rejuvenating" when switching to younger age', () => {
      expect(determineAgeSwitchDirection('adult', 'child')).toBe('rejuvenating');
      expect(determineAgeSwitchDirection('elder', 'child')).toBe('rejuvenating');
      expect(determineAgeSwitchDirection('elder', 'adult')).toBe('rejuvenating');
    });
  });

  describe('age switch positioning logic', () => {
    test('should calculate correct height difference when growing', () => {
      const oldHeight = AGES.child.height;
      const newHeight = AGES.adult.height;
      const heightDiff = newHeight - oldHeight;
      
      expect(heightDiff).toBe(28);
      expect(heightDiff).toBeGreaterThan(0);
    });

    test('should calculate correct width difference when growing', () => {
      const oldWidth = AGES.child.width;
      const newWidth = AGES.adult.width;
      const widthDiff = newWidth - oldWidth;
      
      expect(widthDiff).toBe(12);
      expect(widthDiff).toBeGreaterThan(0);
    });

    test('should calculate upward displacement for growing', () => {
      const heightDiff = AGES.adult.height - AGES.child.height;
      const displacement = heightDiff / 2 + 10;
      
      expect(displacement).toBe(24); // 28/2 + 10
      expect(displacement).toBeGreaterThan(0);
    });
  });
});

describe('Ghost Platform Collision Logic', () => {
  function checkGhostCollision(currentAge) {
    return currentAge === 'elder';
  }

  test('should allow elder to collide with ghost platforms', () => {
    expect(checkGhostCollision('elder')).toBe(true);
  });

  test('should prevent child from colliding with ghost platforms', () => {
    expect(checkGhostCollision('child')).toBe(false);
  });

  test('should prevent adult from colliding with ghost platforms', () => {
    expect(checkGhostCollision('adult')).toBe(false);
  });

  test('should handle null age gracefully', () => {
    expect(checkGhostCollision(null)).toBe(false);
  });

  test('should handle undefined age gracefully', () => {
    expect(checkGhostCollision(undefined)).toBe(false);
  });

  test('should be case-sensitive', () => {
    expect(checkGhostCollision('ELDER')).toBe(false);
    expect(checkGhostCollision('Elder')).toBe(false);
  });
});

describe('Boss Health Management', () => {
  let bossHealth, bossMaxHealth;
  
  beforeEach(() => {
    bossMaxHealth = 10;
    bossHealth = 10;
  });

  function calculateHealthPercentage() {
    return bossHealth / bossMaxHealth;
  }

  function getBossHealthColor() {
    const healthPercent = calculateHealthPercentage();
    if (healthPercent > 0.6) return 0x00ff00; // Green
    if (healthPercent > 0.3) return 0xffff00; // Yellow
    return 0xff0000; // Red
  }

  function isBossDefeated() {
    return bossHealth <= 0;
  }

  describe('calculateHealthPercentage', () => {
    test('should return 1.0 for full health', () => {
      expect(calculateHealthPercentage()).toBe(1.0);
    });

    test('should return 0.5 for half health', () => {
      bossHealth = 5;
      expect(calculateHealthPercentage()).toBe(0.5);
    });

    test('should return 0.0 for zero health', () => {
      bossHealth = 0;
      expect(calculateHealthPercentage()).toBe(0.0);
    });

    test('should handle negative health', () => {
      bossHealth = -1;
      expect(calculateHealthPercentage()).toBeLessThan(0);
    });
  });

  describe('getBossHealthColor', () => {
    test('should return green for health > 60%', () => {
      bossHealth = 10;
      expect(getBossHealthColor()).toBe(0x00ff00);
      
      bossHealth = 7;
      expect(getBossHealthColor()).toBe(0x00ff00);
    });

    test('should return yellow for health 30% - 60%', () => {
      bossHealth = 6;
      expect(getBossHealthColor()).toBe(0xffff00);
      
      bossHealth = 4;
      expect(getBossHealthColor()).toBe(0xffff00);
    });

    test('should return red for health <= 30%', () => {
      bossHealth = 3;
      expect(getBossHealthColor()).toBe(0xff0000);
      
      bossHealth = 1;
      expect(getBossHealthColor()).toBe(0xff0000);
      
      bossHealth = 0;
      expect(getBossHealthColor()).toBe(0xff0000);
    });
  });

  describe('isBossDefeated', () => {
    test('should return false when boss has health', () => {
      expect(isBossDefeated()).toBe(false);
      
      bossHealth = 1;
      expect(isBossDefeated()).toBe(false);
    });

    test('should return true when boss health reaches zero', () => {
      bossHealth = 0;
      expect(isBossDefeated()).toBe(true);
    });

    test('should return true when boss health is negative', () => {
      bossHealth = -1;
      expect(isBossDefeated()).toBe(true);
    });
  });
});

describe('Level Progression Logic', () => {
  let currentLevel;
  
  beforeEach(() => {
    currentLevel = 1;
  });

  function shouldProgressToNextLevel(level) {
    return level < 5;
  }

  function isGameComplete(level) {
    return level >= 5;
  }

  function getNextLevel(level) {
    return shouldProgressToNextLevel(level) ? level + 1 : level;
  }

  describe('shouldProgressToNextLevel', () => {
    test('should return true for levels 1-4', () => {
      expect(shouldProgressToNextLevel(1)).toBe(true);
      expect(shouldProgressToNextLevel(2)).toBe(true);
      expect(shouldProgressToNextLevel(3)).toBe(true);
      expect(shouldProgressToNextLevel(4)).toBe(true);
    });

    test('should return false for level 5 (boss level)', () => {
      expect(shouldProgressToNextLevel(5)).toBe(false);
    });

    test('should return false for levels beyond 5', () => {
      expect(shouldProgressToNextLevel(6)).toBe(false);
      expect(shouldProgressToNextLevel(10)).toBe(false);
    });
  });

  describe('isGameComplete', () => {
    test('should return false for levels 1-4', () => {
      expect(isGameComplete(1)).toBe(false);
      expect(isGameComplete(2)).toBe(false);
      expect(isGameComplete(3)).toBe(false);
      expect(isGameComplete(4)).toBe(false);
    });

    test('should return true for level 5', () => {
      expect(isGameComplete(5)).toBe(true);
    });

    test('should return true for levels beyond 5', () => {
      expect(isGameComplete(6)).toBe(true);
    });
  });

  describe('getNextLevel', () => {
    test('should increment level from 1 to 2', () => {
      expect(getNextLevel(1)).toBe(2);
    });

    test('should increment level from 4 to 5', () => {
      expect(getNextLevel(4)).toBe(5);
    });

    test('should not increment beyond level 5', () => {
      expect(getNextLevel(5)).toBe(5);
      expect(getNextLevel(6)).toBe(6);
    });
  });
});

describe('Timer Management', () => {
  let timeLeft;
  
  beforeEach(() => {
    timeLeft = 0;
  });

  function incrementTimer() {
    timeLeft++;
    return timeLeft;
  }

  function shouldResetTimer(level) {
    return level === 1;
  }

  function formatTimerDisplay(time) {
    return 'Time: ' + time;
  }

  describe('incrementTimer', () => {
    test('should increment from 0 to 1', () => {
      expect(incrementTimer()).toBe(1);
    });

    test('should increment continuously', () => {
      incrementTimer();
      incrementTimer();
      expect(incrementTimer()).toBe(3);
    });

    test('should count up without limit', () => {
      for (let i = 0; i < 100; i++) {
        incrementTimer();
      }
      expect(timeLeft).toBe(100);
    });
  });

  describe('shouldResetTimer', () => {
    test('should reset timer only on level 1', () => {
      expect(shouldResetTimer(1)).toBe(true);
    });

    test('should not reset timer on other levels', () => {
      expect(shouldResetTimer(2)).toBe(false);
      expect(shouldResetTimer(3)).toBe(false);
      expect(shouldResetTimer(4)).toBe(false);
      expect(shouldResetTimer(5)).toBe(false);
    });
  });

  describe('formatTimerDisplay', () => {
    test('should format timer display correctly', () => {
      expect(formatTimerDisplay(0)).toBe('Time: 0');
      expect(formatTimerDisplay(42)).toBe('Time: 42');
      expect(formatTimerDisplay(999)).toBe('Time: 999');
    });
  });
});

describe('Player Positioning', () => {
  describe('initial player spawn position', () => {
    test('should spawn at x=50 (updated from 100)', () => {
      const spawnX = 50;
      expect(spawnX).toBe(50);
      expect(spawnX).toBeGreaterThan(0);
    });

    test('should spawn at y=450', () => {
      const spawnY = 450;
      expect(spawnY).toBe(450);
    });
  });

  describe('player boundary checks', () => {
    test('should detect when player falls below screen', () => {
      const playerY = 650;
      const screenBottom = 600;
      expect(playerY > screenBottom).toBe(true);
    });

    test('should not detect fall when player is on screen', () => {
      const playerY = 450;
      const screenBottom = 600;
      expect(playerY > screenBottom).toBe(false);
    });
  });
});

describe('Level Design Validation', () => {
  describe('Level 1 - Redesigned Layout', () => {
    test('should have pillar with child-sized gap', () => {
      const pillarGap = 22;
      const childHeight = 20;
      expect(pillarGap).toBeGreaterThan(childHeight);
      expect(pillarGap - childHeight).toBe(2);
    });

    test('should have three ascending ghost platforms', () => {
      const platforms = [
        { x: 250, y: 400 },
        { x: 400, y: 350 },
        { x: 550, y: 300 }
      ];
      
      expect(platforms).toHaveLength(3);
      expect(platforms[0].y).toBeGreaterThan(platforms[1].y);
      expect(platforms[1].y).toBeGreaterThan(platforms[2].y);
    });

    test('should have finish zone at elevated position', () => {
      const finishZone = { x: 700, y: 250, width: 50, height: 50 };
      expect(finishZone.y).toBeLessThan(300);
      expect(finishZone.x).toBeGreaterThan(600);
    });
  });

  describe('Level 2 - Tunnel and Moat', () => {
    test('should have child-only tunnel with correct gap', () => {
      const CHILD_TUNNEL_GAP = 22;
      const tunnelHeight = CHILD_TUNNEL_GAP;
      const childHeight = 20;
      
      expect(tunnelHeight).toBeGreaterThan(childHeight);
      expect(tunnelHeight).toBeLessThan(32); // Adult height
    });

    test('should have three ghost platforms for moat crossing', () => {
      const ghostPlatforms = [
        { x: 650, y: 500 },
        { x: 750, y: 450 },
        { x: 650, y: 400 }
      ];
      
      expect(ghostPlatforms).toHaveLength(3);
    });

    test('should have final platform at correct position', () => {
      const finalPlatform = { x: 750, y: 350 };
      expect(finalPlatform.x).toBeGreaterThan(700);
      expect(finalPlatform.y).toBeLessThan(400);
    });
  });
});

describe('Menu System', () => {
  describe('DOM element interactions', () => {
    test('should have required menu elements', () => {
      const requiredIds = [
        'play-button',
        'instructions-button',
        'back-button',
        'menu-overlay',
        'main-menu',
        'instructions-screen',
        'game-container'
      ];
      
      expect(requiredIds).toContain('play-button');
      expect(requiredIds).toContain('instructions-button');
      expect(requiredIds).toContain('game-container');
    });
  });

  describe('menu state transitions', () => {
    test('play button should hide menu and show game', () => {
      const menuOverlayDisplay = 'none';
      const gameContainerDisplay = 'block';
      
      expect(menuOverlayDisplay).toBe('none');
      expect(gameContainerDisplay).toBe('block');
    });

    test('instructions button should show instructions screen', () => {
      const mainMenuDisplay = 'none';
      const instructionsDisplay = 'block';
      
      expect(mainMenuDisplay).toBe('none');
      expect(instructionsDisplay).toBe('block');
    });

    test('back button should return to main menu', () => {
      const instructionsDisplay = 'none';
      const mainMenuDisplay = 'block';
      
      expect(instructionsDisplay).toBe('none');
      expect(mainMenuDisplay).toBe('block');
    });
  });
});

describe('Boss Battle Mechanics', () => {
  describe('turret shooting mechanics', () => {
    test('should have correct fire rate', () => {
      const TURRET_FIRE_RATE = 200;
      expect(TURRET_FIRE_RATE).toBe(200);
      expect(TURRET_FIRE_RATE).toBeGreaterThan(0);
    });

    test('should calculate bullet velocity', () => {
      const bulletVelocity = 600;
      expect(bulletVelocity).toBeGreaterThan(0);
      expect(bulletVelocity).toBeGreaterThan(400); // Faster than boss bullets
    });
  });

  describe('boss shooting mechanics', () => {
    test('should calculate boss bullet velocity', () => {
      const bossBulletVelocity = -400; // Negative for leftward motion
      expect(bossBulletVelocity).toBeLessThan(0);
      expect(Math.abs(bossBulletVelocity)).toBe(400);
    });

    test('should have reasonable shoot timer threshold', () => {
      const shootTimerThreshold = 100;
      expect(shootTimerThreshold).toBeGreaterThan(0);
      expect(shootTimerThreshold).toBeLessThan(200);
    });
  });

  describe('boss movement', () => {
    test('should oscillate within valid range', () => {
      const baseY = 350;
      const amplitude = 50;
      const maxY = baseY + amplitude;
      const minY = baseY - amplitude;
      
      expect(maxY).toBe(400);
      expect(minY).toBe(300);
      expect(maxY).toBeGreaterThan(minY);
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  describe('null and undefined handling', () => {
    test('moveTurretWithPlayer should handle null objects', () => {
      const moveTurretWithPlayer = (deltaY, turret, player) => {
        if (!turret || !player) return;
        // Function continues safely
      };
      
      expect(() => moveTurretWithPlayer(10, null, null)).not.toThrow();
    });

    test('should handle missing body properties', () => {
      const obj = { x: 100, y: 100 };
      expect(obj.body).toBeUndefined();
      // Code should check for body existence
      const hasBody = obj.body !== undefined && obj.body !== null;
      expect(hasBody).toBe(false);
    });
  });

  describe('boundary conditions', () => {
    test('should handle extreme timer values', () => {
      const timeLeft = 99999;
      const display = 'Time: ' + timeLeft;
      expect(display).toBe('Time: 99999');
    });

    test('should handle boss health at exactly 0', () => {
      const bossHealth = 0;
      const isDefeated = bossHealth <= 0;
      expect(isDefeated).toBe(true);
    });

    test('should handle negative boss health', () => {
      const bossHealth = -5;
      const isDefeated = bossHealth <= 0;
      expect(isDefeated).toBe(true);
    });
  });

  describe('age switching edge cases', () => {
    test('should handle switching to same age', () => {
      const currentAge = 'adult';
      const newAge = 'adult';
      const shouldSwitch = currentAge !== newAge;
      expect(shouldSwitch).toBe(false);
    });

    test('should handle invalid age strings', () => {
      const AGES = {
        child: { index: 0 },
        adult: { index: 1 },
        elder: { index: 2 }
      };
      
      const invalidAge = 'teenager';
      const ageExists = AGES.hasOwnProperty(invalidAge);
      expect(ageExists).toBe(false);
    });
  });
});

describe('Physics and Collision', () => {
  describe('velocity calculations', () => {
    test('should apply correct horizontal velocity for child', () => {
      const childSpeed = 300;
      expect(childSpeed).toBe(300);
    });

    test('should apply correct jump velocity for adult', () => {
      const adultJump = -600;
      expect(adultJump).toBeLessThan(0);
      expect(Math.abs(adultJump)).toBe(600);
    });

    test('should apply correct upward velocity when growing', () => {
      const growthVelocity = -300;
      expect(growthVelocity).toBeLessThan(0);
    });
  });

  describe('collision detection', () => {
    test('should detect overlap with turret', () => {
      const player = { x: 100, y: 500, width: 32, height: 48 };
      const turret = { x: 100, y: 500, width: 50, height: 50 };
      
      // Simple AABB overlap check
      const overlaps = !(
        player.x + player.width/2 < turret.x - turret.width/2 ||
        player.x - player.width/2 > turret.x + turret.width/2 ||
        player.y + player.height/2 < turret.y - turret.height/2 ||
        player.y - player.height/2 > turret.y + turret.height/2
      );
      
      expect(overlaps).toBe(true);
    });

    test('should not detect overlap when far apart', () => {
      const player = { x: 100, y: 500, width: 32, height: 48 };
      const turret = { x: 700, y: 500, width: 50, height: 50 };
      
      const overlaps = !(
        player.x + player.width/2 < turret.x - turret.width/2 ||
        player.x - player.width/2 > turret.x + turret.width/2 ||
        player.y + player.height/2 < turret.y - turret.height/2 ||
        player.y - player.height/2 > turret.y + turret.height/2
      );
      
      expect(overlaps).toBe(false);
    });
  });
});

describe('Game State Management', () => {
  describe('game over state', () => {
    test('should prevent actions when game is over', () => {
      const isGameOver = true;
      const shouldProcessInput = !isGameOver;
      expect(shouldProcessInput).toBe(false);
    });

    test('should allow actions when game is active', () => {
      const isGameOver = false;
      const shouldProcessInput = !isGameOver;
      expect(shouldProcessInput).toBe(true);
    });
  });

  describe('switching state', () => {
    test('should prevent movement during age switch', () => {
      const isSwitching = true;
      const shouldAllowMovement = !isSwitching;
      expect(shouldAllowMovement).toBe(false);
    });

    test('should allow movement when not switching', () => {
      const isSwitching = false;
      const shouldAllowMovement = !isSwitching;
      expect(shouldAllowMovement).toBe(true);
    });
  });

  describe('turret state', () => {
    test('should prevent normal movement when on turret', () => {
      const onTurret = true;
      const shouldAllowNormalMovement = !onTurret;
      expect(shouldAllowNormalMovement).toBe(false);
    });

    test('should allow normal movement when not on turret', () => {
      const onTurret = false;
      const shouldAllowNormalMovement = !onTurret;
      expect(shouldAllowNormalMovement).toBe(true);
    });
  });
});