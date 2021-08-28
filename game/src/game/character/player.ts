
import { EquipmentData, LightComponent, OutlineComponent, PlayerSprite, Sprite } from "exrpg"
import { Game } from "../game"
import { Goal } from "./path-finder"
import { AttackPlayerPacket, FollowPlayerPacket } from "../../connection/packet"
import { Character } from "./character"

export type PlayerRank = "player" | "dev"

export interface PlayerInfo {
    id: number,
    name: string,
    x: number,
    y: number,
    rank: PlayerRank
}

export class Player extends Character {

    public readonly id: number
    public readonly name: string
    public readonly sprite: PlayerSprite

    public readonly rank: PlayerRank

    private _onContext: (player: Player) => void

    constructor(game: Game, playerSprite: PlayerSprite, onContext: (player: Player) => void, info: PlayerInfo) {
        super(game, info.x, info.y, playerSprite.width, playerSprite.height)
        this.nameTagComponent.setNameTag(info.rank, info.name)
        this.componentHandler.add(new LightComponent(this, game.engine.lightHandler, 48))
        if(info.id != game.localId) {
            this.componentHandler.add(new OutlineComponent(playerSprite.sprite, game.engine.shaderHandler))
        }
        this.id = info.id
        this.name = info.name
        this.sprite = playerSprite
        this._onContext = onContext
    }

    public getSprite() {
        return this.sprite.sprite
    }

    protected onContext(_: any) {
        this._onContext(this)
    }

    public draw() {
        super.draw()
        this.sprite.draw(this.drawX, this.drawY)
    }

}

export async function initPlayers(game: Game) {
    const connection = game.connection
    const engine = game.engine

    const baseSprite = 
    await engine.loadTexture("char/man.png")
    .then(texture => 
        new Sprite(engine, texture)
    )

    const onContext = (player: Player) => {
        if(player.id == game.localId) {
            return
        }

        const goal: Goal = {
            x: player.tileX,
            y: player.tileY,
            width: 1,
            height: 1,
            distance: 1
        }

        const addCtx = (option: string, action: () => void) => {
            const text = `${option} /rgb(230,180,255,${player.name})`
            game.ctxMenu.add([text, action])
        }

        addCtx("Attack", () => {
            game.walkToGoal(goal)
            connection.send(new AttackPlayerPacket(player.id))
        })

        addCtx("Follow", () => {
            game.walkToGoal(goal)
            connection.send(new FollowPlayerPacket(player.id))
        })
    }

    const getAppearanceValues = (equipment: string[]) => {
        const appearanceValues = []
        equipment.forEach(id => {
            const equipData = engine.itemHandler.get(id).equipData
            if(equipData.drawable) {
                appearanceValues.push(equipData.sprite)
            }
        })
        return appearanceValues
    }

    connection.on("WELCOME", data => {
        game.localId = data.id
        game.status.name = data.name
    })

    connection.on("ADD_PLAYER", data => {
        data.forEach((p: any) => {
            const sprite = new PlayerSprite(engine, baseSprite, 
                getAppearanceValues(p.equipment)
            )
            const player = new Player(game, sprite, onContext, p)
            game.addPlayer(player)
        });
    })

    connection.on("PLAYER_APPEARANCE", data => {
        const playerSprite = game.getPlayer(data.id).sprite
        playerSprite.setAppearanceValues(getAppearanceValues(data.equipment))
    })

    connection.on("REMOVE_PLAYER", (id: number) => {
        game.removePlayer(id)
    })

    connection.on("MOVE_PLAYER", data => {
        const player = game.getPlayer(data.id)

        if(data.animate) {
            player.walkTo(data.x, data.y, data.animationSpeed)
        } else {
            player.place(data.x, data.y)
        }
    })
}
