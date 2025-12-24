// Mock Phaser.js for testing
class MockGameObject {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fillColor = color;
    this.active = true;
    this.body = {
      x: x,
      y: y,
      width: width,
      height: height,
      touching: { down: false, up: false, left: false, right: false },
      blocked: { down: false, up: false, left: false, right: false },
      velocity: { x: 0, y: 0 },
      allowGravity: true,
      gravity: { x: 0, y: 0 },
      setVelocityX: jest.fn(function(v) { this.velocity.x = v; }),
      setVelocityY: jest.fn(function(v) { this.velocity.y = v; }),
      setVelocity: jest.fn(function(x, y) { this.velocity.x = x; this.velocity.y = y; }),
      setSize: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      setImmovable: jest.fn(),
      setAllowGravity: jest.fn(),
      setGravity: jest.fn(),
      setAcceleration: jest.fn(),
      updateFromGameObject: jest.fn(),
    };
    this.setAlpha = jest.fn().mockReturnThis();
    this.setOrigin = jest.fn().mockReturnThis();
    this.setVisible = jest.fn().mockReturnThis();
    this.setDepth = jest.fn().mockReturnThis();
    this.setFillStyle = jest.fn();
    this.setSize = jest.fn();
    this.destroy = jest.fn(() => { this.active = false; });
  }
}

class MockGroup {
  constructor() {
    this.children = [];
  }
  add(obj) {
    this.children.push(obj);
  }
  getChildren() {
    return this.children;
  }
  iterate(callback) {
    this.children.forEach(callback);
  }
}

const Phaser = {
  AUTO: 'AUTO',
  Game: jest.fn(),
  Input: {
    Keyboard: {
      KeyCodes: {
        ONE: 49,
        TWO: 50,
        THREE: 51,
        X: 88,
      },
      JustDown: jest.fn(),
    },
  },
  Physics: {
    Arcade: {
      Group: MockGroup,
    },
  },
};

module.exports = Phaser;
module.exports.default = Phaser;