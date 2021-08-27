
import { Sprite } from "../texture/sprite";
import { Engine, PLAYER_SIZE } from "..";
import { loadTexture } from "../texture/texture";
import { MultiTexture } from "../texture/multi-texture";

export class EquipmentSpriteSheet {

    private sprites = [] as Sprite[]
    private readonly spritePath: string

    constructor(spritePath: string) {
        this.spritePath = spritePath
    }

    public async get(engine: Engine, idx: number) {
        if(this.sprites.length == 0) {
            const texture = await loadTexture(engine.gl, this.spritePath)
            const multiTexture = new MultiTexture(texture, PLAYER_SIZE[0], PLAYER_SIZE[1])

            for(let i = 0; i < multiTexture.width; i++) {
                this.sprites.push(new Sprite(engine, multiTexture.get(i, 0)))
            }
        }

        return this.sprites[idx]
    }

}

export class EquipmentSprite {

    private readonly spriteSheet: EquipmentSpriteSheet
    private readonly idx: number

    constructor(spriteSheet: EquipmentSpriteSheet, idx: number) {
        this.spriteSheet = spriteSheet
        this.idx = idx
    }

    public get(engine: Engine): Promise<Sprite> {
        return this.spriteSheet.get(engine, this.idx)
    }

}

export class EquipmentData {

    public readonly sprite: EquipmentSprite

    public readonly slot: string

    public get drawable() {
        return this.sprite != null
    }

    constructor(sprite: EquipmentSprite, slot: string) {
        this.sprite = sprite
        this.slot = slot
    }

    public getSprite(engine: Engine) {
        return this.sprite.get(engine)
    }

}
