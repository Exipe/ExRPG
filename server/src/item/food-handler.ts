
import { Player } from "../player/player";
import { currentTime, timeSince } from "../util/util";

export interface Food {
    delay: number
    heal: number
}

export class FoodHandler {

    private readonly player: Player
    private timestamp = 0

    constructor(player: Player) {
        this.player = player
    }

    eat(slot: number, food: Food) {
        if(timeSince(this.timestamp) < food.delay) {
            this.player.sendMessage("You're eating too fast")
            return
        }

        this.timestamp = currentTime()
        this.player.inventory.emptySlot(slot)

        this.player.playerCombat.heal(food.heal)
    }

}