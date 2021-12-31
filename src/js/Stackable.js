import Phaser from 'phaser';

export default class Stackable extends Phaser.GameObjects.Container {
    constructor(scene, x=0, y=0) {
        super(scene, x, y);

        scene.add.existing(this);

        this._tmpPos = { x: 0, y: 0 };
        this._child = null;
        this._parent = null;
    }

    get child() { return this._child; }
    get parent() { return this._parent; }

    onOverlap(target) {
        throw new Error('not implemented.');
    }

    stack(child, deltaY=0.0, movingInfo=null) {
        if (this === child) {
            return;
        }

        child.connectParent(this);

        const dx = this.x - child.x;
        const dy = this.y - child.y + deltaY;

        return child.move(dx, dy, false, movingInfo);
    }

    isTerminal() {
        return this._child === null;
    }

    getLastAncestor(includeSelf=true) {
        let ret = includeSelf ? this : null;

        if (this._parent !== null) {
            ret = this._parent.getLastAncestor();
        }

        return ret;
    }

    getLastDescendant(includeSelf=true) {
        let ret = includeSelf ? this : null;

        if (!this.isTerminal()) {
            ret = this._child.getLastDescendant();
        }

        return ret;
    }

    connectParent(parent) {
        this.disconnectParent();

        parent._child = this;
        this._parent = parent;  
    }

    disconnectParent() {
        if (this._parent === null) {
            return;
        }

        this._parent._child = null;
        this._parent = null;
    }

    updateDepth(depth=0) {
        if (!this.isTerminal()) {
            this._child.updateDepth(depth+1);
        }

        this.setDepth(depth);
    }

    bringToTop() {
        this.updateDepth(100);
    }

    overlaps(other) {
        const x = other.x;
        const y = other.y;
        const hw = this.width/2;
        const hh = this.height/2;
        const l = this.x - hw;
        const r = this.x + hw;
        const t = this.y - hh;
        const b = this.y + hh;

        return (x > l) && (x < r) && (y > t) && (y < b);
    }

    isDescendantOf(other) {
        if (this.isTerminal()) {
            return false;
        }

        if (this._child === other) {
            return true;
        }

        return this._child.isDescendantOf(other);
    }

    move(x, y, absolute=false, movingInfo=null) {
        const dstX = absolute ? x : this.x + x;
        const dstY = absolute ? y : this.y + y;

        if (movingInfo === null) {
            this.x = dstX;
            this.y = dstY;
        }
        else {
            movingInfo.push({
                target: this,
                x: dstX,
                y: dstY
            });
        }

        if (!this.isTerminal()) {
            this._child.move(x, y, absolute, movingInfo);
        }
    }

    savePosition() {
        this._tmpPos = { x: this.x, y: this.y };

        if (!this.isTerminal()) {
            this._child.savePosition();
        }
    }

    restorePosition() {
        this.x = this._tmpPos.x;
        this.y = this._tmpPos.y;

        if (!this.isTerminal()) {
            this._child.restorePosition();
        }
    }
}
