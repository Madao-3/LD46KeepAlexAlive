import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'SplashScene' })
  }

  init () {}

  preload () {
    this.loaderBg = this.add.sprite(game.width/2, game.height/2, 'loaderBg');
    this.loaderBar = this.add.sprite(game.width/2, game.height/2, 'loaderBar');
    // centerGameObjects([this.loaderBg, this.loaderBar]);

    // this.load.setPreloadSprite(this.loaderBar);
    this.load.atlas('sprites', 'assets/images/atlas.png', 'assets/images/atlas.json');
    this.load.tilemapTiledJSON('battleground', 'assets/maps/map.json');
    this.load.image('tileset', 'assets/images/atlas.png');
  }

  create () {
    this.scene.start('LandingScene')
  }
}
