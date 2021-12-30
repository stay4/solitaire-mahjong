import Phaser from 'phaser';

import Card from 'Card';

export default class ButtonDragon extends Phaser.GameObjects.Container {
    constructor(scene, type, onClick, x=0, y=0) {
        super(scene, x, y);

        scene.add.existing(this);
        this.setSize(64, 64);
        this.setInteractive();

        let key;
        if (type === Card.SpecialNumberWhite) {
            key = 'btn_w';
        }
        else if (type === Card.SpecialNumberGreen) {
            key = 'btn_g';
        }
        else {
            key = 'btn_r';
        }

        this._sprite = scene.add.sprite(0, 0, 'spritesheet', key);
        this.add(this._sprite);

        this.on('pointerup', () => {
            if (this._enabled) {
                onClick(type);
            }
        });

        this._enabled = false;

        this.setEnabled(false);
    }

    setEnabled(enabled) {
        this._enabled = enabled;

        if (enabled) {
            this._sprite.setTint(0xffffff);
        }
        else {
            this._sprite.setTint(0x666666);
        }
    }
}
