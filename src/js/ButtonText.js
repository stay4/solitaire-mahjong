import Phaser from 'phaser';

export default class ButtonText extends Phaser.GameObjects.Container {
    constructor(scene, text, onClick, x=0, y=0) {
        super(scene, x, y);

        scene.add.existing(this);
        this.setSize(280, 60);
        this.setInteractive();

        const w = this.width;
        const h = this.height;
        const x0 = -w / 2;
        const y0 = -h / 2;
        const color = 0x094b30;

        const g = scene.add.graphics();
        g.fillStyle(color);
        g.fillRoundedRect(x0, y0, w, h, 12);
        this.add(g);

        const style = {
            fontFamily: 'sans-serif',
            fontSize: '24px'
        };
        const t = scene.add.text(0, 0, text, style).setOrigin(0.5, 0.4);
        this.add(t);

        this.on('pointerup', () => {
            onClick();
        });
    }
}
