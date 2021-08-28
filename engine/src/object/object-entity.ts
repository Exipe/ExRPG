
import { Sprite } from "../texture/sprite";
import { Engine, OutlineComponent } from "..";
import { ObjectData } from "./object-data";
import { Entity } from "../entity/entity";
import { InputHandler } from "../input-handler";
import { LightComponent } from "../light/light-component";
import { EntityShadow } from "../entity/entity-shadow";

export class ObjectEntity extends Entity {

    public readonly data: ObjectData

    private sprite: Sprite = null

    constructor(engine: Engine, objectData: ObjectData, tileX: number, tileY: number) {
        super(tileX, tileY, 0, 0, objectData.width, objectData.offsetX, objectData.offsetY)

        this.data = objectData

        if(objectData.light > 0) {
            const lightComp = new LightComponent(this, engine.lightHandler, objectData.light)
            this.componentHandler.add(lightComp)
        }

        objectData.getSprite(engine)
        .then(sprite => {
            this.sprite = sprite
            this.setDimensions(sprite.width, sprite.height)

            if(objectData.options.length > 0) {
                this.componentHandler.add(new OutlineComponent(sprite, engine.shaderHandler))
            }

            if(objectData.shadowData != null) {
                this.shadow = new EntityShadow(this, sprite, objectData.shadowData)
            }
        })
    }

    public get interactable() {
        return this.data.options.length > 0
    }

    protected onClick(inputHandler: InputHandler) {
        if(inputHandler.onObjectClick != null) {
            inputHandler.onObjectClick(this)
            return true
        }

        return false
    }

    protected onContext(inputHandler: InputHandler) {
        if(inputHandler.onObjectContext != null) {
            inputHandler.onObjectContext(this)
        }
    }

    public draw() {
        super.draw()

        if(this.sprite == null) {
            return
        }

        this.sprite.draw(this.drawX, this.drawY)
    }

}