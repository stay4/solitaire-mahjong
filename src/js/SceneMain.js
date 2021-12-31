import Phaser from 'phaser';

import Card from 'Card';
import { MainSlot, FreeSlot, DestSlot, FlowerSlot } from 'Slot';
import ButtonDragon from 'ButtonDragon';
import ButtonText from 'ButtonText';
import Deck from 'Deck';

export default class SceneMain extends Phaser.Scene {
    constructor() {
        super('main');
    }

    preload() {
        this.load.path = 'assets/image/';
        this.load.atlas('spritesheet');
        this.load.image('instructions');
    }

    create() {
        this._mainSlots = [];
        this._freeSlots = [];
        this._destSlots = [];
        this._buttonDragons = [];
        this._dragonSlot = [null, null, null];

        // init static objects.
        this._mainSlots[0] = new MainSlot(this, 115, 450);
        this._mainSlots[1] = new MainSlot(this, 265, 450);
        this._mainSlots[2] = new MainSlot(this, 415, 450);
        this._mainSlots[3] = new MainSlot(this, 565, 450);
        this._mainSlots[4] = new MainSlot(this, 715, 450);
        this._mainSlots[5] = new MainSlot(this, 865, 450);
        this._mainSlots[6] = new MainSlot(this, 1015, 450);
        this._mainSlots[7] = new MainSlot(this, 1165, 450);

        this._freeSlots[0] = new FreeSlot(this, 115, 200);
        this._freeSlots[1] = new FreeSlot(this, 265, 200);
        this._freeSlots[2] = new FreeSlot(this, 415, 200);

        this._flowerSlot = new FlowerSlot(this, 690, 200);

        this._destSlots[0] = new DestSlot(this, Card.SuitDots, 865, 200);
        this._destSlots[1] = new DestSlot(this, Card.SuitBamboo, 1015, 200);
        this._destSlots[2] = new DestSlot(this, Card.SuitCharacters, 1165, 200);

        this._buttonDragons[0] = new ButtonDragon(this, Card.SpecialNumberWhite, this.onClickDragonButton.bind(this), 540, 130);
        this._buttonDragons[1] = new ButtonDragon(this, Card.SpecialNumberGreen, this.onClickDragonButton.bind(this), 540, 200);
        this._buttonDragons[2] = new ButtonDragon(this, Card.SpecialNumberRed, this.onClickDragonButton.bind(this), 540, 270);

        this._buttonNewGame = new ButtonText(this, 'NEW GAME', this.onClickNewGameButton.bind(this), 1100, 20);
        this._buttonInstructions = new ButtonText(this, 'INSTRUCTIONS', this.onClickInstructionsButton.bind(this), 800, 20);

        const cx = this.sys.game.config.width / 2;
        const cy = this.sys.game.config.height / 2;
        this._pictureInstructions = this.add.sprite(cx, cy-100, 'instructions');
        this._pictureInstructions.setScale(1.3);
        this._pictureInstructions.setDepth(1000);
        this._pictureInstructions.setVisible(false);
        this._pictureInstructions.setInteractive();
        this._pictureInstructions.on('pointerup', this.onClickInstructions.bind(this));

        // stack cards on flower slot.
        this._deck = new Deck(this);
        this._deck.shuffle();

        for (const [index, card] of this._deck.cards.entries()) {
            const indexFromTop = this._deck.cards.length - index;
            card.move(this._flowerSlot.x, this._flowerSlot.y-0.4*indexFromTop, true);
            card.setDepth(indexFromTop + 100);
        }

        // deal cards into main slots.
        const stackCount = 8;
        const stackSizeDefault = 5;
        const dy = 38.4;
        const movingInfo = [];

        for (let depth = 0; depth < stackSizeDefault; depth++) {
            for (let slotIndex = 0; slotIndex < stackCount; slotIndex++) {
                const slot = this._mainSlots[slotIndex];
                const card = this._deck.next();

                card.move(slot.x, slot.y+depth*dy, true, movingInfo);
                card.connectParent(slot.getLastDescendant());
            }
        }
        for (const [index, info] of movingInfo.entries()) {
            const cfg = {
                targets: info.target,
                x: info.x,
                y: info.y,
                delay: index * 100 + 300,
                duration: 200,
                ease: Phaser.Math.Easing.Quadratic.Out
            };

            if (index < movingInfo.length-1) {
                cfg.onComplete = () => {
                    info.target.setDepth(index);
                };
            }
            else {
                cfg.onComplete = () => {
                    this.check();
                };
            }

            this.tweens.add(cfg);
        }

        this._collectableSlots = this._mainSlots.concat(this._freeSlots);
        this._slots = this._collectableSlots.concat([this._flowerSlot]).concat(this._destSlots);
        this._stackables = this._deck.cards.concat(this._slots);

        this.input.on('dragstart', (pointer, object) => {
            object.bringToTop();
            object.savePosition();
            this.updateDragonButton(true);
        });

        this.input.on('drag', (pointer, object, x, y) => {
            const dx = x - object.x;
            const dy = y - object.y;

            object.move(dx, dy);
        });

        this.input.on('dragend', (pointer, object) => {
            this.tryStack(object);
            this.check();
        });
    }

    updateDepth() {
        for (const slot of this._slots) {
            slot.updateDepth();
        }
    }

    updateDraggable(forceDisable=false) {
        for (const card of this._deck.cards) {
            this.input.setDraggable(card, !forceDisable & card.canMove());
        }
    }

    updateDragonButton(forceDisable=false) {
        const dragonCount = [0, 0, 0];
        this._dragonSlot = [null, null, null];

        for (const slot of this._freeSlots) {
            const target = slot.getLastDescendant();

            if (!(target instanceof Card)) {
                continue;
            }

            if (target.number === Card.SpecialNumberWhite) {
                dragonCount[0] += 1;
                this._dragonSlot[0] = this._dragonSlot[0] || slot;
            }
            else if (target.number === Card.SpecialNumberGreen) {
                dragonCount[1] += 1;
                this._dragonSlot[1] = this._dragonSlot[1] || slot;
            }
            else if (target.number === Card.SpecialNumberRed) {
                dragonCount[2] += 1;
                this._dragonSlot[2] = this._dragonSlot[2] || slot;
            }
        }

        for (const slot of this._freeSlots) {
            if (slot.isTerminal()) {
                this._dragonSlot[0] = this._dragonSlot[0] || slot;
                this._dragonSlot[1] = this._dragonSlot[1] || slot;
                this._dragonSlot[2] = this._dragonSlot[2] || slot;
            }
        }

        for (const slot of this._mainSlots) {
            const target = slot.getLastDescendant();

            if (!(target instanceof Card)) {
                continue;
            }

            if (target.number === Card.SpecialNumberWhite) {
                dragonCount[0] += 1;
            }
            else if (target.number === Card.SpecialNumberGreen) {
                dragonCount[1] += 1;
            }
            else if (target.number === Card.SpecialNumberRed) {
                dragonCount[2] += 1;
            }
        }

        for (let i = 0; i < 3; i++) {
            const enabled = !forceDisable && (dragonCount[i] === 4) && (this._dragonSlot[i] !== null);
            this._buttonDragons[i].setEnabled(enabled);
        }
    }

    onClickDragonButton(type) {
        this.updateDragonButton(true);

        let targetSlot;
        if (type === Card.SpecialNumberWhite) {
            targetSlot = this._dragonSlot[0];
        }
        else if (type === Card.SpecialNumberGreen) {
            targetSlot = this._dragonSlot[1];
        }
        else if (type === Card.SpecialNumberRed) {
            targetSlot = this._dragonSlot[2];
        }

        const targets = [];
        const movingInfo = [];

        for (const card of this._deck.cards) {
            if (card.number === type) {
                card.flipToBack();
                card.move(targetSlot.x, targetSlot.y, true, movingInfo);
                targets.push(card);
            }
        }

        for (const [index, info] of movingInfo.entries()) {
            info.target.bringToTop();

            const cfg = {
                targets: info.target,
                x: info.x,
                y: info.y,
                delay: 100,
                duration: 200,
                ease: Phaser.Math.Easing.Quadratic.Out
            };

            if (index === 0) {
                cfg.onComplete = () => {
                    for (const card of targets) {
                        if (card.getLastAncestor() !== targetSlot) {
                            targetSlot.getLastDescendant().stack(card);
                        }
                    }

                    this.updateDepth();
                    this.check();
                };
            }

            this.tweens.add(cfg);
        }
    }

    onClickNewGameButton() {
        this.scene.start();
    }

    onClickInstructionsButton() {
        this._pictureInstructions.setVisible(true);
    }

    onClickInstructions() {
        this._pictureInstructions.setVisible(false);
    }

    tryStack(target) {
        let overlapped = false;

        for (const s of this._stackables) {
            if (target === s) {
                continue;
            }

            if (!s.isTerminal()) {
                continue;
            }

            if (target.isDescendantOf(s)) {
                continue;
            }

            if (target.overlaps(s)) {
                overlapped = s.getLastAncestor().onOverlap(target);

                break;
            }
        }

        if (!overlapped) {
            target.restorePosition();
        }

        return null;
    }

    check() {
        this.updateDraggable(true);
        this.updateDragonButton(true);

        if (this.checkWin()) {
            for (const card of this._deck.cards) {
                this.tweens.add({
                    targets: card,
                    y: card.y + 2000,
                    delay: (card.getLastDescendant().depth - card.depth) * 200,
                    duration: 1000,
                    ease: Phaser.Math.Easing.Quadratic.In
                });
            }

            return;
        }

        // send collectable card to destination slot.
        let collectableNum = 10;

        for (const destSlot of this._destSlots) {
            const d = destSlot.getLastDescendant();

            if (d instanceof Card) {
                collectableNum = Math.min(collectableNum, d.number+1);
            }
            else {
                collectableNum = 1;
            }
        }

        const movingInfo = [];

        for (const slot of this._collectableSlots) {
            const target = slot.getLastDescendant();

            if (!(target instanceof Card)) {
                continue;
            }

            if (target.number === Card.SpecialNumberFlower) {
                this._flowerSlot.stack(target, 0.0, movingInfo);

                break;
            }

            if (target.number === collectableNum) {
                const slot = this._destSlots[target.suit-1];
                slot.getLastDescendant().stack(target, slot.isTerminal() ? 0.0 : -1.0, movingInfo);

                break;
            }
        }

        if (movingInfo.length > 0) {
            const info = movingInfo[0];

            info.target.bringToTop();

            this.tweens.add({
                targets: info.target,
                x: info.x,
                y: info.y,
                duration: 200,
                ease: Phaser.Math.Easing.Quadratic.Out,
                onComplete: () => {
                    this.updateDepth();
                    this.check();
                }
            });
        }
        else {
            this.updateDepth();
            this.updateDraggable(false);
            this.updateDragonButton(false);
        }
    }

    checkWin() {
        for (const slot of this._mainSlots) {
            if (!slot.isTerminal()) {
                return false;
            }
        }

        return true;
    }
}
