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
let bossHealth = 3;
let turret;
let bullets;
let bossBullets;
let isGameOver = false;
let isSwitching = false;
let transitionText;
let transitionIcon;
let currentScene;

// Age Statistics
const AGES = {
    child: {
        color: 0x00ff00,
        width: 20,
        height: 20,
        speed: 300,
        jump: -400,
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
        jump: -250,
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
        bossHealth = 3; // Reset boss health for new game
    }

    // Safety reset if we just entered level 5? No, create runs every level.
    if (currentLevel === 5) {
        bossHealth = 3;
    }

    // 1. Create Level
    createLevel(this, currentLevel);

    // 2. Create Player
    // Use currentAge to persist state between levels
    const initialStats = AGES[currentAge];
    player = this.add.rectangle(100, 450, initialStats.width, initialStats.height, initialStats.color);
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

// LEVEL 1: The Basics (Corrected)
function buildLevel1(scene) {
    // Floor
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x654321);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Walls
    let wall1 = scene.add.rectangle(10, 300, 20, 600, 0x333333);
    scene.physics.add.existing(wall1, true);
    obstacles.add(wall1);

    // Ledger (Lowered significantly so Child/Elder can't, but Adult can)
    // Adult jump -600 reaches ~180px.
    // Floor top 560. Top req < 380?
    // Let's set Ledge Y = 500. Height 220. Top = 390.
    // Gap 170. Reachable by Adult.
    let ledge = scene.add.rectangle(300, 500, 100, 220, 0x555555);
    scene.physics.add.existing(ledge, true);
    obstacles.add(ledge);

    // Tunnel (Reachable after ledge)
    // Needs to be small gap (30px). 
    let tunnelCeiling = scene.add.rectangle(500, 460, 200, 130, 0x555555);
    scene.physics.add.existing(tunnelCeiling, true);
    obstacles.add(tunnelCeiling);

    // Pit & Ghosts
    let gp1 = scene.add.rectangle(650, 500, 60, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp1, true);
    ghostPlatforms.add(gp1);

    let gp2 = scene.add.rectangle(730, 450, 60, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp2, true);
    ghostPlatforms.add(gp2);

    finishZone = scene.add.rectangle(780, 400, 40, 40, 0x00ff00);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 2: The Climb (Vertical Platforming) - FIXED
function buildLevel2(scene) {
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x654321);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Pattern: Solid(Jump up) -> Ghost(Bridge) -> Solid(Jump up)

    // 1. Adult Jump to Platform 1
    // Floor 580 -> P1 450 (130px jump). Adult OK.
    let p1 = scene.add.rectangle(200, 450, 100, 20, 0x555555);
    scene.physics.add.existing(p1, true);
    obstacles.add(p1);

    // 2. Ghost Bridge (Elder walk)
    // Connects P1 (x200) to P2 (x500) at SAME height y=450
    let gp1 = scene.add.rectangle(350, 450, 200, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp1, true);
    ghostPlatforms.add(gp1);

    // 3. Platform 2 (Solid) at y=450
    let p2 = scene.add.rectangle(550, 450, 100, 20, 0x555555);
    scene.physics.add.existing(p2, true);
    obstacles.add(p2);

    // 4. Adult Jump to Platform 3 (High)
    // P2 450 -> P3 300 (150px jump). Adult OK.
    let p3 = scene.add.rectangle(700, 300, 100, 20, 0x555555);
    scene.physics.add.existing(p3, true);
    obstacles.add(p3);

    // 5. Ghost Bridge Backwards
    // P3 x700 -> P4 x300 at y=300
    let gp2 = scene.add.rectangle(500, 300, 300, 20, 0xffffff).setAlpha(0.1);
    scene.physics.add.existing(gp2, true);
    ghostPlatforms.add(gp2);

    // 6. Finish Platform
    let p4 = scene.add.rectangle(250, 300, 100, 20, 0x555555);
    scene.physics.add.existing(p4, true);
    obstacles.add(p4);

    finishZone = scene.add.rectangle(250, 250, 40, 40, 0x00ff00);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 3: The Maze (Tunnels) - FIXED
function buildLevel3(scene) {
    let floor = scene.add.rectangle(400, 580, 800, 40, 0x654321);
    scene.physics.add.existing(floor, true);
    obstacles.add(floor);

    // Problem: Tunnel is at y=200. Floor at 560. Gap 360.
    // Solution: Stairs!

    // Step 1: y=450 (Jump 110 from floor)
    let s1 = scene.add.rectangle(200, 450, 100, 20, 0x555555);
    scene.physics.add.existing(s1, true);
    obstacles.add(s1);

    // Step 2: y=330 (Jump 120 from s1)
    let s2 = scene.add.rectangle(350, 330, 100, 20, 0x555555);
    scene.physics.add.existing(s2, true);
    obstacles.add(s2);

    // Step 3: Tunnel Floor at y=200 (Jump 130 from s2)
    let tFloor = scene.add.rectangle(550, 200, 300, 20, 0x555555); // x400->700
    scene.physics.add.existing(tFloor, true);
    obstacles.add(tFloor);

    // Wall blocking direct jump to Finish (Force usage of steps)
    let wall = scene.add.rectangle(600, 400, 20, 400, 0x555555);
    scene.physics.add.existing(wall, true);
    obstacles.add(wall);

    // Tunnel Ceiling (force child)
    // TFloor y=200 top=190.
    // Ceiling bottom = 190 - 30 = 160.
    // Ceiling y = 160 - 50 = 110.
    let tCeil = scene.add.rectangle(550, 110, 300, 100, 0x555555);
    scene.physics.add.existing(tCeil, true);
    obstacles.add(tCeil);

    finishZone = scene.add.rectangle(750, 500, 40, 40, 0x00ff00);
    scene.physics.add.existing(finishZone, true);
}

// LEVEL 4: The Void (Ghosts) - FIXED
function buildLevel4(scene) {
    let startPlat = scene.add.rectangle(100, 500, 200, 40, 0x654321);
    scene.physics.add.existing(startPlat, true);
    obstacles.add(startPlat);

    let endPlat = scene.add.rectangle(700, 500, 200, 40, 0x654321);
    scene.physics.add.existing(endPlat, true);
    obstacles.add(endPlat);

    // Invisible steps must be climbable by Elder (Jump < 30px)
    // So make them FLAT or very gentle stairs (10px).
    // Let's make them flat but moving? No, basic.
    // Flat bridge with gaps.
    // Elder Speed 100. Jump Dist 50. Gap < 50.

    for (let i = 0; i < 6; i++) {
        let x = 240 + (i * 70); // Reduced spacing to 70. Gap = 30px. Safe for Elder (Jump 50px).
        let y = 500; // Flat bridge
        let gp = scene.add.rectangle(x, y, 40, 20, 0xffffff).setAlpha(0.1);
        scene.physics.add.existing(gp, true);
        ghostPlatforms.add(gp);
    }

    finishZone = scene.add.rectangle(750, 450, 40, 40, 0x00ff00);
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
}

function update() {
    if (isGameOver) return;
    if (isSwitching) return;

    // Movement
    if (cursors.left.isDown) {
        player.body.setVelocityX(-AGES[currentAge].speed);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(AGES[currentAge].speed);
    } else {
        player.body.setVelocityX(0);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.body.setVelocityY(AGES[currentAge].jump);
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

function updateBossLevel() {
    if (isGameOver) return;
    // Guard against boss being undefined or destroyed
    if (!boss || !boss.active) return;

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

        let angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
        currentScene.physics.velocityFromRotation(angle, 400, bullet.body.velocity);
        bullet.rotation = angle; // Visual Rotation
    }

    // 2. Turret Interaction
    // Fix: If onTurret, we don't need overlap to exit.
    // Logic: (Check overlap AND Key) OR (OnTurret AND Key)
    // Simplify: if KeyDown X -> Check state.
    if (Phaser.Input.Keyboard.JustDown(keys.x)) {
        if (onTurret) {
            // Exit logic
            onTurret = false;
            player.setVisible(true);
            player.body.enable = true;
            player.x = turret.x;
            player.y = turret.y - 50;
            switchAge('adult');
        } else if (currentScene.physics.overlap(player, turret)) {
            // Enter logic
            onTurret = true;
            player.setVisible(false);
            player.body.enable = false;
            infoText.setText('Mode: TURRET (Press X to exit, Space to shoot)');
        }
    }

    if (onTurret) {
        // Shooting logic logic
        if (cursors.space.isDown) {
            if (currentScene.time.now % 200 < 20) { // Rapid fire limit
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

                // Aim at boss
                let angle = Phaser.Math.Angle.Between(turret.x, turret.y, boss.x, boss.y);
                currentScene.physics.velocityFromRotation(angle, 600, bullet.body.velocity);
                bullet.rotation = angle; // Visual Rotation
            }
        }
    }

    // Collisions
    currentScene.physics.overlap(bullets, boss, damageBoss, null, currentScene);
    currentScene.physics.overlap(bossBullets, player, damagePlayer, null, currentScene);
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
    if (!onTurret) {
        failLevel();
    }
}
function switchAge(newAge) {
    if (currentAge === newAge) return;

    const oldHeight = AGES[currentAge].height;
    currentAge = newAge;
    const stats = AGES[currentAge];

    // 2. Update Visuals & Physics
    player.fillColor = stats.color;
    player.width = stats.width;
    player.height = stats.height;

    // Explicitly update Physics Body Size to ensure hitbox changes
    player.body.setSize(stats.width, stats.height);
    // Note: setSize on the Game Object (Shape) does NOT automatically update the Arcade Body
    // So we must call player.body.setSize()
    player.setSize(stats.width, stats.height);

    // 3. Position Fix (Prevent Stuckness)
    // If growing, move up to avoid clipping floor.
    if (stats.height > oldHeight) {
        player.y -= (stats.height - oldHeight) / 2 + 2;
    }

    // CRITICAL FIX: Give a small upward nudge (hop) to ensure we unstick from any surface
    player.body.setVelocityY(-200);

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
    player.setFillStyle(0x555555);

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
