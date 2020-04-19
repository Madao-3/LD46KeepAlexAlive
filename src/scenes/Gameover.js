import Phaser from 'phaser'
import shuffle from 'lodash.shuffle';
export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'GameOverScene' })
  }

  init() { }
  preload() { }

  create() {
    this.cameras.main.setBackgroundColor('#0099cc')

    const bannerText =  `GAME OVER!\nGood JOB! Your record is ${window.second}s!`
    this.banner = this.add.text(this.cameras.main.width/2 -280, this.cameras.main.height/2 - 120, bannerText, {
      font: '40px Bangers',
      fill: '#FFFFFF',
      smoothed: false,
      align: 'center',
    })

    this.button = this.add.text(this.cameras.main.width/2 - 135, this.cameras.main.height - 280, "Click me to refresh", {
      font: '40px Bangers',
      fill: '#FFFFFF',
      smoothed: false,
      align: 'center',
    }).setInteractive()
    this.button.inputEnabled = true;
    this.button.on('pointerdown', () => {
      location.reload()
    }, this)
  }

  nextState() {
    this.scene.start('BootScene',true,false);
  }
}


