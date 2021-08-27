import { MessagePacket, UpdateLevelPacket } from "../connection/outgoing-packet"
import { experienceRequired, maxHealth } from "../util/formula"
import { playerHandler } from "../world"
import { Player } from "./player"

export class PlayerLevel {

    private readonly player: Player

    constructor(player: Player) {
        this.player = player
    }

    private _level: number
    private requiredExperience: number
    public experience = 0

    public get level() {
        return this._level
    }

    public setLevel(value: number, update = true) {
        this.requiredExperience = experienceRequired(value)
        this.player.playerCombat.setMaxHealth(maxHealth(value), update)
        this._level = value

        if(update) {
            this.update()
        }
    }

    public update() {
        this.player.send(new UpdateLevelPacket(this._level, this.experience, this.requiredExperience))
    }

    public addExperience(xp: number) {
        this.experience += xp

        while(this.experience >= this.requiredExperience) {
            this.experience -= this.requiredExperience
            this.setLevel(this._level+1, false)

            this.player.sendMessage("Congratulations, you have gained a level!")

            const points = this.player.attributes.getPoints()
            if(points > 0) {
                this.player.sendMessage("P.S. Remember to spend your attribute points when you gain a level.")
            }

            this.player.attributes.setPoints(points + 5)

            if(this.level % 10 == 0) {
                playerHandler.globalMessage(`${this.player.name} has advanced to level ${this.level}!`)
            }
        }

        this.update()
        this.player.playerCombat.updateHealth()
    }

}