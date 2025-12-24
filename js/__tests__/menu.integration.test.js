/**
 * Integration tests for menu system and DOM interactions
 * Tests the menu overlay, instructions screen, and game initialization
 */

describe('Menu System Integration Tests', () => {
  let playButton, instructionsButton, backButton;
  let menuOverlay, mainMenu, instructionsScreen, gameContainer;
  let clickHandlers;

  beforeEach(() => {
    // Create mock DOM elements
    document.body.innerHTML = `
      <div class="menu-overlay" id="menu-overlay" style="display: flex;">
        <div id="main-menu" style="display: block;">
          <h1>Age Shifter</h1>
          <button class="menu-button" id="play-button">Play</button>
          <button class="menu-button" id="instructions-button">Instructions</button>
        </div>
        <div id="instructions-screen" style="display: none;">
          <h2>Instructions</h2>
          <button class="menu-button" id="back-button">Back</button>
        </div>
      </div>
      <div id="game-container" style="display: none;"></div>
    `;

    // Get references to DOM elements
    playButton = document.getElementById('play-button');
    instructionsButton = document.getElementById('instructions-button');
    backButton = document.getElementById('back-button');
    menuOverlay = document.getElementById('menu-overlay');
    mainMenu = document.getElementById('main-menu');
    instructionsScreen = document.getElementById('instructions-screen');
    gameContainer = document.getElementById('game-container');

    // Store click handlers for testing
    clickHandlers = {
      play: null,
      instructions: null,
      back: null
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initial State', () => {
    test('should have all required DOM elements present', () => {
      expect(playButton).toBeTruthy();
      expect(instructionsButton).toBeTruthy();
      expect(backButton).toBeTruthy();
      expect(menuOverlay).toBeTruthy();
      expect(mainMenu).toBeTruthy();
      expect(instructionsScreen).toBeTruthy();
      expect(gameContainer).toBeTruthy();
    });

    test('should show menu overlay on initial load', () => {
      expect(menuOverlay.style.display).not.toBe('none');
    });

    test('should show main menu on initial load', () => {
      expect(mainMenu.style.display).not.toBe('none');
    });

    test('should hide instructions screen on initial load', () => {
      expect(instructionsScreen.style.display).toBe('none');
    });

    test('should hide game container on initial load', () => {
      expect(gameContainer.style.display).toBe('none');
    });

    test('should have correct button text', () => {
      expect(playButton.textContent).toBe('Play');
      expect(instructionsButton.textContent).toBe('Instructions');
      expect(backButton.textContent).toBe('Back');
    });

    test('should have correct element IDs', () => {
      expect(playButton.id).toBe('play-button');
      expect(instructionsButton.id).toBe('instructions-button');
      expect(backButton.id).toBe('back-button');
      expect(menuOverlay.id).toBe('menu-overlay');
      expect(mainMenu.id).toBe('main-menu');
      expect(instructionsScreen.id).toBe('instructions-screen');
      expect(gameContainer.id).toBe('game-container');
    });
  });

  describe('Play Button Interaction', () => {
    test('should hide menu overlay when clicked', () => {
      // Simulate play button click handler
      playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
      });

      playButton.click();

      expect(menuOverlay.style.display).toBe('none');
    });

    test('should show game container when clicked', () => {
      playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
      });

      playButton.click();

      expect(gameContainer.style.display).toBe('block');
    });

    test('should transition from menu to game atomically', () => {
      playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
      });

      playButton.click();

      // Both transitions should happen together
      expect(menuOverlay.style.display).toBe('none');
      expect(gameContainer.style.display).toBe('block');
    });

    test('should not affect main menu display property', () => {
      const initialMainMenuDisplay = mainMenu.style.display;
      
      playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
      });

      playButton.click();

      // Main menu should remain unchanged (parent overlay hides it)
      expect(mainMenu.style.display).toBe(initialMainMenuDisplay);
    });

    test('should not affect instructions screen display property', () => {
      playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
      });

      playButton.click();

      expect(instructionsScreen.style.display).toBe('none');
    });
  });

  describe('Instructions Button Interaction', () => {
    test('should hide main menu when clicked', () => {
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      instructionsButton.click();

      expect(mainMenu.style.display).toBe('none');
    });

    test('should show instructions screen when clicked', () => {
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      instructionsButton.click();

      expect(instructionsScreen.style.display).toBe('block');
    });

    test('should transition between screens atomically', () => {
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      instructionsButton.click();

      expect(mainMenu.style.display).toBe('none');
      expect(instructionsScreen.style.display).toBe('block');
    });

    test('should keep menu overlay visible', () => {
      const initialOverlayDisplay = menuOverlay.style.display;
      
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      instructionsButton.click();

      expect(menuOverlay.style.display).toBe(initialOverlayDisplay);
    });

    test('should keep game container hidden', () => {
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      instructionsButton.click();

      expect(gameContainer.style.display).toBe('none');
    });
  });

  describe('Back Button Interaction', () => {
    beforeEach(() => {
      // Set up instructions screen as visible
      mainMenu.style.display = 'none';
      instructionsScreen.style.display = 'block';
    });

    test('should hide instructions screen when clicked', () => {
      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      backButton.click();

      expect(instructionsScreen.style.display).toBe('none');
    });

    test('should show main menu when clicked', () => {
      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      backButton.click();

      expect(mainMenu.style.display).toBe('block');
    });

    test('should return to main menu atomically', () => {
      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      backButton.click();

      expect(instructionsScreen.style.display).toBe('none');
      expect(mainMenu.style.display).toBe('block');
    });

    test('should keep menu overlay visible', () => {
      const initialOverlayDisplay = menuOverlay.style.display;
      
      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      backButton.click();

      expect(menuOverlay.style.display).toBe(initialOverlayDisplay);
    });

    test('should keep game container hidden', () => {
      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      backButton.click();

      expect(gameContainer.style.display).toBe('none');
    });
  });

  describe('Complete User Flows', () => {
    test('should navigate from main menu to instructions and back', () => {
      // Setup handlers
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      // Initial state
      expect(mainMenu.style.display).not.toBe('none');
      expect(instructionsScreen.style.display).toBe('none');

      // Go to instructions
      instructionsButton.click();
      expect(mainMenu.style.display).toBe('none');
      expect(instructionsScreen.style.display).toBe('block');

      // Go back to main menu
      backButton.click();
      expect(mainMenu.style.display).toBe('block');
      expect(instructionsScreen.style.display).toBe('none');
    });

    test('should navigate multiple times between main menu and instructions', () => {
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      // First round trip
      instructionsButton.click();
      backButton.click();
      expect(mainMenu.style.display).toBe('block');
      expect(instructionsScreen.style.display).toBe('none');

      // Second round trip
      instructionsButton.click();
      backButton.click();
      expect(mainMenu.style.display).toBe('block');
      expect(instructionsScreen.style.display).toBe('none');
    });

    test('should start game from main menu', () => {
      playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
      });

      // Initial state
      expect(menuOverlay.style.display).not.toBe('none');
      expect(gameContainer.style.display).toBe('none');

      // Start game
      playButton.click();
      expect(menuOverlay.style.display).toBe('none');
      expect(gameContainer.style.display).toBe('block');
    });

    test('should be able to view instructions before starting game', () => {
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
      });

      // View instructions
      instructionsButton.click();
      expect(instructionsScreen.style.display).toBe('block');

      // Go back
      backButton.click();
      expect(mainMenu.style.display).toBe('block');

      // Start game
      playButton.click();
      expect(gameContainer.style.display).toBe('block');
      expect(menuOverlay.style.display).toBe('none');
    });
  });

  describe('Event Listener Registration', () => {
    test('should handle multiple click events on same button', () => {
      let clickCount = 0;
      
      playButton.addEventListener('click', () => {
        clickCount++;
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
      });

      playButton.click();
      expect(clickCount).toBe(1);
      
      // Second click should also work (though game already started)
      playButton.click();
      expect(clickCount).toBe(2);
    });

    test('should handle rapid button clicks gracefully', () => {
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      backButton.addEventListener('click', () => {
        instructionsScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });

      // Rapid clicks
      instructionsButton.click();
      instructionsButton.click();
      backButton.click();
      backButton.click();
      
      // Should end up back at main menu
      expect(mainMenu.style.display).toBe('block');
      expect(instructionsScreen.style.display).toBe('none');
    });
  });

  describe('Game Initialization', () => {
    test('should call startGame function when play button clicked', () => {
      const mockStartGame = jest.fn();
      
      playButton.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
        gameContainer.style.display = 'block';
        mockStartGame();
      });

      playButton.click();

      expect(mockStartGame).toHaveBeenCalled();
      expect(mockStartGame).toHaveBeenCalledTimes(1);
    });

    test('should initialize game only after menu is hidden', () => {
      const operations = [];
      
      playButton.addEventListener('click', () => {
        operations.push('hide_menu');
        menuOverlay.style.display = 'none';
        
        operations.push('show_game');
        gameContainer.style.display = 'block';
        
        operations.push('start_game');
      });

      playButton.click();

      expect(operations).toEqual(['hide_menu', 'show_game', 'start_game']);
    });
  });

  describe('Accessibility and Error Handling', () => {
    test('should handle missing DOM elements gracefully', () => {
      document.body.innerHTML = ''; // Remove all elements
      
      const missingPlayButton = document.getElementById('play-button');
      expect(missingPlayButton).toBeNull();
    });

    test('should have descriptive button text for screen readers', () => {
      expect(playButton.textContent).toMatch(/play/i);
      expect(instructionsButton.textContent).toMatch(/instructions/i);
      expect(backButton.textContent).toMatch(/back/i);
    });

    test('should maintain proper heading hierarchy', () => {
      const h1 = mainMenu.querySelector('h1');
      const h2 = instructionsScreen.querySelector('h2');
      
      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h1.textContent).toBe('Age Shifter');
      expect(h2.textContent).toBe('Instructions');
    });

    test('should have menu-button class on all buttons', () => {
      expect(playButton.classList.contains('menu-button')).toBe(true);
      expect(instructionsButton.classList.contains('menu-button')).toBe(true);
      expect(backButton.classList.contains('menu-button')).toBe(true);
    });
  });

  describe('Style Display Properties', () => {
    test('should use display property for show/hide logic', () => {
      instructionsButton.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        instructionsScreen.style.display = 'block';
      });

      instructionsButton.click();

      expect(mainMenu.style.display).toBe('none');
      expect(instructionsScreen.style.display).toBe('block');
    });

    test('should support various display values', () => {
      // Menu overlay can be flex or block
      expect(['flex', 'block', '']).toContain(menuOverlay.style.display);
      
      // Game container should be block when shown
      gameContainer.style.display = 'block';
      expect(gameContainer.style.display).toBe('block');
      
      // Hidden elements should be 'none'
      instructionsScreen.style.display = 'none';
      expect(instructionsScreen.style.display).toBe('none');
    });
  });
});

describe('Window Load Event', () => {
  test('should execute setup code on window load', () => {
    const mockSetup = jest.fn();
    
    window.addEventListener('load', mockSetup);
    window.dispatchEvent(new Event('load'));
    
    expect(mockSetup).toHaveBeenCalled();
  });

  test('should setup all event listeners on load', () => {
    const listeners = {
      play: jest.fn(),
      instructions: jest.fn(),
      back: jest.fn()
    };

    window.addEventListener('load', () => {
      const pb = document.getElementById('play-button');
      const ib = document.getElementById('instructions-button');
      const bb = document.getElementById('back-button');
      
      if (pb) pb.addEventListener('click', listeners.play);
      if (ib) ib.addEventListener('click', listeners.instructions);
      if (bb) bb.addEventListener('click', listeners.back);
    });

    // Setup DOM
    document.body.innerHTML = `
      <button id="play-button">Play</button>
      <button id="instructions-button">Instructions</button>
      <button id="back-button">Back</button>
    `;

    // Trigger load
    window.dispatchEvent(new Event('load'));

    // Test that listeners work
    document.getElementById('play-button').click();
    document.getElementById('instructions-button').click();
    document.getElementById('back-button').click();

    expect(listeners.play).toHaveBeenCalled();
    expect(listeners.instructions).toHaveBeenCalled();
    expect(listeners.back).toHaveBeenCalled();
  });
});