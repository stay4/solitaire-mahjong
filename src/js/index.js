import 'main.css';

import Phaser from 'phaser';

import SceneMain from 'SceneMain';

class Game extends Phaser.Game {
    constructor() {
        super({
            type: Phaser.AUTO,
            width: 1280,
            height: 1280,
            backgroundColor: '#002d19',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            scene: [SceneMain]
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
