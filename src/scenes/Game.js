import Phaser from 'phaser'
import { centerGameObjects } from '../utils'
import shuffle from 'lodash.shuffle';
import cardsPool from '../cards'

const ENERGY_COST = 2;
const BOMBNUM = 10;
const CARD_HEIGHT = 120;
const CARD_WIDTH = 80;
const GAMESPEED = 800
const levelR = 5;
const MONS_FACTOR = 3;
const CARDS_LIMIT = 6;
// monster g time
const TIMER = 4;
const CENTER_Y = 9
const VDIRECTIONS = [
  [-1, 0],//left
  [0, 1],//up
  [0, -1],//down
]
const SELF_INDEX = 119;
const ALLOW_INDEXES = [119, 113, 527];
const EDGE_INDEX = 302;
const MAPSIZE = 32;
const SPEED = 6;
const MONSTER_LIST = [
  ['bat', 'frog'],
  ['bat', 'frog', 'ghost'],
  ['bat', 'frog', 'ghost', 'skeleton'],
]

const BASE_MONS_DATA = {
  bat: {
    hp: 1,
    ack: 1,
  },
  frog: {
    hp: 1,
    ack: 1,
  },
  ghost: {
    hp: 1,
    ack: 2,
  },
  skeleton: {
    hp: 2,
    ack: 1,
  },
}
export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'GameScene' })
  }
  init () {}

  preload () {
    this.cameras.main.setBackgroundColor('#c39753')
    this.anims.create({ key: 'standing', frames: this.anims.generateFrameNumbers('actors', { start: 0, end: 2 }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'batS', frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 2 }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'ghostS', frames: this.anims.generateFrameNumbers('ghost', { start: 0, end: 2 }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'frogS', frames: this.anims.generateFrameNumbers('frog', { start: 0, end: 2 }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'skeletonS', frames: this.anims.generateFrameNumbers('skeleton', { start: 0, end: 2 }), frameRate: 5, repeat: 
    -1 });


    this.anims.create({ key: 'bsp', frames: this.anims.generateFrameNumbers('barbarian', { start: 0, end: 2 }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'psp', frames: this.anims.generateFrameNumbers('priest', { start: 0, end: 2 }), frameRate: 5, repeat: -1 });

    this.anims.create({ key: 'bbb', frames: this.anims.generateFrameNumbers('bomb', { start: 0, end: 5 }), frameRate: 5, repeat: -1 });

  }

  create() {
    this.pause = false;
    this.energy = 0;
    this.cards = [];
    this.activeCard = null;
    this.stat = {
      level: 1,
      monsterCount: 0,
    }
    this.fighters = {};
    this.fireArea = [];
    this.mapInit(this);
    this.setupMarker();
    this.setupPointer();
    this.actorInit();
    this.setupStatusBar();
    this.mapData = [{
      target: this.hero,
      x: 5,
      y: CENTER_Y,
    }];
    this.openDialog()
  }

  openDialog() {
    this.dialog = this.add.text(100, this.cameras.main.height - 140, "Alex lost in this place, draw card to keep alex alive.\n\n > Click to Continue", {
      font: '30px Bangers',
      fill: '#FFFFFF',
      smoothed: false,
      align: 'center',
    }).setInteractive();
    // dialog.inputEnabled = true;
    this.dialog.on('pointerdown', this.gameStart, this)
  }

  gameStart() {
    this.addDrawButton();
    this.dialog.destroy()
    this.startTime = Date.now();
    this.latestTime = this.startTime;
    this.status.alpha = 1;
    this.counter = 0;
    this.killCount = 0;
  }

  setupStatusBar() {
    this.tips = this.add.text(50, this.cameras.main.height - 20, "", {
      font: '15px Arial',
      fill: '#FFFFFF',
      smoothed: false,
      align: 'left',
    })

    this.status = this.add.text(20, 15, "Energy: 0", {
      font: '20px Bangers',
      fill: '#FFFFFF',
      smoothed: false,
      align: 'left',
    })
    this.status.alpha = 0;
  }

  setupMarker() {
    this.marker = this.add.graphics();
    this.marker.lineStyle(2, 0xffffff, 1);
    this.marker.alpha = 0
    this.marker.strokeRoundedRect(0, 0, 32, 32, 3);
    // this.input.mouse.requestPointerLock();
    this.input.on('pointermove', this.updateMarker, this)
    this.input.on('pointerdown', this.clickBoard, this)
  }

  clickBoard() {
    if(!this.activeCard) return
    let data = this.getTileProperties();
    if (!data) return
    if (data.index == SELF_INDEX) {
      this.useCard()
    }
  }
  iceArea({x, y}) {
    let used = false;
    this.mapData.forEach(element => {
      if(element.x == x && element.y == y) {
        element.freezeCount = 3;
        used = true;
      }
    })
    if (used) {
      this.removeActiveCard()
    }
  }
  addFigther(x, y, sprite, {hp, ack, ...info}) {
    if(this.fighters[x+','+y]) {
      if(this.fighters[x+','+y].type == sprite) {
        this.fighters[x+','+y].ack += info.ua;
        this.fighters[x+','+y].hp += info.uh;
      } else {
        return false
      }
    }
    let f = this.add.sprite(-10, -10, sprite, 0);
    f.play(info.ani, 1, 0);
    f.scale = 1.5
    f.hp = hp
    f.ack = ack
    let hpText = this.add.text(20, 15, hp, {
      font: '10px Bangers',
      fill: '#FFFFFF',
      smoothed: false,
      align: 'left',
    })
    let ackText = this.add.text(20, 15, ack, {
      font: '10px Bangers',
      fill: '#FFFFFF',
      smoothed: false,
      align: 'left',
    })
    let fd = {
      type: sprite, x, y, target: f, hpText, ackText, ack, hp, originHp: hp,info
    };
    this.fighters[x+','+y] = fd
    this.mapData.push(fd)
    return true
  }
  addBarbarian({x, y}, data) {
    if(this.addFigther(x, y, 'barbarian', {
      ack: 2,
      hp: 3,
      ua: 2,
      uh: 1,
      ani: 'bsp'
    })) {
      this.removeActiveCard()
    }
  }
  useCard() {
    let data = this.getTileProperties();
    let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main)
    let x = this.map.worldToTileX(worldPoint.x);
    let y = this.map.worldToTileX(worldPoint.y);
    switch (this.activeCard.name) {
      case 'fire': {
        this.fireArea[data.x] = this.fireArea[data.x] || []
        this.fireArea[data.x][data.y] = 1
        this.add.sprite(x*MAPSIZE + 16, y*MAPSIZE + 16, 'sprites', 'fire');
        this.removeActiveCard()
        break;
      }
      case 'ice':{
        this.iceArea(data)
        break;
      }
        
      case 'barbarian':{
        this.addBarbarian(data);
        break;
      }
      case 'shield': {
        if(this.fighters[x+','+y]) {
          this.fighters[x+','+y].hp += 2;
          this.removeActiveCard();
        }
        break;
      }
      case 'axe': {
        if(this.fighters[x+','+y]) {
          this.fighters[x+','+y].ack += 2;
          this.removeActiveCard();
        }
        break;
      }
      case 'bomb':
        this.bomb()
        break;
      default:
        this.showTips("THAT IS A BIG TODO! Hope we can do it later. You use a useless card.")
        this.removeActiveCard();
        break;
    }
    this.marker.alpha = 0;
  }
  bomb() {
    let indexes = [];
    for (let i = 0; i < BOMBNUM; i++) {
      indexes.push(Math.floor(Math.random() * 25));
    }
    let start = [5,7];
    console.log(indexes)
    let boomArea = indexes.map(i => {
      let x = (i % 5) + start[0]
      let y = Math.floor(i / 5) + start[1]
      let boom = this.add.sprite(x * 32, y * 32, 'bomb', 0);
      boom.play('bbb', 10, 0);
      setTimeout(() => {
        boom.destroy()
      }, 500)
      this.mapData.forEach((el) => {
        if(el.x == x && el.y == y && el.isVillain) {
          this.killed(el)
        }
      })
      
    });
    this.removeActiveCard();
  }

  removeActiveCard() {
    this.cards.splice(this.cards.indexOf(this.activeCard), 1);
    this.activeCard.destroy();
    this.activeCard = null;
  }

  setupPointer() {
    game.input.setDefaultCursor('url(assets/images/pointer.png), pointer');
  }

  actorInit(that) {
    this.hero = this.add.sprite(-10, -10, 'actors', 0);
    this.hero.play('standing', 1, 0);
    this.hero.scale = 1.5

  }

  mapInit() {
    this.map = this.make.tilemap({ key: 'battleground' });
    this.tiles = this.map.addTilesetImage('tileset');
    this.layer = this.map.createStaticLayer(0, this.tiles, 0, 0);
  }

  dataCalculate() {
    let level = this.stat.level;
    let counter = this.counter;
    let kCount = this.stat.killCount;
    // monster upgrade every 10 kill
    if (kCount != 0 && kCount % levelR == 0) level = this.stat.level++;
    // if (counter != 0 && counter % 5 ) {}
    if(counter != 0 && counter % TIMER == 0 && Math.random() > 0.5 && this.mgPos != counter) {
      this.generateMonster(level - 1)
      this.mgPos = counter;
    }
  }

  fightWithFighter(x, y, villain){
    let fighter = this.fighters[x+','+y]
    if(!fighter) return false;
    fighter.hp -= villain.ack;
    villain.hp -= fighter.ack;
    if(fighter.hp <= 0) this.killed(fighter)
    if(villain.hp <= 0) this.killed(villain)
  }
  villainMove(item) {
    let isStart = item.x == 20 && item.y == 9;
    let x = item.x;
    let y = item.y;
    let d = Array.from(VDIRECTIONS);
    let f = d.shift()
    let ds = shuffle(d);
    ds.unshift(f)
    if (isStart) {
      let offset = ds[0];
      x += offset[0]
      y += offset[1]
    } else {
      // if freeze, dont move.
      let edited = item.freezeCount > 0;
      item.freezeCount--;
      ds.forEach(d => {
        if(!edited) {
          let tempx = x + d[0];
          let tempy = y + d[1];
          if (this.fightWithFighter(x, y, item)) {
            return;
          }

          let data = this.map.getTileAt(tempx, tempy);
          let {index} = data;
          let floatable = ['ghost', 'bat'].includes(item.type);
          let canPass = (floatable && index == EDGE_INDEX) || ALLOW_INDEXES.includes(index);
          if (canPass) {
            x = tempx;
            y = tempy;
            edited = true
          }
        }
      });
    }
    // fire damage
    if (this.fireArea[x] && this.fireArea[x][y]) {
      item.hp -= Math.ceil(item.hp/5);
    }
    item.x = x;
    item.y = y;
    if (item.hp == 0) {
      return this.killed(item)
    }

    if (x == 5 && y == CENTER_Y) {this.gameOver()}

  }

  killed(item) {
    item.target.destroy();
      item.hpText.destroy();
      item.ackText.destroy();
      this.mapData.splice(this.mapData.indexOf(item), 1);
      if (!item.isVillain) {
        this.fighters[item.x+','+item.y] = null
      } else {
        this.killCount++;
        this.stat.level = Math.ceil(this.killCount/levelR)
      }
  }

  gameOver() {
    this.scene.start('GameOverScene')
    this.pause = true;
  }

  generateMonster(level) {
    let list = MONSTER_LIST[level] || MONSTER_LIST[MONSTER_LIST.length - 1];
    let type = shuffle(list)[0];
    // villain start point.
    let data = BASE_MONS_DATA[type];
    data.ack += Math.floor(level / MONS_FACTOR);
    data.hp += Math.floor(level / MONS_FACTOR);
    data.type = type;
    this.addVillain(20, CENTER_Y, level, data);
  }

  renderCards() {
    let index = 0;
    this.cards.forEach(element => {
      let x = index * CARD_WIDTH + 50;
      let y = this.cameras.main.height - CARD_HEIGHT/1.5;
      if(element == this.activeCard) { y -= 20 }
      element.setPosition(x, y);
      index += 1;
    })
  }

  update() {
    if(this.pause) return;
    this.dataCalculate()
    this.renderCards()
    this.mapData.forEach(element => {
      let x = element.x * MAPSIZE + MAPSIZE/2;
      let y = element.y * MAPSIZE + MAPSIZE/2;
      if (element.target) {
        element.target.setPosition(x, y);
        y -= 15;
        x -= 16
        if(element.hpText) {
          element.hpText.setPosition(x + 28, y);
          element.hpText.text = element.hp;
        }
        if(element.ackText) {
          element.ackText.setPosition(x, y);
          element.ackText.text = element.ack;
        }
      }
    });
    if(this.startTime) {
      if (Date.now() - this.latestTime > GAMESPEED  ) {
        this.energy += this.counter % 3 == 0 ? 1 : 0;
        this.counter++;
        this.latestTime = Date.now();
        this.mapData.forEach(item => {
          if (item.type && item.isVillain) {
            this.villainMove(item)
          }
        })
      }
      window.second = Math.floor((Date.now() - this.startTime)/1000);
      this.status.text = `
      Energy: ${this.energy}\n
      Survival Time: ${second}s\n
      Level: ${this.stat.level}
    `
    }
  }

  updateMarker() {
    let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main)
    let x = this.map.worldToTileX(worldPoint.x) * MAPSIZE;
    let y = this.map.worldToTileX(worldPoint.y) * MAPSIZE;
    let data = this.getTileProperties()
    if (!data) return
    console.log(data.index, data.x, data.y)
    if (data.index == SELF_INDEX) {
      this.marker.x = x;
      this.marker.y = y;
      this.marker.alpha = !!this.activeCard ? 1 : 0;
    }
    
  }

  getTileProperties() {
    let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main)
    let x = this.map.worldToTileX(worldPoint.x);
    let y = this.map.worldToTileX(worldPoint.y);
    return this.map.getTileAt(x, y)
	}

  requestLock() {
    game.input.mouse.requestPointerLock();
  }

  pointerMove(pointer, x, y, click) {
    if (game.input.mouse.locked && !click) {
      this.pointer.x += game.input.mouse.event.movementX;
      this.pointer.y += game.input.mouse.event.movementY;
    }
  }

  addDrawButton() {
    this.button = this.add.image(this.cameras.main.width - 100, this.cameras.main.height - 50, 'drawbutton', 0).setInteractive();
    this.button.scale = 0.5;
    this.button.inputEnabled = true;
    this.button.on('pointerdown', this.drawACard, this)
  }

  showTips(content, noLimit) {
    this.tips.text = content;
    if(noLimit) return
    setTimeout(() => {
      this.tips.text = ""
    }, 2000);
  }

  drawACard() {
    if (this.energy < ENERGY_COST) {
      return this.showTips('Must have more than 2 energy.')
    }
    if (this.cards.length >= CARDS_LIMIT) {
      return this.showTips(`Can not have more than ${CARDS_LIMIT} cards in your hand.`)
    }
    this.energy -= ENERGY_COST;
    this.cards.push(this.setupCard(shuffle(cardsPool)[0]))
  }

  setupCard(data) {
    let x = this.cards.length * CARD_WIDTH + 50;
    let y = this.cameras.main.height - CARD_HEIGHT/1.5;
    // console.log(data)
    let card = this.add.image(x, y, data.sprite || data.name, 0).setInteractive();
    card.name = data.name;
    card.on('pointerdown', ()=>{
      this.activeCardClick(card, data)
    }, this);
    card.scale = 2;
    return card
  }

  activeCardClick(card, {desc, tips}) {
    if (this.activeCard == card) {
      this.activeCard = null;
    } else {
      this.activeCard = card;
      this.showTips(desc + ' ' + (tips||''), true)
    }
  }

  addVillain(x, y, level, {type, hp, ack}) {
    let villain = this.add.sprite(-10, -10, type, 0);
    villain.play(`${type}S`, 1, 0);
    villain.scale = 1.5
    villain.monster_type = type
    villain.hp = hp
    villain.ack = ack
    let hpText = this.add.text(20, 15, hp, {
      font: '10px Bangers',
      fill: '#000000',
      smoothed: false,
      align: 'left',
    })
    let ackText = this.add.text(20, 15, ack, {
      font: '10px Bangers',
      fill: '#000000',
      smoothed: false,
      align: 'left',
    })
    
    // console.log("new villain", type, hp, ack)
    this.mapData.push({
      type, x, y, target: villain, hpText, ackText, ack, hp, originHp: hp, isVillain: true
    })
  }
}


