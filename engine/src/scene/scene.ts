
import { Engine, TILE_SIZE, Item } from ".."
import { SceneBuilder } from "./scene-builder"
import { BaseLayer } from "./layer/base-layer"
import { OverlayLayer } from "./layer/overlay-layer"
import { WallLayer } from "./layer/wall-layer"
import { Layer } from "./layer/layer"
import { OverlayTile } from "../tile/overlay-tile"
import { WallTile } from "../tile/wall-tile"
import { AttribTile, BLOCK_ID } from "../tile/attrib-tile"
import { AttribLayer } from "./layer/attrib-layer"
import { ObjectEntity } from "../object/object-entity"
import { EntityList } from "../entity/entity-list"
import { Entity } from "../entity/entity"
import { CHUNK_SIZE } from "./layer/chunk"
import { Tile } from "../tile/tile"
import { DecoTile } from "../tile/texture-tile"
import { DecoLayer } from "./layer/deco-layer"
import { NpcEntity } from "../npc/npc-entity"
import { InputHandler } from "../input-handler"
import { BlockMap, IslandMap } from "./meta-map"
import { Hoverable } from "../hoverable"

export class Scene {

    private readonly chunkSizePx = TILE_SIZE * CHUNK_SIZE

    private readonly engine: Engine

    private _width: number
    private _height: number

    public readonly builder: SceneBuilder

    private _baseLayer: Layer<Tile>
    private _overlayLayer: Layer<OverlayTile>
    private _wallLayer: Layer<WallTile>
    private _attribLayer: Layer<AttribTile>
    private _decoLayer: Layer<DecoTile>

    private blockMap: BlockMap
    public islandMap: IslandMap

    public entityList: EntityList = new EntityList()
    private items = [] as Item[]

    constructor(engine: Engine, width: number, height: number) {
        this.engine = engine
        this.builder = new SceneBuilder(this, engine)
        this._width = width
        this._height = height

        this._baseLayer = new BaseLayer(width, height)
        this._overlayLayer = new OverlayLayer(width, height)
        this._wallLayer = new WallLayer(width, height)
        this._attribLayer = new AttribLayer(width, height)
        this._decoLayer = new DecoLayer(width, height)

        this.blockMap = new BlockMap(width, height)
        this.islandMap = new IslandMap(this)
    }

    public get width() {
        return this._width
    }

    public get height() {
        return this._height
    }

    public get baseLayer() {
        return this._baseLayer
    }

    public get overlayLayer() {
        return this._overlayLayer
    }

    public get wallLayer() {
        return this._wallLayer
    }

    public get attribLayer() {
        return this._attribLayer
    }

    public get decoLayer() {
        return this._decoLayer
    }

    private hovering: Hoverable = null

    public updateHover(x: number, y: number) {
        let hovering: Hoverable = null
        this.entityList.fromFront(e => {
            if(hovering != null) {
                return
            }

            if(e.inClickBox(x, y)) {
                hovering = e
            }
        })

        if(hovering == null) {
            hovering = this.items.find(i => i.inClickBox(x, y)) || null
        }

        if(hovering == this.hovering) {
            return
        }

        if(this.hovering != null) {
            this.hovering.stopHover()
        }

        if(hovering != null) {
            hovering.startHover()
        }

        this.hovering = hovering
    }

    private inBounds(x: number, y: number) {
        return x >= 0 && y >= 0 && x < this._width && y < this._height
    }

    public click(inputHandler: InputHandler, x: number, y: number, altKey: boolean) {
        let clickEntity = false
        this.entityList.fromFront(e => {
            if(clickEntity) {
                return
            }
            
            clickEntity = e.click(inputHandler, x, y)
        })

        if(clickEntity) {
            return
        }

        if(inputHandler.onItemClick) {
            for(let i = this.items.length - 1; i >= 0; i--) {
                const item = this.items[i]

                if(item.inClickBox(x, y)) {
                    inputHandler.onItemClick(item)
                    return
                }
            }
        }

        if(inputHandler.onTileClick) {
            const tileX = Math.floor(x / TILE_SIZE)
            const tileY = Math.floor(y / TILE_SIZE)

            if(this.inBounds(tileX, tileY)) {
                inputHandler.onTileClick(tileX, tileY, altKey)
            }
        }
    }

    public contextMenu(inputHandler: InputHandler, x: number, y: number) {
        this.entityList.fromBack(e => {
            e.context(inputHandler, x, y)
        })

        if(inputHandler.onItemContext != null) {
            for(let i = this.items.length - 1; i >= 0; i--) {
                const item = this.items[i]

                if(item.inClickBox(x, y)) {
                    inputHandler.onItemContext(item)
                }
            }
        }

        if(inputHandler.onTileContext != null) {
            const tileX = Math.floor(x / TILE_SIZE)
            const tileY = Math.floor(y / TILE_SIZE)

            if(this.inBounds(tileX, tileY)) {
                inputHandler.onTileContext(tileX, tileY)
            }
        }
    }

    public isHardBlocked(x: number, y: number) {
        if(!this.inBounds(x, y)) {
            return true
        }

        const attrib = this.attribLayer.get(x, y)
        return attrib != null && attrib.id == BLOCK_ID
    }

    public isBlocked(x: number, y: number) {
        return this.blockMap.isBlocked(x, y)
    }

    public block(x: number, y: number) {
        this.blockMap.block(x, y)
    }

    public unBlock(x: number, y: number) {
        this.blockMap.unBlock(x, y)
    }

    public addEntity(entity: Entity) {
        this.entityList.add(entity)
    }

    public addObject(id: string, x: number, y: number) {
        const objData = this.engine.objectHandler.get(id)
        if(objData == null) {
            throw "Invalid object ID: " + id
        }

        const obj = new ObjectEntity(this.engine, objData, x, y)
        this.addEntity(obj)
        return obj
    }

    public addNpc(id: string, x: number, y: number) {
        const npcData = this.engine.npcHandler.get(id)
        if(npcData == null) {
            throw "Invalid NPC ID: " + id
        }

        const npc = new NpcEntity(this.engine, npcData, x, y)
        this.addEntity(npc)
        return npc
    }

    public createItem(id: string, x: number, y: number) {
        const itemData = this.engine.itemHandler.get(id)
        if(itemData == null) {
            throw "Invalid item ID: " + id
        }

        const item = new Item(this.engine, itemData, x, y)
        this.addItem(item)
        return item
    }

    public addItem(item: Item) {
        this.items.push(item)
    }

    public removeItem(item: Item) {
        this.items = this.items.filter(i => i != item)
    }

    public resize(width: number, height: number, anchorX: 0 | 1 | 2, anchorY: 0 | 1 | 2) {
        this.entityList.destroy()
        this.entityList = new EntityList() //otherwise it duplicates objects
        this.items = []

        this._baseLayer = this._baseLayer.resize(width, height, anchorX, anchorY)
        this._overlayLayer = this._overlayLayer.resize(width, height, anchorX, anchorY)
        this._wallLayer = this._wallLayer.resize(width, height, anchorX, anchorY)
        this._attribLayer = this._attribLayer.resize(width, height, anchorX, anchorY)
        this._decoLayer = this._decoLayer.resize(width, height, anchorX, anchorY)

        this.blockMap = this.blockMap.resize(width, height, anchorX, anchorY) as BlockMap
        this.islandMap = this.islandMap.resize(width, height, anchorX, anchorY)

        this._width = width
        this._height = height
        this.update()
    }

    public update() {
        this._baseLayer.update(this.engine)
        this._overlayLayer.update(this.engine)
        this._wallLayer.update(this.engine)
        this._attribLayer.update(this.engine)
        this._decoLayer.update(this.engine)
    }

    public animate(dt: number) {
        this.entityList.fromBack(e => {
            e.animate(dt)
        })
    }

    public draw() {
        const camera = this.engine.camera

        const firstX = Math.floor(camera.x / this.chunkSizePx)
        const firstY = Math.floor(camera.y / this.chunkSizePx)

        const lastX = Math.ceil((camera.x + camera.width) / this.chunkSizePx) + 1
        const lastY = Math.ceil((camera.y + camera.height) / this.chunkSizePx) + 1

        this._baseLayer.draw(this.engine, firstX, firstY, lastX, lastY)
        this._overlayLayer.draw(this.engine, firstX, firstY, lastX, lastY)
        this._wallLayer.draw(this.engine, firstX, firstY, lastX, lastY)
        this._decoLayer.draw(this.engine, firstX, firstY, lastX, lastY)
        
        this.items.forEach(i => i.draw(this.engine))
        this.entityList.fromBack(e => {
            e.draw()
        })

        this._attribLayer.draw(this.engine, firstX, firstY, lastX, lastY)
    }

    public destroy() {
        this.entityList.destroy()
    }

}
