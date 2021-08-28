
import { EntityShadow, NpcData, OutlineComponent, Sprite } from "exrpg";
import { Game } from "../game";
import { Goal } from "./path-finder";
import { NpcActionPacket } from "../../connection/packet";
import { Character } from "./character";

export class Npc extends Character {
    
    public readonly id: number

    public readonly data: NpcData
    
    private sprite: Sprite = null

    public contextListener: () => void

    public clickListener: () => void

    constructor(game: Game, id: number, dataId: string, tileX: number, tileY: number) {
        super(game, tileX, tileY)
        this.id = id

        this.data = game.engine.npcHandler.get(dataId)

        this.data.getSprite(game.engine)
        .then(sprite => {
            this.sprite = sprite
            this.setDimensions(sprite.width, sprite.height)
            this.nameTagComponent.setNameTag("npc", this.data.name)

            const color: any = this.data.options.length > 0 
                        && this.data.options[0][1] == "__attack" 
                        ? [1, 0.25, 0.25, 1] : [1, 1, 1, 1]
                
            this.componentHandler.add(new OutlineComponent(this.sprite, game.engine.shaderHandler, color))

            if(this.data.shadowData != null) {
                this.shadow = new EntityShadow(this, sprite, this.data.shadowData)
            }
        })
    }

    public get interactable() {
        return this.data.options.length > 0
    }

    public getSprite() {
        return this.sprite
    }

    protected onContext(_: any) {
        if(this.contextListener == null) {
            return
        }

        this.contextListener()
    }

    protected onClick(_: any) {
        if(this.clickListener == null) {
            return false
        }

        this.clickListener()
        return true
    }

    public draw() {
        super.draw()

        if(this.sprite == null) {
            return
        }

        this.sprite.draw(this.drawX, this.drawY)
    }

}

export function initNpcs(game: Game): void {
    const connection = game.connection

    const npcAction = (npc: Npc, action: string) => {
        const goal: Goal = {
            x: npc.tileX,
            y: npc.tileY,
            width: 1,
            height: 1,
            distance: 1
        }

        game.walkToGoal(goal)

        if(action != null) {
            connection.send(new NpcActionPacket(npc.id, action))
        }
    }

    const onNpcContext = (npc: Npc) => {
        const data = npc.data
        data.options.forEach(option => {
            const text = `${option[0]} /rgb(255,230,120,${data.name})`
            game.ctxMenu.add([text, () => {
                npcAction(npc, option[1])
            }])
        })
    }

    const onNpcClick = (npc: Npc) => {
        const action = npc.data.options.length > 0 ? npc.data.options[0][1] : null
        npcAction(npc, action)
    }

    connection.on("ADD_NPC", data => {
        data.forEach((n: [number, string, number, number]) => {
            const npc = new Npc(game, n[0], n[1], n[2], n[3])

            npc.clickListener = onNpcClick.bind(null, npc)
            npc.contextListener = onNpcContext.bind(null, npc)
            game.addNpc(npc)
        })
    })

    connection.on("MOVE_NPC", data => {
        const npc = game.getNpc(data.id)
        
        if(data.animate) {
            npc.walkTo(data.x, data.y, data.animationSpeed)
        } else {
            npc.place(data.x, data.y)
        }
    })

    connection.on("REMOVE_NPC", (id: number) => {
        game.removeNpc(id)
    })
}
