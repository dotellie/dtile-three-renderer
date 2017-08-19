import {
    Color
} from "three";

export class RenderTile {
    constructor(x, y, renderer) {
        this.uvs = [];

        this._renderer = renderer;

        this.currentId = -1;
        this.currentTilesetId = -1;

        this._ghost = null;

        this.tint = new Color(0x000000);
        this.opacity = 1;

        this.triRenderCount = 0;
    }

    get needsUpdate() {
        return !this._lastTile ||
            this.currentId !== this._lastTile.tileId ||
            this.currentTilesetId !== this._lastTile.tilesetId;
    }

    update(tile) {
        if (tile !== this._tile) {
            this._lastTile = this._tile;
            this._tile = tile;
        }

        this.currentId = this._ghost ? this._ghost.tileId : this._tile.tileId;
        this.currentTilesetId = this._ghost ? this._ghost.tilesetId : this._tile.tilesetId;

        if (this.needsUpdate) {
            const tileset = this._renderer.getTileset(this.currentTilesetId);
            if (!tileset) return;

            this.uvs = tileset.getTileUvs(this.currentId);

            this.triRenderCount = 0;
        }
    }

    setTint(tint) {
        this.tint = new Color(tint || 0x000000);
        this.resetRenderCount();
    }

    setGhost(tile) {
        this._ghost = tile;
        const tileDifference = tile &&
            (tile.tileId !== this._tile.tileId ||
            tile.tilesetId !== this._tile.tilesetId);
        this.opacity = tileDifference ? 0.8 : 1;
        this.resetRenderCount();
    }

    resetRenderCount() {
        this.triRenderCount = 0;
    }
}
