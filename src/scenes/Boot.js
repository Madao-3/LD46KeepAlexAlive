import Phaser from 'phaser'
import WebFont from 'webfontloader'
import config from '../config';

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'BootScene' })
  }
  init() {
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)
  }

  preload() {
    WebFont.load({
        google: {
          families: config.webfonts
        },
        active: this.fontsLoaded
      })

    this.add.text(100, 100, 'loading fonts...', { font: '16px Arial', fill: '#ffffff', align: 'center' })

    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')
    this.load.image('pointer', './assets/images/pointer.png');
    this.load.spritesheet('startButton', './assets/images/s2.png', {frameWidth:105,frameHeight:63});
    this.load.image('drawbutton', './assets/images/drawbutton1.png');
    this.load.spritesheet('actors', './assets/images/actors.png', {frameWidth:32,frameHeight:32});
    this.load.spritesheet('barbarian', './assets/images/cards/barbarian_sp.png', {frameWidth:32,frameHeight:32});
    this.load.spritesheet('priest', './assets/images/cards/Priest_sp.png', {frameWidth:32,frameHeight:32});
    this.load.spritesheet('bomb', './assets/images/cards/BOMB.png', {frameWidth:34,frameHeight:81});
    // villains
    this.load.spritesheet('bat', './assets/images/bat.png', {frameWidth:16,frameHeight:16});
    this.load.spritesheet('frog', './assets/images/frog.png', {frameWidth:16,frameHeight:16});
    this.load.spritesheet('ghost', './assets/images/ghost.png', {frameWidth:16,frameHeight:16});
    this.load.spritesheet('skeleton', './assets/images/skeleton.png', {frameWidth:16,frameHeight:16});
    // cards
    this.load.image('barbariancard', './assets/images/cards/barbarian.png');
    this.load.image('priestcard', './assets/images/cards/priest_card.png');
    this.load.image('boom', './assets/images/cards/boom.png');
    this.load.image('shield', './assets/images/cards/shield.png');
    this.load.image('power', './assets/images/cards/power.png');
    this.load.image('blood', './assets/images/cards/blood.png');
    this.load.image('ice', './assets/images/cards/ice.png');
    this.load.image('firecard', './assets/images/cards/firecard.png');

    this.load.audio('bgm', ['assets/audio/Random - Lightyears 500.mp3']);

  }

  update () {
    if (config.webfonts.length && this.fontsReady) {
      this.scene.start('SplashScene')
    }
    if (!config.webfonts.length) {
      this.scene.start('SplashScene')

    }
  }

  fontsLoaded() {
    this.fontsReady = true
  }
}
