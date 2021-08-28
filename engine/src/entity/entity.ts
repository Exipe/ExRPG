
import { TILE_SIZE } from ".."
import { EntityList } from "./entity-list"
import { InputHandler } from "../input-handler"
import { ComponentHandler } from "./component-handler"
import { EntityShadow } from "./entity-shadow"
import { Hoverable } from "../hoverable"

export function feetCoords(entity: Entity, tileX = entity.tileX, tileY = entity.tileY) {
    return [ tileX * TILE_SIZE + entity.offsetX, tileY * TILE_SIZE + entity.offsetY ]
}

export abstract class Entity implements Hoverable {

    protected readonly tileSpan: number

    public drawX = 0
    public drawY = 0

    public tileX: number
    public tileY: number

    public readonly offsetX: number
    public readonly offsetY: number

    public _onMove: () => any = null

    //position of feet
    private _feetX: number
    private _feetY: number

    private _width: number
    private _height: number

    //neighbouring entities in list
    public ahead: Entity = null
    public behind: Entity = null

    public list: EntityList = null

    public componentHandler = new ComponentHandler()
    public shadow = null as EntityShadow
    
    constructor(tileX: number, tileY: number, width = 0, height = 0, tileSpan = 1, offsetX = 0, offsetY = 0) {
        this.tileX = tileX
        this.tileY = tileY
        this.tileSpan = tileSpan
        this.offsetX = offsetX
        this.offsetY = offsetY

        const [feetX, feetY] = feetCoords(this)
        this._feetX = feetX
        this._feetY = feetY

        this._width = width
        this._height = height
        this.updateDrawCoords()
    }

    startHover(): void {
        this.componentHandler.forEach(c => c.startHover())
    }

    stopHover(): void {
        this.componentHandler.forEach(c => c.stopHover())
    }

    public get interactable() {
        return false
    }

    public inClickBox(x: number, y: number) {
        x -= this.drawX
        y -= this.drawY

        return x >= 0 && x < this._width && y >= 0 && y < this._height
    }

    protected onClick(_: InputHandler) {
        return false
    }

    public click(inputHandler: InputHandler, x: number, y: number) {
        if(!this.inClickBox(x, y)) {
            return false
        }

        return this.onClick(inputHandler)
    }

    protected onContext(_: InputHandler) {}

    public context(inputHandler: InputHandler, x: number, y: number) {
        if(!this.inClickBox(x, y)) {
            return
        }

        this.onContext(inputHandler)
    }

    public get feetX() {
        return this._feetX
    }

    public get feetY() {
        return this._feetY
    }

    public get width() {
        return this._width
    }

    public get height() {
        return this._height
    }

    public animate(dt) {
        this.componentHandler.forEach(c => c.animate(dt))
    }

    public draw() {
        this.componentHandler.forEach(c => c.draw(this.drawX, this.drawY))
    }

    public moveTile(x: number, y: number) {
        this.tileX = x
        this.tileY = y

        this.componentHandler.forEach(c => c.moveTile())

        const [feetX, feetY] = feetCoords(this)
        this.moveFeet(feetX, feetY)
    }

    public get centerCoords(): [number, number] {
        return [this.drawX + this.width / 2, this.drawY + this.height / 2]
    }

    public get centerAboveCoords(): [number, number] {
        return [this.drawX + this.width / 2, this.drawY]
    }

    public get centerBelowCoords(): [number, number] {
        return [this.drawX + this.width / 2, this.drawY + this.height]
    }

    protected updateDrawCoords() {
        this.drawX = this._feetX + (TILE_SIZE * this.tileSpan - this._width) / 2
        this.drawY = this._feetY + TILE_SIZE - this._height

        this.componentHandler.forEach(c => c.movePx())
    }

    protected setDimensions(width: number, height: number) {
        this._width = width
        this._height = height
        this.updateDrawCoords()
    }

    public setAhead(other: Entity) {
        this.ahead = other
        other.behind = this
    }

    public setBehind(other: Entity) {
        this.behind = other
        other.ahead = this
    }

    public isAhead(other: Entity) {
        return this._feetY >= other._feetY
    }

    public isBehind(other: Entity) {
        return this._feetY <= other._feetY
    }

    private moveDown() {
        if(this.ahead == null || this.ahead.isAhead(this)) {
            return
        }

        let ahead = this.ahead
        this.remove()
        ahead.placeAhead(this)
    }

    private moveUp() {
        if(this.behind == null || this.behind.isBehind(this)) {
            return
        }

        let behind = this.behind
        this.remove()
        behind.placeBehind(this)
    }

    public placeAhead(other: Entity) {
        if(this.ahead == null) {
            this.setAhead(other)
            this.list.furthestAhead = other
        } else if(this.ahead.isAhead(other)) {
            other.setAhead(this.ahead)
            this.setAhead(other)
        } else {
            this.ahead.placeAhead(other)
        }
    }

    public placeBehind(other: Entity) {
        if(this.behind == null) {
            this.setBehind(other)
            this.list.furthestBehind = other
        } else if(this.behind.isBehind(other)) {
            other.setBehind(this.behind)
            this.setBehind(other)
        } else {
            this.behind.placeBehind(other)
        }
    }

    public moveFeet(x: number, y: number) {
        let oldY = this._feetY

        this._feetX = x
        this._feetY = y

        this.updateDrawCoords()
        if(this._onMove != null) {
            this._onMove()
        }

        if(y > oldY) {
            this.moveDown()
        } else if(y < oldY) {
            this.moveUp()
        }
    }

    public destroy() {
        this.remove()
        this.componentHandler.forEach(c => c.destroy())
    }

    private remove() {
        if(this.behind == null) {
            this.list.furthestBehind = this.ahead
        } else {
            this.behind.ahead = this.ahead
        }

        if(this.ahead == null) {
            this.list.furthestAhead = this.behind
        } else {
            this.ahead.behind = this.behind
        }

        this.ahead = null
        this.behind = null
    }

}