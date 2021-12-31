import Stackable from 'Stackable';

class SlotBase extends Stackable {
    constructor(scene, x=0, y=0) {
        super(scene, x, y);

        this.setSize(128, 192);
    }
}

export class MainSlot extends SlotBase {
    constructor(scene, x=0, y=0) {
        super(scene, x, y);

        this._sprite = scene.add.sprite(0, 0, 'spritesheet', 'slot_main');
        this.add(this._sprite);
    }

    onOverlap(target) {
        const terminal = this.getLastDescendant();

        if (this === terminal) {
            terminal.stack(target);

            return true;
        }

        if (target.suit === terminal.suit) {
            return false;
        }

        if (target.number !== terminal.number-1) {
            return false;
        }

        terminal.stack(target, 38.4);

        return true;
    }
}

export class FreeSlot extends SlotBase {
    constructor(scene, x=0, y=0) {
        super(scene, x, y);

        this._sprite = scene.add.sprite(0, 0, 'spritesheet', 'slot_free');
        this.add(this._sprite);
    }

    onOverlap(target) {
        if (!this.isTerminal()) {
            return false;
        }

        this.stack(target);

        return true;
    }
}

export class DestSlot extends SlotBase {
    constructor(scene, suit, x=0, y=0) {
        super(scene, x, y);

        this._suit = suit;

        this._sprite = scene.add.sprite(0, 0, 'spritesheet', 'slot_dest');
        this.add(this._sprite);
    }

    onOverlap(target) {
        if (target.suit !== this._suit) {
            return false;
        }

        const terminal = this.getLastDescendant();
        const num = (terminal === this) ? 0 : terminal.number;

        if (target.number !== num+1) {
            return false;
        }

        terminal.stack(target, -1.0);

        return true;
    }
}

export class FlowerSlot extends SlotBase {
    constructor(scene, x=0, y=0) {
        super(scene, x, y);

        this._sprite = scene.add.sprite(0, 0, 'spritesheet', 'slot_flower');
        this.add(this._sprite);
    }

    onOverlap(target) {
        return false;
    }
}
