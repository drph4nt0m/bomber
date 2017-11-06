import {
  xOffset,
  yOffset,

  buttonXOffset,
  startGameButtonYOffset,
  leaveButtonYOffset,

  characterSquareStartingX,
  characterSquareStartingY,
  characterSquareXDistance,
  characterSquareYDistance,

  minPlayerMessageOffsetX,
  minPlayerMessageOffsetY,

  characterOffsetX,
  characterOffsetY
} from '../utils/constants';

class SelectMap extends Phaser.State {

  init(game_id) {
    this.profileBoxes = [];
    this.profileImages = [];

    this.game_id = game_id;

    clientSocket.on('update players', this.populateCharacterSquares.bind(this));
    clientSocket.on('launch game', this.startGame.bind(this));
  }

  create() {
    this.add.sprite(0, 0, 'background_select');
    this.add.image(xOffset, yOffset, 'pending_game_backdrop');

    this.startGameButton = this.add.button(buttonXOffset, startGameButtonYOffset, 'start_game_button', this.startGameAction, this, 2, 2);
    this.startGameButton.input.enabled = false
    this.startGameButton.input.useHandCursor = false

    this.add.button(buttonXOffset, leaveButtonYOffset, 'leave_game_button', this.leaveGameAction, this, 1, 0);

    this.drawCharacterSquares();

    this.minPlayerMessage = this.add.text(minPlayerMessageOffsetX, minPlayerMessageOffsetY, 'Cannot start game without\nat least 2 players.', { font: 'Carter One', fill: 'red', fontSize: 17, visible: false });

    this.add.text(330, 100, this.game_id, { font: 'Carter One', fill: 'red', fontSize: 17});

    clientSocket.emit('enter pending game', { game_id: this.game_id });
  }

  drawCharacterSquares() {
    let xOffset = characterSquareStartingX;
    let yOffset = characterSquareStartingY;

    for(let i = 0; i < 2; i++) {
      let profileBox = this.add.sprite(xOffset, yOffset, 'character_square', 0);
      this.profileBoxes[i] = profileBox

      if(i % 2 == 0) {
        xOffset += characterSquareXDistance;
      } else {
        xOffset = characterSquareStartingX;
        yOffset += characterSquareYDistance;
      }
    }
  }

  populateCharacterSquares(data) {
    for (let image of this.profileImages) {
      // NOTE: 1. Not optimal way to rerender, we should implement AddPlayer, RemovePlayer
      // NOTE: 2. You did not destroy object, it still in memory. Just marked as destroyed.
      image.destroy();
    }

    data.players.forEach( (player, i) => {
      let playerSquare = this.profileBoxes[i]
      let playerImage = this.add.image(characterOffsetX, characterOffsetY, 'bomberman_head_' + player.color);

      this.profileImages[i] = playerImage

      playerSquare.addChild(playerImage)
    })

    if(data.players.length > 1) {
      this.enableStartGame();
    } else {
      this.disableStartGame();
    }
  }

  enableStartGame() {
    this.minPlayerMessage.visible = false;

    this.startGameButton.setFrames(1, 0);
    this.startGameButton.inputEnabled = true;
    this.startGameButton.input.useHandCursor = true
  }

  disableStartGame(){
    this.minPlayerMessage.visible = true;

    this.startGameButton.setFrames(2, 2);
    this.startGameButton.inputEnabled = false;
    this.startGameButton.input.useHandCursor = false
  }

  leaveGameAction() {
    clientSocket.emit('leave pending game', { game_id: this.game_id });

    this.state.start('Menu');
  }

  startGameAction() {
    clientSocket.emit('create game', { game_id: this.game_id });
  }

  startGame(data) {
    this.state.start('GameLevel', true, false, data.game.id);
  }
}

export default SelectMap;
