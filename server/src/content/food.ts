
import { Food } from "../item/food-handler";
import { actionHandler } from "../world";

function addFood(item: string, food: Food) {
    actionHandler.onItem(item, (player, action, slot) => {
        if(action != "eat" && action != "drink") {
            return
        }

        player.foodHandler.eat(slot, food)
    })
}

export function initFood() {
    addFood("apple", {
        "heal": 5,
        "delay": 15_555
    })

    addFood("strawberry", {
        "heal": 2,
        "delay": 5_555
    })

    addFood("potion_health_weak", {
        "heal": 20,
        "delay": 455
    })
}