import Card from 'Card';

export default class Deck {
    constructor(scene) {
        this._cards = [];

        // numbers.
        for (let s = 1; s <= 3; s++) {
            for (let n = 1; n <= 9; n++) {
                this._cards.push(new Card(scene, s, n));
            }
        }

        // dragons.
        for (let i = 0; i < 4; i++) {
            this._cards.push(new Card(scene, Card.SuitDragons, Card.SpecialNumberWhite));
            this._cards.push(new Card(scene, Card.SuitDragons, Card.SpecialNumberGreen));
            this._cards.push(new Card(scene, Card.SuitDragons, Card.SpecialNumberRed));
        }

        // grass.
        this._cards.push(new Card(scene, Card.SuitDragons, Card.SpecialNumberFlower));

        this._index = 0;
    }

    get cards() { return this._cards; }

    shuffle() {
        const a = this._cards;

        for (let i = a.length-1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

    next() {
        const ret = this._cards[this._index];

        ++this._index;

        return ret;
    }
}
