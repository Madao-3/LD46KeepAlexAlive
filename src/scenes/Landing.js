/* globals __DEV__ */
import Phaser from 'phaser'
import shuffle from 'lodash.shuffle';
export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'LandingScene' })
  }

  init() { }
  preload() { }

  create() {
    // this.scene.start('GameOverScene');
    this.cameras.main.setBackgroundColor('#0099cc')

    const bannerText =  "Keep Alex Alive\nLD46"
    this.banner = this.add.text(this.cameras.main.width/2 - 105, this.cameras.main.height - 80, bannerText, {
      font: '40px Bangers',
      fill: '#FFFFFF',
      smoothed: false,
      align: 'center',
    })

    this.button = this.add.sprite(this.cameras.main.width/2, this.cameras.main.height/2 + 20, 'startButton', 0).setInteractive();
    this.button.inputEnabled = true;
    this.button.on('pointerdown', this.nextState, this)

    this.button.alpha = 0;


    this.renderTrees();
    this.music = this.sound.add('bgm');
    this.music.volume = 0.15
    this.music.play('', 0, 1, true);

  }

  nextState() {
    this.scene.start('GameScene')
  }

  renderTrees() {
    let bushSize = 32;
    for (let i = 0; i < Math.round(this.cameras.main.width / bushSize) - 5; i++) {
      this.add.existing(this.add.sprite(i * (bushSize) + 10 * Math.random(), this.cameras.main.height - bushSize, 'sprites', 'mudd'));
    }
    let offset = 25;
    let count = Math.round(this.cameras.main.width / offset);
    let indexs = []
    for (let i = 0; i < count; i++) { indexs.push(i) }
    let trees = [
      {name: 'bigTree', w: 65, h: 155},
      {name: 'fatTree', w: 93, h: 122},
      {name: 'wTree', w: 65, h: 95},
    ]
    shuffle(indexs).forEach(index => {
      let data = trees[Math.floor(Math.random() * trees.length)]
      let top = this.cameras.main.height - data.h/2 + Math.random() * 10
      let left = offset * index;
      this.add.sprite(left, top, 'sprites', data.name);
    });
  }

  update() {
    if(this.banner.y > this.cameras.main.height/2 - 120) {
      this.banner.y -= 2;
    } else {
      this.button.alpha += 0.1;
      
    }
  }
}


