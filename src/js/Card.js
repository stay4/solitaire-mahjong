import Stackable from 'Stackable';

import { MainSlot, FreeSlot } from 'Slot';

export default class Card extends Stackable {
    constructor(scene, suit, number) {
        super(scene, 0, 0);

        this._suit = suit;
        this._number = number;
        this._flipped = false;

        scene.add.existing(this);
        this.setSize(128, 196);
        this.setInteractive();

        this._sprite = scene.add.sprite(0, 0, 'spritesheet', this.getImageKey(suit, number));
        this.add(this._sprite);
    }

    static get SuitDragons() { return 0; }
    static get SuitDots() { return 1; }
    static get SuitBamboo() { return 2; }
    static get SuitCharacters() { return 3; }
    static get SpecialNumberFlower() { return 100; }
    static get SpecialNumberWhite() { return 200; }
    static get SpecialNumberGreen() { return 300; }
    static get SpecialNumberRed() { return 400; }

    get suit() { return this._suit; }
    get number() { return this._number; }
    get flipped() { return this._flipped; }

    onOverlap(target) {
        throw new Error('should not be called.');
    }

    getImageKey(suit, number) {
        return `${['d','p','s','m'][suit]}${number}`;
    }

    canMove() {
        const lastAncestor = this.getLastAncestor();
        const onMainSlot = lastAncestor instanceof MainSlot;
        const onFreeSlot = lastAncestor instanceof FreeSlot;

        if (!onMainSlot && !onFreeSlot) {
            return false;
        }

        if (this._flipped) {
            return false;
        }

        if (this.isTerminal()) {
            return true;
        }

        if (this._child.suit === this.suit) {
            return false;
        }

        if (this._child.number !== this.number - 1) {
            return false;
        }

        return this._child.canMove();
    }

    toString() {
        return `${['j','p','s','m'][this.suit]}${this.number}`;
    }

    flipToBack() {
        this._sprite.setFrame('back');
        this._flipped = true;
    }
}
