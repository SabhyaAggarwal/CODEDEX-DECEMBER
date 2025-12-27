const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a0015',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
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

let game;

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

// Mobile control states
let mobileControls = {
    left: false,
    right: false,
    jump: false,
    ageSwitch: null,
    turretToggle: false,
    aimUp: false,
    aimDown: false,
    fire: false
};


// Turret movement constants
const TURRET_MOVE_SPEED = 3;
const TURRET_MIN_Y = 300;
const TURRET_MAX_Y = 400; // Match boss range so no safe spots

// Level design constants
const CHILD_TUNNEL_GAP = 22; // Child is 20px tall, needs small gap

// Age Statistics - Cyberpunk Theme
const AGES = {
    child: {
        color: 0x00ffff,  // Cyan
        width: 20,
        height: 20,
        speed: 300,
        jump: -400,
        name: 'CHILD',
        index: 0
    },
    adult: {
        color: 0xff00ff,  // Magenta/Pink
        width: 32,
        height: 48,
        speed: 200,
        jump: -600,
        name: 'ADULT',
        index: 1
    },
    elder: {
        color: 0x9d00ff,  // Purple
        width: 32,
        height: 40,
        speed: 100,
        jump: -500,
        name: 'ELDER',
        index: 2
    }
};

function preload() {
    // No assets to preload, using geometric shapes
}

function create() {
    currentScene = this;
    isGameOver = false;
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

    // 2. Create Player
    // Use currentAge to persist state between levels
    const initialStats = AGES[currentAge];
    player = this.add.rectangle(50, 450, initialStats.width, initialStats.height, initialStats.color);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // Explicitly set body size to match if it wasn't picked up correctly (though existing() usually does)
    player.body.setSize(initialStats.width, initialStats.height);

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

// LEVEL 1: Redesigned based on user image
function buildLevel1(scene) {
    // Floor - Dark purple
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x1a0033);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Wall on the extreme left - Dark cyan
    let wall1 = scene.add.rectangle(10, 300, 20, 600, 0x003344);
    scene.physics.add.existing(wall1, true);
    obstacles.add(wall1);

    // Tall pillar with a gap for the child (22px high) - Purple
    // Floor top is at y=560.
    let pillarBase = scene.add.rectangle(100, 550, 40, 20, 0x4d0099);
    scene.physics.add.existing(pillarBase, true);
    obstacles.add(pillarBase);

    // Gap of 22px above the base. Base top is at 540. Pillar bottom is at 518.
    let pillarTop = scene.add.rectangle(100, 268, 40, 500, 0x4d0099);
    scene.physics.add.existing(pillarTop, true);
    obstacles.add(pillarTop);

    // Three ascending ghost platforms - Cyan glow
    let plat1 = scene.add.rectangle(250, 400, 100, 20, 0x00ffff).setAlpha(0.3);
    scene.physics.add.existing(plat1, true);
    ghostPlatforms.add(plat1);

    let plat2 = scene.add.rectangle(400, 350, 100, 20, 0x00ffff).setAlpha(0.3);
    scene.physics.add.existing(plat2, true);
    ghostPlatforms.add(plat2);

    let plat3 = scene.add.rectangle(550, 300, 100, 20, 0x00ffff).setAlpha(0.3);
    scene.physics.add.existing(plat3, true);
    ghostPlatforms.add(plat3);

    // Finish zone - Bright pink
    finishZone = scene.add.rectangle(700, 250, 50, 50, 0xff0080);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 2: Vertical Tower - Requires Adult jumps, Child tunnels, Elder ghosts
function buildLevel2(scene) {
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x1a0033);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Stage 1: Adult jump to first platform (130px jump) - Magenta
    let p1 = scene.add.rectangle(100, 450, 120, 20, 0x660066);
    scene.physics.add.existing(p1, true);
    obstacles.add(p1);

    // Tall wall to prevent shortcuts - Dark purple
    let wall1 = scene.add.rectangle(180, 350, 20, 280, 0x330066);
    scene.physics.add.existing(wall1, true);
    obstacles.add(wall1);

    // Stage 2: Child-only tunnel to reach next area (22px gap) - Cyan tint
    // Floor at 465, height 20 -> top at 455
    // Ceiling should have bottom at 455-22=433, so center at 433-10=423
    let tunnelFloor1 = scene.add.rectangle(280, 465, 120, 20, 0x004466);
    scene.physics.add.existing(tunnelFloor1, true);
    obstacles.add(tunnelFloor1);

    let tunnelCeil1 = scene.add.rectangle(280, 423, 120, 20, 0x004466);
    scene.physics.add.existing(tunnelCeil1, true);
    obstacles.add(tunnelCeil1);

    // Stage 3: Adult jump to higher platform (150px jump) - Magenta
    let p2 = scene.add.rectangle(420, 340, 100, 20, 0x660066);
    scene.physics.add.existing(p2, true);
    obstacles.add(p2);

    // Wall to prevent shortcuts - Dark purple
    let wall2 = scene.add.rectangle(480, 250, 20, 200, 0x330066);
    scene.physics.add.existing(wall2, true);
    obstacles.add(wall2);

    // Stage 4: Ghost platforms (Elder only) - Cyan glow
    let gp1 = scene.add.rectangle(540, 340, 60, 20, 0x00ffff).setAlpha(0.3);
    scene.physics.add.existing(gp1, true);
    ghostPlatforms.add(gp1);

    let gp2 = scene.add.rectangle(620, 280, 60, 20, 0x00ffff).setAlpha(0.3);
    scene.physics.add.existing(gp2, true);
    ghostPlatforms.add(gp2);

    let gp3 = scene.add.rectangle(700, 220, 60, 20, 0x00ffff).setAlpha(0.3);
    scene.physics.add.existing(gp3, true);
    ghostPlatforms.add(gp3);

    // Final platform - Pink
    let finalPlat = scene.add.rectangle(750, 200, 80, 20, 0xff0099);
    scene.physics.add.existing(finalPlat, true);
    obstacles.add(finalPlat);

    finishZone = scene.add.rectangle(770, 160, 40, 40, 0xff0080);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 3: The Gauntlet - A test of all forms
function buildLevel3(scene) {
    // Floor
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x1a0033);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Part 1: Child Tunnel
    // Wall with a small gap at the bottom.
    let wall1 = scene.add.rectangle(200, 450, 40, 220, 0x660066);
    scene.physics.add.existing(wall1, true);
    obstacles.add(wall1);
    // Create the gap by placing a ceiling object. Floor top is 560.
    let tunnelCeiling = scene.add.rectangle(200, 560 - 20 - CHILD_TUNNEL_GAP, 40, 20, 0x660066);
    scene.physics.add.existing(tunnelCeiling, true);
    obstacles.add(tunnelCeiling);


    // Part 2: Adult Jumps
    // A platform after the tunnel.
    let plat1 = scene.add.rectangle(350, 500, 100, 20, 0x660066);
    scene.physics.add.existing(plat1, true);
    obstacles.add(plat1);

    // Higher platform requiring a good adult jump.
    let plat2 = scene.add.rectangle(500, 400, 100, 20, 0x660066);
    scene.physics.add.existing(plat2, true);
    obstacles.add(plat2);

    // Highest platform in this section.
    let plat3 = scene.add.rectangle(350, 300, 100, 20, 0x660066);
    scene.physics.add.existing(plat3, true);
    obstacles.add(plat3);


    // Part 3: Elder Ghost Bridge
    // A gap that requires the Elder to cross.
    let ghost1 = scene.add.rectangle(500, 300, 80, 20, 0x00ffff).setAlpha(0.3);
    scene.physics.add.existing(ghost1, true);
    ghostPlatforms.add(ghost1);

    let ghost2 = scene.add.rectangle(650, 300, 80, 20, 0x00ffff).setAlpha(0.3);
    scene.physics.add.existing(ghost2, true);
    ghostPlatforms.add(ghost2);

    // Final platform with the finish zone.
    let finalPlat = scene.add.rectangle(750, 280, 100, 40, 0x660066);
    scene.physics.add.existing(finalPlat, true);
    obstacles.add(finalPlat);

    finishZone = scene.add.rectangle(750, 240, 40, 40, 0xff0080);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 4: The Choice - A puzzle of paths
function buildLevel4(scene) {
    // Floor
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x1a0033);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Starting platform.
    let startPlat = scene.add.rectangle(100, 500, 150, 20, 0x660066);
    scene.physics.add.existing(startPlat, true);
    obstacles.add(startPlat);

    // The split point.
    let wall1 = scene.add.rectangle(250, 400, 40, 200, 0x660066);
    scene.physics.add.existing(wall1, true);
    obstacles.add(wall1);

    // Path 1: Child's Shortcut
    // A low tunnel that leads directly to the end.
    let tunnelF = scene.add.rectangle(350, 505, 150, 20, 0x660066);
    scene.physics.add.existing(tunnelF, true);
    obstacles.add(tunnelF);
    let tunnelC = scene.add.rectangle(350, 505 - CHILD_TUNNEL_GAP, 150, 20, 0x660066);
    scene.physics.add.existing(tunnelC, true);
    obstacles.add(tunnelC);

    // Path 2: Adult's Gauntlet
    // A series of platforms that are too high for the Child.
    let plat1 = scene.add.rectangle(350, 400, 100, 20, 0x660066);
    scene.physics.add.existing(plat1, true);
    obstacles.add(plat1);

    let plat2 = scene.add.rectangle(500, 300, 100, 20, 0x660066);
    scene.physics.add.existing(plat2, true);
    obstacles.add(plat2);

    // A drop-down to the final section.
    let plat3 = scene.add.rectangle(650, 400, 100, 20, 0x660066);
    scene.physics.add.existing(plat3, true);
    obstacles.add(plat3);


    // Both paths converge here.
    let finalPlat = scene.add.rectangle(750, 500, 100, 20, 0x660066);
    scene.physics.add.existing(finalPlat, true);
    obstacles.add(finalPlat);

    finishZone = scene.add.rectangle(750, 450, 40, 40, 0xff0080);
    scene.physics.add.existing(finishZone, true);
}
function buildBossLevel(scene) {
    // Boss Arena
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x1a0033);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Boss - Hot pink/magenta
    boss = scene.add.rectangle(700, 500, 80, 120, 0xff0099);
    scene.physics.add.existing(boss);
    boss.body.setImmovable(true);
    boss.body.allowGravity = false; // Fix: Prevent falling

    // Turret - Cyan
    turret = scene.add.rectangle(100, 500, 50, 50, 0x00ffff);
    scene.physics.add.existing(turret);
    turret.body.allowGravity = false; // Fix: Prevent falling

    scene.physics.add.collider(player, boss, hitBossBody, null, scene);

    scene.add.text(400, 100, 'BOSS FIGHT!', { fontSize: '32px', fill: '#ff00ff' }).setOrigin(0.5);
    
    // Boss health bar
    scene.add.text(400, 30, 'BOSS HEALTH:', { fontSize: '20px', fill: '#00ffff' }).setOrigin(0.5);
    // Background bar
    scene.add.rectangle(400, 55, 304, 24, 0x0a0015).setOrigin(0.5);
    // Health bar (will be updated in updateBossLevel)
    bossHealthBar = scene.add.rectangle(400, 55, 300, 20, 0xff0099).setOrigin(0.5);
    
    // Show boss controls on mobile
    if (typeof window.showBossControls === 'function') {
        window.showBossControls(true);
    }
}

function update() {
    if (isGameOver) return;
    if (isSwitching) return;

    // Movement (disabled when on turret)
    if (!onTurret) {
        if (cursors.left.isDown || mobileControls.left) {
            player.body.setVelocityX(-AGES[currentAge].speed);
        } else if (cursors.right.isDown || mobileControls.right) {
            player.body.setVelocityX(AGES[currentAge].speed);
        } else {
            player.body.setVelocityX(0);
        }

        if ((cursors.up.isDown || mobileControls.jump) && player.body.touching.down) {
            player.body.setVelocityY(AGES[currentAge].jump);
        }
    }

    // Age Switching
    if (Phaser.Input.Keyboard.JustDown(keys.one) || mobileControls.ageSwitch === 'child') {
        switchAgeRequest('child');
        mobileControls.ageSwitch = null;
    }
    if (Phaser.Input.Keyboard.JustDown(keys.two) || mobileControls.ageSwitch === 'adult') {
        switchAgeRequest('adult');
        mobileControls.ageSwitch = null;
    }
    if (Phaser.Input.Keyboard.JustDown(keys.three) || mobileControls.ageSwitch === 'elder') {
        switchAgeRequest('elder');
        mobileControls.ageSwitch = null;
    }

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
        // Update color based on health - Cyberpunk colors
        if (healthPercent > 0.6) {
            bossHealthBar.fillColor = 0x00ffff; // Cyan
        } else if (healthPercent > 0.3) {
            bossHealthBar.fillColor = 0xff00ff; // Magenta
        } else {
            bossHealthBar.fillColor = 0xff0080; // Hot pink
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

    // Shoot at player (only if boss exists) - Pink bullets
    bossShootTimer++;
    if (bossShootTimer > 100) {
        bossShootTimer = 0;
        let bullet = currentScene.add.rectangle(boss.x, boss.y, 20, 20, 0xff0099);
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
    if (Phaser.Input.Keyboard.JustDown(keys.x) || mobileControls.turretToggle) {
        mobileControls.turretToggle = false;
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
        if (cursors.up.isDown || mobileControls.aimUp) {
            moveTurretWithPlayer(-TURRET_MOVE_SPEED);
        } else if (cursors.down.isDown || mobileControls.aimDown) {
            moveTurretWithPlayer(TURRET_MOVE_SPEED);
        }
        
        // Shooting logic
        if (cursors.space.isDown || mobileControls.fire) {
            if (currentScene.time.now > turretShootCooldown) {
                turretShootCooldown = currentScene.time.now + TURRET_FIRE_RATE;
                let bullet = currentScene.add.rectangle(turret.x, turret.y, 10, 10, 0x00ffff);
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

    // Boss is a Rectangle, no setTint. Use setFillStyle - Flash cyan when hit
    boss.lastColor = boss.fillColor;
    boss.setFillStyle(0x00ffff);
    currentScene.time.delayedCall(100, () => {
        if (boss && boss.active) boss.setFillStyle(0xff0099); // Back to magenta
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

    // Update visuals and physics body size after position adjustments
    player.fillColor = stats.color;
    player.width = stats.width;
    player.height = stats.height;
    player.body.setSize(stats.width, stats.height);
    player.setSize(stats.width, stats.height);
    
    // Update body position after all adjustments
    player.body.updateFromGameObject();

    // Only apply upward velocity when growing to help escape tight spaces
    if (stats.height > oldHeight) {
        player.body.setVelocityY(-300);
    }

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
    // Rectangle shape does not support setTint, change fill color instead
    // Darken the current color: 0x888888 tint equivalent is basically half brightness
    // But easier to just set to grey for the pause duration
    player.lastColor = player.fillColor; // Save current color
    player.setFillStyle(0x660066);

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
    // Color is reset inside switchAge() via player.fillColor = stats.color
    // So we don't need to manually restore it here except by calling switchAge which we did above.
    // player.clearTint(); // Removed as it caused error

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
    // Hide boss controls on mobile when leaving boss level
    if (currentLevel === 5 && typeof window.showBossControls === 'function') {
        window.showBossControls(false);
    }
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
        currentScene.add.text(400, 300, 'GAME COMPLETE', { fontSize: '64px', fill: '#ff00ff' }).setOrigin(0.5);
    }
}

function hitBossBody(player, boss) {
    // Damage player?
    failLevel();
}

// Menu and Game Start Logic
window.addEventListener('load', () => {
    const playButton = document.getElementById('play-button');
    const instructionsButton = document.getElementById('instructions-button');
    const backButton = document.getElementById('back-button');
    const menuOverlay = document.getElementById('menu-overlay');
    const mainMenu = document.getElementById('main-menu');
    const instructionsScreen = document.getElementById('instructions-screen');
    const gameContainer = document.getElementById('game-container');

    // Validate all required elements exist
    const requiredElements = {
        playButton, instructionsButton, backButton,
        menuOverlay, mainMenu, instructionsScreen, gameContainer
    };

    for (const [name, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error(`Required element missing: ${name}`);
            return;
        }
    }

    playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
        startGame();
        // Show mobile controls on mobile devices
        if (window.innerWidth <= 768) {
            document.getElementById('mobile-controls').classList.add('active');
        }
    });

    instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
    });

    backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
    });
    
    // Initialize mobile controls
    setupMobileControls();
});

// Mobile Controls Setup
function setupMobileControls() {
    // Movement Controls
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    
    // Age Switch Controls
    const btnChild = document.getElementById('btn-child');
    const btnAdult = document.getElementById('btn-adult');
    const btnElder = document.getElementById('btn-elder');
    
    // Boss Controls
    const btnTurret = document.getElementById('btn-turret');
    const btnAimUp = document.getElementById('btn-aim-up');
    const btnAimDown = document.getElementById('btn-aim-down');
    const btnFire = document.getElementById('btn-fire');
    const bossControls = document.getElementById('boss-controls');
    
    // Left button
    btnLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.left = true;
    });
    btnLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls.left = false;
    });
    btnLeft.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        mobileControls.left = false;
    });
    
    // Right button
    btnRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.right = true;
    });
    btnRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls.right = false;
    });
    btnRight.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        mobileControls.right = false;
    });
    
    // Jump button
    btnJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.jump = true;
    });
    btnJump.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls.jump = false;
    });
    btnJump.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        mobileControls.jump = false;
    });
    
    // Age switch buttons
    btnChild.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.ageSwitch = 'child';
    });
    
    btnAdult.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.ageSwitch = 'adult';
    });
    
    btnElder.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.ageSwitch = 'elder';
    });
    
    // Boss control buttons
    btnTurret.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.turretToggle = true;
    });
    
    btnAimUp.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.aimUp = true;
    });
    btnAimUp.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls.aimUp = false;
    });
    btnAimUp.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        mobileControls.aimUp = false;
    });
    
    btnAimDown.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.aimDown = true;
    });
    btnAimDown.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls.aimDown = false;
    });
    btnAimDown.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        mobileControls.aimDown = false;
    });
    
    btnFire.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls.fire = true;
    });
    btnFire.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls.fire = false;
    });
    btnFire.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        mobileControls.fire = false;
    });
    
    // Show/hide boss controls based on level
    // This will be called from the game when entering/leaving boss level
    window.showBossControls = function(show) {
        if (show && window.innerWidth <= 768) {
            bossControls.classList.add('active');
        } else {
            bossControls.classList.remove('active');
        }
    };
}

function startGame() {
    // Prevent creating multiple game instances
    if (game) {
        console.warn('Game already initialized');
        return;
    }
    game = new Phaser.Game(config);
}
