const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    dom: {
        createContainer: true // Enable DOM container
    }
};

const game = new Phaser.Game(config);

const difficultyProgression = ['Isolated', 'Word', 'Phrase', 'Sentence', 'Tongue Twister'];


let player;
let cursors;
let boardTiles = [];
let currentTileIndex = 0; // Start at the first tile
let moving = false;

// Lists for sounds and difficulty levels
let sounds = ['/s/', '/r/', '/l/', '/sh/'];
let selectedSound = '/s/';
let difficultyLevels = ['Isolated', 'Word', 'Phrase', 'Sentence', 'Tongue Twister'];
let selectedDifficulty = 'Isolated';

let prompts = {
    '/s/': {
        Word: ['sun', 'sand', 'sip', 'silly'],
        Phrase: ['the sunny beach', 'sip the soda', 'a silly song'],
        Sentence: ['The sun shines brightly.', 'I sip my drink.', 'She sings a silly song.'],
    },
    '/r/': {
        Word: ['red', 'run', 'rock', 'road'],
        Phrase: ['the red car', 'run to the park', 'rock and roll'],
        Sentence: ['The red car is fast.', 'I run every morning.', 'We climbed a big rock.', 'The red car is fast.',
    'I run every morning.','We climbed a big rock.','Red roses are pretty.','Rabbits run fast.','Rain falls from the sky.',
    'Read a book about robots.','Ride the red bike.','Riley runs to the park.','The rug is soft.','Ricky plays in the rain.',
    'Roll the red ball.','Ryan rides a horse.','Please rinse the dishes.','Roll the dice to play.','The radio is on.',
    'Race to the finish line!','Rake the leaves in the yard.','Raise your hand to answer.','Rachel ran to the store.',
    'The rooster woke me up.','Roger writes his name.','Remember to close the door.','Rainbows have many colors.',
    'The raccoon climbed the tree.','Rivers flow into the ocean.','Rocks are hard and rough.','A rocket goes to space.',
    'The ring is shiny.','Roses smell sweet.','Robots are very smart.','Rabbits eat carrots.','The road is long and straight.',
    'Where is the red ribbon?','Can you reach the remote?','Have you seen the rain?','Do you like raspberries?',
    'Who is riding the bike?','Is the rug clean?','Can I read the recipe?','Did you rake the yard?','Have you ridden a rollercoaster?',
    'Where is the rainbow?','Let’s race to the playground.','Roll the ball to me.','Raise the flag at the fort.',
    'Ricky rode the roller coaster.','The rabbit hops so fast!','Reach for the rope in the game.','The red car wins the race.',
    'Riley runs around the house.','Ride the roller skates outside.','Let’s read a rhyming book.','Rachel ate raspberries for breakfast.',
    'Riley ordered rice for dinner.','The roast beef was delicious.','Rain ruined the picnic food.','I like raisins in my cereal.',
    'Riley cooks ribs on the grill.','Reuben made rice pudding.','Ruby put ranch dressing on her salad.','Mom makes raspberry jam.',
    'Please rinse the rice.','Rosie is Riley’s best friend.','Ryan ran after his sister.','Ruby and Rachel are cousins.',
    'Riley and Ricky are brothers.','Roger helps raise the baby.','Grandma reads stories to Rosie.','Rachel rakes the leaves with Mom.',
    'Ruby rides the horse with Dad.','Ryan likes playing rainy day games.','Roger’s dog races around the yard.','The raccoon ran across the road.',
    'Rain refreshes the plants.','The rabbit rests under a tree.','Rivers run through the valley.','Red robins sing in the spring.',
    'Roses bloom in the sunlight.','The rooster crows in the morning.','Rockets fly above the clouds.','Rattlesnakes live in the desert.',
    'Rainbows shine after the rain.','Ryan reads about reptiles in class.','Rachel raises her hand in school.','Ricky writes with a red pen.',
    'The report is due on Friday.','Ruby reviews her homework.','The teacher read a rhyming poem.','Raise the flag for morning assembly.',
    'The ruler measures the paper.','Read the recipe in the science lab.','Reuben works hard in reading class.','Riley rode a red airplane.',
    'Ride the raft down the river.','Rachel saw a raccoon in the forest.','The red car reached the finish line.','Race to the mountaintop!',
    'We rode horses at the ranch.','The rocket launched into space.','Ruby explored a rainforest.','The road trip was fun!',
    'Roger ran a race in the city.'
],
    },
    // Add more sounds as needed
};


function preload() {
    // Load your image assets
    this.load.image('player', 'sprite.png'); // Replace with your actual path
    this.load.image('tile', 'tile.png'); // Replace with your actual path
    this.load.image('battleBackground', 'battle-background.png'); // Battle background
    this.load.image('playerCreature', 'boy-back2.png'); // Player creature
    this.load.image('opponentCreature', 'ball-creature.png'); // Opponent creature
}

function create() {
    // Create a grid of tiles in a specific order
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
            let tile = this.add.image(150 + i * 100, 100 + j * 100, 'tile').setScale(0.25);
            boardTiles.push(tile); // Add tiles to the array in the order they should be visited
        }
    }

    // Create the player
    player = this.physics.add.sprite(boardTiles[0].x, boardTiles[0].y, 'player').setScale(0.15);
    player.setCollideWorldBounds(true);

    // Set up keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Call the function to create dropdown menus
    createSelections(this);
}

function update() {
    if (moving) return; // Prevent new movement if the player is already moving

    // Check for key press to move to the next tile
    if (cursors.right.isDown && currentTileIndex < boardTiles.length - 1) {
        moveToNextTile();
    }
}

function moveToNextTile() {
    moving = true; // Set the moving flag to prevent other moves

    currentTileIndex++; // Move to the next tile in the array
    let nextTile = boardTiles[currentTileIndex];

    // Tween the player to the next tile for a smooth movement
    game.scene.scenes[0].tweens.add({
        targets: player,
        x: nextTile.x,
        y: nextTile.y,
        duration: 500, // Duration of the movement in milliseconds
        onComplete: () => {
            moving = false; // Reset the moving flag once the tween is complete

            console.log('Player reached tile:', currentTileIndex);

            // Check if it's the last tile
            if (currentTileIndex === boardTiles.length - 1) {
                showLevelCompletion();
            } else {
                console.log('Showing prompt...');
                showPrompt(); // Show a prompt for the targeted sound and difficulty
            }
        }
    });
}


function showLevelCompletion() {
    const scene = game.scene.scenes[0];

    // Display a level completion message
    const levelCompleteText = scene.add.text(400, 300, 'Level Complete!', {
        fontSize: '32px',
        color: '#000',
        fontStyle: 'bold',
        backgroundColor: '#fff',
        padding: { x: 10, y: 10 },
        align: 'center'
    }).setOrigin(0.5);

    console.log('Level Completed!');

    // Progress to the next difficulty after 3 seconds
    scene.time.delayedCall(3000, () => {
        levelCompleteText.destroy(); // Remove the level complete message
        progressToNextDifficulty(); // Progress to the next level
    });
}

function progressToNextDifficulty() {
    const currentIndex = difficultyProgression.indexOf(selectedDifficulty);

    if (currentIndex < difficultyProgression.length - 1) {
        // Move to the next difficulty
        selectedDifficulty = difficultyProgression[currentIndex + 1];
        console.log(`Progressing to next difficulty: ${selectedDifficulty}`);
        resetGame();
    } else {
        // If at the last difficulty, show "Game Over"
        console.log('Final difficulty reached. Showing Game Over...');
        showGameOver();
    }
}


function showGameOver() {
    const scene = game.scene.scenes[0];

    // Display "Game Over!" message
    const gameOverText = scene.add.text(400, 300, 'Game Over!', {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold',
        backgroundColor: '#000',
        padding: { x: 20, y: 20 },
        align: 'center'
    }).setOrigin(0.5);

    console.log('Game Over!');

    // Optionally, add a button or reset after a delay
    scene.time.delayedCall(5000, () => {
        gameOverText.destroy();
        restartGame();
    });
}


function restartGame() {
    console.log('Restarting the game...');

    // Reset difficulty to the first level
    selectedDifficulty = 'Isolated';
    currentTileIndex = 0;

    // Reset player position
    player.setPosition(boardTiles[0].x, boardTiles[0].y);

    // Display a welcome message
    const scene = game.scene.scenes[0];
    const restartText = scene.add.text(400, 300, 'Restarting Game...', {
        fontSize: '24px',
        color: '#000',
        fontStyle: 'bold',
        backgroundColor: '#fff',
        padding: { x: 10, y: 10 },
        align: 'center'
    }).setOrigin(0.5);

    // Clear the text after 3 seconds
    scene.time.delayedCall(3000, () => {
        restartText.destroy();
    });
}
function resetGame() {
    console.log('Resetting game for difficulty:', selectedDifficulty);

    // Reset tile index
    currentTileIndex = 0;

    // Move the player back to the first tile
    player.setPosition(boardTiles[0].x, boardTiles[0].y);

    // Optionally, show the current difficulty
    const scene = game.scene.scenes[0];
    const resetText = scene.add.text(400, 300, `Next Level: ${selectedDifficulty}`, {
        fontSize: '24px',
        color: '#000',
        fontStyle: 'bold',
        backgroundColor: '#fff',
        padding: { x: 10, y: 10 },
        align: 'center'
    }).setOrigin(0.5);

    // Clear the text after 3 seconds
    scene.time.delayedCall(3000, () => {
        resetText.destroy();
    });
}




function createSelections(scene) {
    // Create a simple HTML element using Phaser's DOM support
    let soundSelect = scene.add.dom(400, 545).createFromHTML(`
        <select id="sound-select" style="font-size: 16px; padding: 5px;">
            <option value="/s/">/s/</option>
            <option value="/z/">/z/</option>
            <option value="/r/">/r/</option>
            <option value="/l/">/l/</option>
            <option value="/k/">/k/</option>
            <option value="/g/">/g/</option>
            <option value="/sh/">/sh/</option>
        </select>
    `);

    soundSelect.addListener('change');
    soundSelect.on('change', (event) => {
        selectedSound = event.target.value;
        console.log('Dropdown Updated Sound:', selectedSound);
    });

    let difficultySelect = scene.add.dom(400, 580).createFromHTML(`
        <select id="difficulty-select" style="font-size: 16px; padding: 5px;">
            <option value="Isolated">Isolated</option>
            <option value="Word">Word</option>
            <option value="Phrase">Phrase</option>
            <option value="Sentence">Sentence</option>
            <option value="Tongue Twister">Tongue Twister</option>
        </select>
    `);

    difficultySelect.addListener('change');
    difficultySelect.on('change', (event) => {
        selectedDifficulty = event.target.value;
        console.log('Dropdown Updated Difficulty:', selectedDifficulty);
    });
}

function showPrompt() {
    console.log('Selected Sound:', selectedSound);
    console.log('Selected Difficulty:', selectedDifficulty);

    // Get the prompts for the selected sound and difficulty
    let soundPrompts = prompts[selectedSound];
    if (!soundPrompts) {
        console.error(`No prompts found for sound: ${selectedSound}`);
        return;
    }

    let levelPrompts = soundPrompts[selectedDifficulty];
    if (!levelPrompts || levelPrompts.length === 0) {
        console.error(`No prompts found for difficulty: ${selectedDifficulty} and sound: ${selectedSound}`);
        return;
    }

    // Pick a random prompt
    let randomPrompt = levelPrompts[Math.floor(Math.random() * levelPrompts.length)];
    console.log('Random Prompt:', randomPrompt);

    // Display the prompt
    const scene = game.scene.scenes[0];
    const promptText = scene.add.text(400, 300, randomPrompt, {
        fontSize: '24px',
        color: '#000',
        fontStyle: 'bold',
        backgroundColor: '#fff',
        padding: { x: 10, y: 10 },
        align: 'center'
    }).setOrigin(0.5);

    // Clear the prompt after 3 seconds
    scene.time.delayedCall(3000, () => {
        promptText.destroy(); // Remove the prompt after 3 seconds
    });
}

// Moves and Opponent Stats
const playerMoves = [
    { name: 'Sound Blast', damage: 10 },
    { name: 'Echo Wave', damage: 15 },
    { name: 'Pitch Strike', damage: 20 },
];

let opponentStats = {
    name: 'Speech Monster',
    hp: 50,
};

// Battle UI Elements
let battleContainer;
let battleLog;

function showBattle() {
    const scene = game.scene.scenes[0];

    // Add the battle background
    const battleBackground = scene.add.image(400, 300, 'battleBackground').setScale(0.50).setDepth(0);

    // Add player creature sprite
    const playerCreature = scene.add.sprite(200, 400, 'playerCreature').setScale(0.25).setDepth(1);

    // Add opponent creature sprite
    const opponentCreature = scene.add.sprite(600, 200, 'opponentCreature').setScale(0.15).setDepth(1);

    // Create the battle UI container
    battleContainer = scene.add.dom(510, 550).createFromHTML(`
        <div style="background-color: #fff; border: 1px solid #000; padding: 20px; width: 300px; text-align: center;">
            <h3>Battle!</h3>
            <p>Opponent: ${opponentStats.name} (HP: ${opponentStats.hp})</p>
            <div id="battle-log" style="height: 100px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                <p>The battle begins!</p>
            </div>
            <div>
                ${playerMoves.map((move, index) => `
                    <button style="margin: 5px;" onclick="performMove(${index})">${move.name}</button>
                `).join('')}
            </div>
        </div>
    `);

    // Prevent the game from progressing during the battle
    moving = true;

    // Get the battle log DOM element
    battleLog = document.getElementById('battle-log');

    // Store battle visuals for cleanup
    battleContainer.battleBackground = battleBackground;
    battleContainer.playerCreature = playerCreature;
    battleContainer.opponentCreature = opponentCreature;
}


function performMove(moveIndex) {
    const move = playerMoves[moveIndex];

    // Player attacks
    appendToBattleLog(`Player used ${move.name}!`);
    opponentStats.hp -= move.damage;

    if (opponentStats.hp <= 0) {
        appendToBattleLog(`${opponentStats.name} has been defeated!`);
        endBattle();
        return;
    }

    // Opponent attacks
    const opponentDamage = Math.floor(Math.random() * 10) + 5;
    appendToBattleLog(`${opponentStats.name} attacks for ${opponentDamage} damage!`);

    // Optionally track player HP if you want more depth
}

function appendToBattleLog(message) {
    if (battleLog) {
        battleLog.innerHTML += `<p>${message}</p>`;
        battleLog.scrollTop = battleLog.scrollHeight;
    }
}

function endBattle() {
    console.log('Battle ended.');
    // Clear the battle UI
    if (battleContainer) {
        battleContainer.destroy();
        battleContainer.battleBackground.destroy();
        battleContainer.playerCreature.destroy();
        battleContainer.opponentCreature.destroy();
    }

    // Reset opponent stats for the next battle
    opponentStats.hp = 50;

    // Unlock player movement
    moving = false;

    // Check if the player is on the last tile
    if (currentTileIndex === boardTiles.length - 1) {
        showLevelCompletion();
    }
}



function moveToNextTile() {
    moving = true; // Set the moving flag to prevent other moves

    currentTileIndex++; // Move to the next tile in the array
    let nextTile = boardTiles[currentTileIndex];

    // Tween the player to the next tile for a smooth movement
    game.scene.scenes[0].tweens.add({
        targets: player,
        x: nextTile.x,
        y: nextTile.y,
        duration: 500, // Duration of the movement in milliseconds
        onComplete: () => {
            moving = false; // Reset the moving flag once the tween is complete

            console.log('Player reached tile:', currentTileIndex);

            // Trigger a battle on 50% of tiles
            if (Math.random() < 0.5) {
                showBattle();
            } else {
                if (currentTileIndex === boardTiles.length - 1) {
                    showLevelCompletion(); // End the level if it's the last tile
                } else {
                    showPrompt(); // Show a prompt for normal tiles
                }
            }
        }
    });
}
