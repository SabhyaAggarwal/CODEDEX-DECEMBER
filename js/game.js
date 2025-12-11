const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let keys;
let currentAge = 'adult'; // child, adult, elder
let ghostPlatforms;
let timerText;
let timeLeft = 60;
let levelTimer;
let infoText;
let currentLevel = 1;
let obstacles;
let finishZone;
let boss;
let bossHealth = 10;
let bossMaxHealth = 10;
let bossHealthBar;
let turret;
let bullets;
let bossBullets;
let isGameOver = false;
let isSwitching = false;
let transitionText;
let transitionIcon;
let currentScene;

// Turret movement constants
const TURRET_MOVE_SPEED = 3;
const TURRET_MIN_Y = 300;
const TURRET_MAX_Y = 400; // Match boss range so no safe spots

// Level design constants
const CHILD_TUNNEL_GAP = 22; // Child is 20px tall, needs small gap

// Age Statistics
const AGES = {
    child: {
        color: 0x00ff00,
        width: 20,
        height: 20,
        speed: 300,
        jump: -400,
        name: 'CHILD',
        index: 0,
        scale: 0.035  // Small scale for child
    },
    adult: {
        color: 0x0000ff,
        width: 32,
        height: 48,
        speed: 200,
        jump: -600,
        name: 'ADULT',
        index: 1,
        scale: 0.08   // Normal scale for adult
    },
    elder: {
        color: 0x808080,
        width: 32,
        height: 40,
        speed: 100,
        jump: -250,
        name: 'ELDER',
        index: 2,
        scale: 0.07   // Slightly smaller than adult
    }
};

function preload() {
    // Load sprite sheets for each age
    // Child uses flatboy sprites from png folder
    // Adult uses adult.png sprite sheet
    // Elder uses elder.png sprite sheet
    
    // Child (flatboy) - Load all frames from png folder
    for (let i = 1; i <= 15; i++) {
        this.load.image(`child_idle${i}`, `assets/png/Idle (${i}).png`);
        this.load.image(`child_walk${i}`, `assets/png/Walk (${i}).png`);
        this.load.image(`child_run${i}`, `assets/png/Run (${i}).png`);
        this.load.image(`child_jump${i}`, `assets/png/Jump (${i}).png`);
        this.load.image(`child_dead${i}`, `assets/png/Dead (${i}).png`);
    }
    
    // Adult - Load sprite sheet
    this.load.spritesheet('adult_sheet', 'assets/adult.png', { 
        frameWidth: 614, 
        frameHeight: 564 
    });
    
    // Elder - Load sprite sheet
    this.load.spritesheet('elder_sheet', 'assets/elder.png', { 
        frameWidth: 614, 
        frameHeight: 564 
    });
    
}

function create() {
    currentScene = this;
    isGameOver = false;
    
    // Create animations for each age
    if (!this.anims.exists('child_idle')) {
        // CHILD animations (from flatboy sprite frames)
        this.anims.create({
            key: 'child_idle',
            frames: Array.from({length: 15}, (_, i) => ({ key: `child_idle${i+1}` })),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'child_walk',
            frames: Array.from({length: 15}, (_, i) => ({ key: `child_walk${i+1}` })),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'child_run',
            frames: Array.from({length: 15}, (_, i) => ({ key: `child_run${i+1}` })),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'child_jump',
            frames: Array.from({length: 15}, (_, i) => ({ key: `child_jump${i+1}` })),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'child_dead',
            frames: Array.from({length: 15}, (_, i) => ({ key: `child_dead${i+1}` })),
            frameRate: 10,
            repeat: 0
        });
        
        // ADULT animations (from adult.png sprite sheet)
        // Assuming adult.png has same frame layout as flatboy
        this.anims.create({
            key: 'adult_idle',
            frames: this.anims.generateFrameNumbers('adult_sheet', { start: 0, end: 14 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'adult_walk',
            frames: this.anims.generateFrameNumbers('adult_sheet', { start: 15, end: 29 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'adult_run',
            frames: this.anims.generateFrameNumbers('adult_sheet', { start: 30, end: 44 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'adult_jump',
            frames: this.anims.generateFrameNumbers('adult_sheet', { start: 45, end: 59 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'adult_dead',
            frames: this.anims.generateFrameNumbers('adult_sheet', { start: 60, end: 74 }),
            frameRate: 10,
            repeat: 0
        });
        
        // ELDER animations (from elder.png sprite sheet)
        this.anims.create({
            key: 'elder_idle',
            frames: this.anims.generateFrameNumbers('elder_sheet', { start: 0, end: 14 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'elder_walk',
            frames: this.anims.generateFrameNumbers('elder_sheet', { start: 15, end: 29 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'elder_run',
            frames: this.anims.generateFrameNumbers('elder_sheet', { start: 30, end: 44 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'elder_jump',
            frames: this.anims.generateFrameNumbers('elder_sheet', { start: 45, end: 59 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'elder_dead',
            frames: this.anims.generateFrameNumbers('elder_sheet', { start: 60, end: 74 }),
            frameRate: 10,
            repeat: 0
        });
    }
    
    // Level Management
    // If scene restart is partial (Phaser restarts scenes completely), 
    // we need to know which level we are on. 
    // Phaser Data or Global variable? 
    // For this prototype, we'll assume reset logic sets currentLevel.
    // If it's a full reload, it starts at 1. 

    // Timer (Count Up)
    // Only reset if Level 1. Otherwise preserve value from previous level.
    if (currentLevel === 1) {
        timeLeft = 0;
        bossHealth = bossMaxHealth; // Reset boss health for new game
    }

    // Safety reset if we just entered level 5? No, create runs every level.
    if (currentLevel === 5) {
        bossHealth = bossMaxHealth;
    }

    // 1. Create Level
    createLevel(this, currentLevel);

    // 2. Create Player (using sprite for current age)
    // Use currentAge to persist state between levels
    const initialStats = AGES[currentAge];
    
    // Determine initial sprite key based on age
    let initialSpriteKey;
    if (currentAge === 'child') {
        initialSpriteKey = 'child_idle1';
    } else if (currentAge === 'adult') {
        initialSpriteKey = 'adult_sheet';
    } else {
        initialSpriteKey = 'elder_sheet';
    }
    
    player = this.add.sprite(100, 520, initialSpriteKey);
    player.setScale(initialStats.scale);
    player.play(`${currentAge}_idle`);
    
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // Set physics body size based on age
    player.body.setSize(initialStats.width, initialStats.height);
    
    // Fix hitbox offset - sprite origin is at center (0.5, 0.5)
    // We need to offset the physics body so it aligns with the bottom of the sprite
    // The sprite is scaled, so actual display height is sprite.height * scale
    // Physics body should be at the bottom of the visual sprite
    const spriteDisplayHeight = player.height * initialStats.scale;
    const spriteDisplayWidth = player.width * initialStats.scale;
    
    // Center the physics body horizontally and align to bottom
    const offsetX = (spriteDisplayWidth - initialStats.width) / 2;
    const offsetY = spriteDisplayHeight - initialStats.height;
    
    player.body.setOffset(offsetX, offsetY);

    // 3. Collisions
    this.physics.add.collider(player, obstacles);
    this.physics.add.collider(player, ghostPlatforms, null, checkGhostCollision, this);

    // 4. Input
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys({
        one: Phaser.Input.Keyboard.KeyCodes.ONE,
        two: Phaser.Input.Keyboard.KeyCodes.TWO,
        three: Phaser.Input.Keyboard.KeyCodes.THREE,
        x: Phaser.Input.Keyboard.KeyCodes.X
    });

    // 5. UI
    timerText = this.add.text(16, 16, 'Time: 0', { fontSize: '32px', fill: '#fff' });
    infoText = this.add.text(16, 50, 'Age: ADULT', { fontSize: '24px', fill: '#aaa' });
    this.add.text(16, 550, 'Controls: Arrows to Move, 1: Child, 2: Adult, 3: Elder', { fontSize: '16px', fill: '#555' });

    // Timer Event
    levelTimer = this.time.addEvent({
        delay: 1000,
        callback: onSecondValues,
        callbackScope: this,
        loop: true
    });

    this.physics.add.overlap(player, finishZone, winGame, null, this);

    // Transition UI
    transitionText = this.add.text(400, 250, '', { fontSize: '32px', fill: '#fff', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setVisible(false).setDepth(100);
    transitionIcon = this.add.text(400, 300, '', { fontSize: '48px', fill: '#ff0', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setVisible(false).setDepth(100);
}

function createLevel(scene, level) {
    // Static obstacles group
    obstacles = scene.physics.add.staticGroup();
    ghostPlatforms = scene.physics.add.staticGroup();
    bullets = scene.physics.add.group({
        allowGravity: false
    });
    bossBullets = scene.physics.add.group({
        allowGravity: false
    });

    console.log('Building Level ' + level);

    // Common Floor
    // Level-specific geometry
    switch (level) {
        case 1: buildLevel1(scene); break;
        case 2: buildLevel2(scene); break;
        case 3: buildLevel3(scene); break;
        case 4: buildLevel4(scene); break;
        case 5: buildBossLevel(scene); break;
        default: buildLevel1(scene);
    }
}

// LEVEL 1: Age-Switching Tutorial - Requires all three ages
function buildLevel1(scene) {
    // Floor
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x654321);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Section 1: High ledge (ADULT ONLY - requires high jump -600)
    // Floor at y=560, ledge top at y=390, gap=170px (only adult can reach)
    let ledge1 = scene.add.rectangle(150, 480, 100, 220, 0x555555);
    scene.physics.add.existing(ledge1, true);
    obstacles.add(ledge1);

    // Section 2: Tight tunnel (CHILD ONLY - 25px gap, child is 20px)
    // Tunnel at comfortable height for child to reach from ledge
    // Floor at 390, height 20 -> top at 380
    // Ceiling should have bottom at 380-25=355, so center at 355-10=345
    let tunnelFloor = scene.add.rectangle(350, 390, 200, 20, 0x555555);
    scene.physics.add.existing(tunnelFloor, true);
    obstacles.add(tunnelFloor);

    let tunnelCeiling = scene.add.rectangle(350, 345, 200, 20, 0x555555);
    scene.physics.add.existing(tunnelCeiling, true);
    obstacles.add(tunnelCeiling);

    // Section 3: Ghost platform gap (ELDER ONLY)
    let platformBefore = scene.add.rectangle(500, 520, 60, 20, 0x555555);
    scene.physics.add.existing(platformBefore, true);
    obstacles.add(platformBefore);

    // Ghost platforms across gap
    let gp1 = scene.add.rectangle(580, 520, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp1, true);
    ghostPlatforms.add(gp1);

    let gp2 = scene.add.rectangle(650, 520, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp2, true);
    ghostPlatforms.add(gp2);

    let platformAfter = scene.add.rectangle(720, 520, 60, 20, 0x555555);
    scene.physics.add.existing(platformAfter, true);
    obstacles.add(platformAfter);

    finishZone = scene.add.rectangle(760, 480, 40, 40, 0x00ff00);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 2: Vertical Tower - Requires Adult jumps, Child tunnels, Elder ghosts
function buildLevel2(scene) {
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x654321);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Stage 1: Adult jump to first platform (130px jump)
    let p1 = scene.add.rectangle(100, 450, 120, 20, 0x555555);
    scene.physics.add.existing(p1, true);
    obstacles.add(p1);

    // Tall wall to prevent shortcuts
    let wall1 = scene.add.rectangle(180, 350, 20, 280, 0x555555);
    scene.physics.add.existing(wall1, true);
    obstacles.add(wall1);

    // Stage 2: Child-only tunnel to reach next area (22px gap)
    // Floor at 465, height 20 -> top at 455
    // Ceiling should have bottom at 455-22=433, so center at 433-10=423
    let tunnelFloor1 = scene.add.rectangle(280, 465, 120, 20, 0x555555);
    scene.physics.add.existing(tunnelFloor1, true);
    obstacles.add(tunnelFloor1);

    let tunnelCeil1 = scene.add.rectangle(280, 423, 120, 20, 0x555555);
    scene.physics.add.existing(tunnelCeil1, true);
    obstacles.add(tunnelCeil1);

    // Stage 3: Adult jump to higher platform (150px jump)
    let p2 = scene.add.rectangle(420, 340, 100, 20, 0x555555);
    scene.physics.add.existing(p2, true);
    obstacles.add(p2);

    // Wall to prevent shortcuts
    let wall2 = scene.add.rectangle(480, 250, 20, 200, 0x555555);
    scene.physics.add.existing(wall2, true);
    obstacles.add(wall2);

    // Stage 4: Ghost platforms (Elder only)
    let gp1 = scene.add.rectangle(540, 340, 60, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp1, true);
    ghostPlatforms.add(gp1);

    let gp2 = scene.add.rectangle(620, 280, 60, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp2, true);
    ghostPlatforms.add(gp2);

    let gp3 = scene.add.rectangle(700, 220, 60, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp3, true);
    ghostPlatforms.add(gp3);

    // Final platform
    let finalPlat = scene.add.rectangle(750, 200, 80, 20, 0x555555);
    scene.physics.add.existing(finalPlat, true);
    obstacles.add(finalPlat);

    finishZone = scene.add.rectangle(770, 160, 40, 40, 0x00ff00);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 3: The Labyrinth - Multiple tunnels and age switches
function buildLevel3(scene) {
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x654321);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Adult stairs to reach upper area
    let s1 = scene.add.rectangle(100, 480, 80, 20, 0x555555);
    scene.physics.add.existing(s1, true);
    obstacles.add(s1);

    let s2 = scene.add.rectangle(200, 380, 80, 20, 0x555555);
    scene.physics.add.existing(s2, true);
    obstacles.add(s2);

    let s3 = scene.add.rectangle(300, 280, 80, 20, 0x555555);
    scene.physics.add.existing(s3, true);
    obstacles.add(s3);

    // Child-only tight tunnel (22px gap, child is 20px tall)
    let tFloor1 = scene.add.rectangle(500, 285, 200, 20, 0x555555);
    scene.physics.add.existing(tFloor1, true);
    obstacles.add(tFloor1);

    let tCeil1 = scene.add.rectangle(500, 243, 200, 20, 0x555555);
    scene.physics.add.existing(tCeil1, true);
    obstacles.add(tCeil1);

    // Wall after tunnel to force drop
    let wall1 = scene.add.rectangle(610, 380, 20, 210, 0x555555);
    scene.physics.add.existing(wall1, true);
    obstacles.add(wall1);

    // Platform below tunnel exit
    let p1 = scene.add.rectangle(670, 480, 80, 20, 0x555555);
    scene.physics.add.existing(p1, true);
    obstacles.add(p1);

    // Elder-only ghost platforms to cross final gap
    let gp1 = scene.add.rectangle(680, 420, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp1, true);
    ghostPlatforms.add(gp1);

    let gp2 = scene.add.rectangle(730, 380, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp2, true);
    ghostPlatforms.add(gp2);

    // Final platform
    let finalP = scene.add.rectangle(770, 360, 60, 20, 0x555555);
    scene.physics.add.existing(finalP, true);
    obstacles.add(finalP);

    // Walls to prevent shortcuts
    let wall2 = scene.add.rectangle(390, 380, 20, 240, 0x555555);
    scene.physics.add.existing(wall2, true);
    obstacles.add(wall2);

    let wall3 = scene.add.rectangle(640, 520, 20, 140, 0x555555);
    scene.physics.add.existing(wall3, true);
    obstacles.add(wall3);

    finishZone = scene.add.rectangle(770, 320, 40, 40, 0x00ff00);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 4: Ghost Maze - Complex Elder navigation with obstacles
function buildLevel4(scene) {
    let startPlat = scene.add.rectangle(100, 540, 160, 40, 0x654321);
    scene.physics.add.existing(startPlat, true);
    obstacles.add(startPlat);

    // First set of ghost platforms (Elder must navigate)
    let gp1 = scene.add.rectangle(220, 540, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp1, true);
    ghostPlatforms.add(gp1);

    let gp2 = scene.add.rectangle(300, 540, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp2, true);
    ghostPlatforms.add(gp2);

    // Solid platform mid-way
    let midPlat = scene.add.rectangle(380, 540, 60, 20, 0x555555);
    scene.physics.add.existing(midPlat, true);
    obstacles.add(midPlat);

    // Child-only tunnel shortcut bypass (22px gap)
    // Floor at 485, height 20 -> top at 475
    // Ceiling should have bottom at 475-22=453, so center at 453-10=443
    let tunnelF = scene.add.rectangle(380, 485, 60, 20, 0x555555);
    scene.physics.add.existing(tunnelF, true);
    obstacles.add(tunnelF);

    let tunnelC = scene.add.rectangle(380, 443, 60, 20, 0x555555);
    scene.physics.add.existing(tunnelC, true);
    obstacles.add(tunnelC);

    // More ghost platforms after tunnel (Elder path)
    let gp3 = scene.add.rectangle(460, 480, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp3, true);
    ghostPlatforms.add(gp3);

    let gp4 = scene.add.rectangle(540, 440, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp4, true);
    ghostPlatforms.add(gp4);

    let gp5 = scene.add.rectangle(620, 400, 50, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp5, true);
    ghostPlatforms.add(gp5);

    // Adult jump required to reach final platform
    let preFinal = scene.add.rectangle(680, 400, 60, 20, 0x555555);
    scene.physics.add.existing(preFinal, true);
    obstacles.add(preFinal);

    // High final platform (Adult jump needed)
    let finalPlat = scene.add.rectangle(750, 280, 80, 20, 0x555555);
    scene.physics.add.existing(finalPlat, true);
    obstacles.add(finalPlat);

    // Walls to block shortcuts
    let wall1 = scene.add.rectangle(450, 520, 20, 140, 0x555555);
    scene.physics.add.existing(wall1, true);
    obstacles.add(wall1);

    let wall2 = scene.add.rectangle(600, 480, 20, 200, 0x555555);
    scene.physics.add.existing(wall2, true);
    obstacles.add(wall2);

    finishZone = scene.add.rectangle(760, 240, 40, 40, 0x00ff00);
    scene.physics.add.existing(finishZone, true);
}
function buildBossLevel(scene) {
    // Boss Arena
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x654321);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Boss
    boss = scene.add.rectangle(700, 500, 80, 120, 0xff0000);
    scene.physics.add.existing(boss);
    boss.body.setImmovable(true);
    boss.body.allowGravity = false; // Fix: Prevent falling

    // Turret (Start invisible?)
    turret = scene.add.rectangle(100, 500, 50, 50, 0xffff00);
    scene.physics.add.existing(turret);
    turret.body.allowGravity = false; // Fix: Prevent falling

    scene.physics.add.collider(player, boss, hitBossBody, null, scene);

    scene.add.text(400, 100, 'BOSS FIGHT!', { fontSize: '32px', fill: '#f00' }).setOrigin(0.5);
    
    // Boss health bar
    scene.add.text(400, 30, 'BOSS HEALTH:', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
    // Background bar
    scene.add.rectangle(400, 55, 304, 24, 0x000000).setOrigin(0.5);
    // Health bar (will be updated in updateBossLevel)
    bossHealthBar = scene.add.rectangle(400, 55, 300, 20, 0xff0000).setOrigin(0.5);
}

function update() {
    if (isGameOver) return;
    if (isSwitching) return;

    // Movement (disabled when on turret)
    if (!onTurret) {
        if (cursors.left.isDown) {
            player.body.setVelocityX(-AGES[currentAge].speed);
            player.setFlipX(true); // Face left
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(AGES[currentAge].speed);
            player.setFlipX(false); // Face right
        } else {
            player.body.setVelocityX(0);
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.body.setVelocityY(AGES[currentAge].jump);
        }
    }

    // Animation state machine
    const velocity = player.body.velocity;
    const absVelX = Math.abs(velocity.x);
    const isOnGround = player.body.touching.down;
    
    // Determine animation suffix based on current age
    const animPrefix = currentAge;
    
    if (!isOnGround) {
        // In air - play jump animation for current age
        const jumpAnim = `${animPrefix}_jump`;
        if (player.anims.currentAnim?.key !== jumpAnim) {
            player.play(jumpAnim);
        }
    } else if (absVelX === 0) {
        // Standing still - play idle animation for current age
        const idleAnim = `${animPrefix}_idle`;
        if (player.anims.currentAnim?.key !== idleAnim) {
            player.play(idleAnim);
        }
    } else if (absVelX < 150) {
        // Walking - play walk animation for current age
        const walkAnim = `${animPrefix}_walk`;
        if (player.anims.currentAnim?.key !== walkAnim) {
            player.play(walkAnim);
        }
    } else {
        // Running - play run animation for current age
        const runAnim = `${animPrefix}_run`;
        if (player.anims.currentAnim?.key !== runAnim) {
            player.play(runAnim);
        }
    }

    // Age Switching
    if (Phaser.Input.Keyboard.JustDown(keys.one)) switchAgeRequest('child');
    if (Phaser.Input.Keyboard.JustDown(keys.two)) switchAgeRequest('adult');
    if (Phaser.Input.Keyboard.JustDown(keys.three)) switchAgeRequest('elder');

    // Ghost Platform Visibility
    ghostPlatforms.children.iterate((plat) => {
        if (currentAge === 'elder') {
            plat.setAlpha(1);
        } else {
            plat.setAlpha(0.1);
        }
    });

    // Reset if fell
    if (player.y > 600) {
        failLevel();
    }
    // Boss Level Logic
    if (currentLevel === 5) {
        updateBossLevel();
    }
}

let onTurret = false;
let bossDir = 1;
let bossShootTimer = 0;
let turretShootCooldown = 0;
const TURRET_FIRE_RATE = 200; // ms between shots

/**
 * Move turret and player together vertically
 * @param {number} deltaY - Amount to move in pixels (positive = down, negative = up). 
 *                          Final position will be clamped to TURRET_MIN_Y and TURRET_MAX_Y.
 *                          If turret or player objects don't exist, function returns without action.
 */
function moveTurretWithPlayer(deltaY) {
    // Safety check for object existence
    if (!turret || !player) return;
    
    const newY = turret.y + deltaY;
    // Clamp to bounds and update both turret and player atomically
    const clampedY = Math.max(TURRET_MIN_Y, Math.min(TURRET_MAX_Y, newY));
    turret.y = clampedY;
    player.y = clampedY;
    // Sync physics bodies with visual positions
    if (turret.body) turret.body.updateFromGameObject();
    if (player.body) player.body.updateFromGameObject();
}

function updateBossLevel() {
    if (isGameOver) return;
    // Guard against boss being undefined or destroyed
    if (!boss || !boss.active) return;

    // Update boss health bar
    if (bossHealthBar && bossHealthBar.active) {
        const healthPercent = bossHealth / bossMaxHealth;
        bossHealthBar.width = 300 * healthPercent;
        // Update color based on health
        if (healthPercent > 0.6) {
            bossHealthBar.fillColor = 0x00ff00; // Green
        } else if (healthPercent > 0.3) {
            bossHealthBar.fillColor = 0xffff00; // Yellow
        } else {
            bossHealthBar.fillColor = 0xff0000; // Red
        }
    }

    // 1. Boss AI
    // Move up and down? Or side to side?
    // "He will also turn and try to shoot you while you are using the turret"
    // Boss is roughly at x=700. Player interacts with turret at x=100.
    // If player jumps over boss to go behind (x > 700), boss turns.

    if (player.x < boss.x) {
        // Player is left (normal)
        boss.x = 700; // Stay put? Or move?
    } else {
        // Player is behind
        // Boss faces right?
    }

    // Simple Boss Movement: Hover Y
    // Floor is at 580. Boss height is 120 (half-height 60).
    // range: 300-400.
    boss.y = 350 + Math.sin(game.getTime() / 500) * 50;

    // Shoot at player (only if boss exists)
    bossShootTimer++;
    if (bossShootTimer > 100) {
        bossShootTimer = 0;
        let bullet = currentScene.add.rectangle(boss.x, boss.y, 20, 20, 0xff0000);
        currentScene.physics.add.existing(bullet);

        // FORCE PHYSICS SETTINGS
        if (bullet.body) {
            bullet.body.setAllowGravity(false);
            bullet.body.allowGravity = false; // Property
            bullet.body.setGravity(0, 0);     // Vector
            bullet.body.gravity.set(0, 0);    // Property
            bullet.body.setAcceleration(0, 0);
        }
        bossBullets.add(bullet);

        // Shoot straight to the left (towards the player area)
        bullet.body.setVelocity(-400, 0);
        bullet.rotation = Math.PI; // Visual Rotation pointing left
    }

    // 2. Turret Interaction
    // Fix: If onTurret, we don't need overlap to exit.
    // Logic: (Check overlap AND Key) OR (OnTurret AND Key)
    // Simplify: if KeyDown X -> Check state.
    if (Phaser.Input.Keyboard.JustDown(keys.x)) {
        if (onTurret) {
            // Exit logic
            onTurret = false;
            player.x = turret.x;
            player.y = turret.y - 50;
            // Keep current age when exiting turret
        } else if (currentScene.physics.overlap(player, turret)) {
            // Enter logic
            onTurret = true;
            // Position player at turret location (x and initial y)
            player.x = turret.x;
            moveTurretWithPlayer(0); // Sync positions using helper function
            // Player remains visible and vulnerable while on turret to increase difficulty
            // Must quickly enter/exit to avoid boss bullets while shooting
            // Use arrow keys to move turret up/down, player moves with it
            infoText.setText('Mode: TURRET (Arrows: Move, Space: Shoot, X: Exit)');
        }
    }

    if (onTurret) {
        // Keep player stuck to turret - prevent falling from gravity
        player.x = turret.x;
        player.y = turret.y;
        player.body.setVelocity(0, 0); // Zero out velocity to prevent gravity effect
        // Ensure physics body updates are applied
        player.body.updateFromGameObject();
        
        // Turret vertical movement with arrow keys
        if (cursors.up.isDown) {
            moveTurretWithPlayer(-TURRET_MOVE_SPEED);
        } else if (cursors.down.isDown) {
            moveTurretWithPlayer(TURRET_MOVE_SPEED);
        }
        
        // Shooting logic
        if (cursors.space.isDown) {
            if (currentScene.time.now > turretShootCooldown) {
                turretShootCooldown = currentScene.time.now + TURRET_FIRE_RATE;
                let bullet = currentScene.add.rectangle(turret.x, turret.y, 10, 10, 0xffff00);
                currentScene.physics.add.existing(bullet);

                // FORCE PHYSICS SETTINGS
                if (bullet.body) {
                    bullet.body.setAllowGravity(false);
                    bullet.body.allowGravity = false; // Property
                    bullet.body.setGravity(0, 0);     // Vector
                    bullet.body.gravity.set(0, 0);    // Property
                    bullet.body.setAcceleration(0, 0);
                }
                bullets.add(bullet);

                // Shoot straight to the right (no tracking)
                bullet.body.setVelocity(600, 0);
                bullet.rotation = 0; // Visual Rotation pointing right
            }
        }
    }

    // Collisions
    currentScene.physics.overlap(bullets, boss, damageBoss, null, currentScene);
    currentScene.physics.overlap(bossBullets, player, damagePlayer, null, currentScene);

    // Clean up off-screen bullets to prevent memory leaks
    cleanupOffScreenBullets(bullets);
    cleanupOffScreenBullets(bossBullets);
}

/**
 * Clean up bullets that have moved off-screen to prevent memory leaks
 * @param {Phaser.Physics.Arcade.Group} bulletGroup - The bullet group to clean up
 */
function cleanupOffScreenBullets(bulletGroup) {
    const margin = 50;
    const maxX = config.width + margin;
    const minX = -margin;
    const maxY = config.height + margin;
    const minY = -margin;
    
    // Iterate over a copy for safe removal during iteration
    const bullets = bulletGroup.getChildren().slice();
    for (const bullet of bullets) {
        if (bullet.x > maxX || bullet.x < minX || bullet.y > maxY || bullet.y < minY) {
            bullet.destroy();
        }
    }
}

function damageBoss(boss, bullet) {
    bullet.destroy();
    bossHealth--;

    // Boss is a Rectangle, no setTint. Use setFillStyle.
    boss.lastColor = boss.fillColor;
    boss.setFillStyle(0xffaa00);
    currentScene.time.delayedCall(100, () => {
        if (boss && boss.active) boss.setFillStyle(0xff0000); // Standard red
    });

    if (bossHealth <= 0) {
        boss.destroy();
        winGame(player, null);
    }
}

function damagePlayer(player, bullet) {
    bullet.destroy();
    // Player can be hit at any time, including while using turret
    failLevel();
}
function switchAge(newAge) {
    if (currentAge === newAge) return;

    const oldHeight = AGES[currentAge].height;
    const oldWidth = AGES[currentAge].width;
    currentAge = newAge;
    const stats = AGES[currentAge];

    // Check if there's enough space to grow
    if (stats.height > oldHeight || stats.width > oldWidth) {
        const heightDiff = stats.height - oldHeight;
        const widthDiff = stats.width - oldWidth;
        
        // Move up by the height difference plus extra margin to avoid floor and ceiling
        player.y -= heightDiff / 2 + 10;
        
        // If width is increasing and we're near a wall, push away horizontally
        if (widthDiff > 0) {
            // Check blocked directions using physics body before resizing
            const wasBlockedLeft = player.body.blocked.left || player.body.touching.left;
            const wasBlockedRight = player.body.blocked.right || player.body.touching.right;
            
            if (wasBlockedLeft) {
                // Push right away from left wall
                player.x += widthDiff + 10;
            } else if (wasBlockedRight) {
                // Push left away from right wall  
                player.x -= widthDiff + 10;
            }
        }
    }

    // Update sprite scale and physics body size after position adjustments
    player.setScale(stats.scale);
    player.body.setSize(stats.width, stats.height);
    
    // Fix hitbox offset - align physics body to bottom of sprite
    const spriteDisplayHeight = player.height * stats.scale;
    const spriteDisplayWidth = player.width * stats.scale;
    const offsetX = (spriteDisplayWidth - stats.width) / 2;
    const offsetY = spriteDisplayHeight - stats.height;
    player.body.setOffset(offsetX, offsetY);
    
    // Update body position after all adjustments
    player.body.updateFromGameObject();

    // Only apply upward velocity when growing to help escape tight spaces
    if (stats.height > oldHeight) {
        player.body.setVelocityY(-300);
    }
    
    // Switch to correct animation for new age
    player.play(`${currentAge}_idle`);

    infoText.setText('Age: ' + stats.name);
}

function switchAgeRequest(newAgeKey) {
    if (isSwitching || currentAge === newAgeKey) return;

    const currentStats = AGES[currentAge];
    const newStats = AGES[newAgeKey];

    // Calculate difference
    const diff = newStats.index - currentStats.index;
    const steps = Math.abs(diff);
    if (steps === 0) return;

    isSwitching = true;

    // Pause Game
    currentScene.physics.pause();
    levelTimer.paused = true;
    // Use tint for sprites instead of fillColor
    player.setTint(0x555555);

    // Determine duration and icon
    const baseDelay = 500; // 0.5 seconds per step
    const duration = steps * baseDelay;
    const icon = diff > 0 ? '>>' : '<<';
    const text = diff > 0 ? 'AGING...' : 'REJUVENATING...';

    // Show visuals
    transitionText.setText(text).setVisible(true);
    transitionIcon.setText(icon).setVisible(true);

    // Delayed Event (Using native setTimeout to be independent of Phaser clock)
    console.log('Starting timeout for ' + duration + 'ms');
    window.setTimeout(() => {
        console.log('Timeout finished, calling completeSwitch');
        completeSwitch(newAgeKey);
    }, duration);
}

function completeSwitch(newAgeKey) {
    console.log('Executing completeSwitch for ' + newAgeKey);
    switchAge(newAgeKey);

    // Resume Game
    isSwitching = false;
    currentScene.physics.resume();
    levelTimer.paused = false;
    // Clear tint to restore normal sprite color
    player.clearTint();

    // Hide visuals
    transitionText.setVisible(false);
    transitionIcon.setVisible(false);
}

function checkGhostCollision(player, platform) {
    // Only collide if Elder
    return currentAge === 'elder';
}

function onSecondValues() {
    timeLeft++;
    timerText.setText('Time: ' + timeLeft);
    // Removed reset limit. Count Up.
}

function failLevel() {
    // restart scene
    currentScene.scene.restart();
}

function winGame(player, goal) {
    if (isGameOver) return;

    if (currentLevel < 5) {
        console.log('Level ' + currentLevel + ' Complete');
        currentLevel++;
        currentScene.scene.restart();
    } else {
        isGameOver = true;
        timerText.setText('YOU WON!');
        levelTimer.remove();
        player.body.setVelocity(0, 0);
        currentScene.add.text(400, 300, 'GAME COMPLETE', { fontSize: '64px', fill: '#0f0' }).setOrigin(0.5);
    }
}

function hitBossBody(player, boss) {
    // Damage player?
    failLevel();
}
