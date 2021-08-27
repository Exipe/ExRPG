import { Npc } from "../npc/npc"
import { Player } from "../player/player"
import { Dialogue } from "../player/window/dialogue"
import { actionHandler, weatherHandler } from "../world"

const talkToMan = (player: Player, npc: Npc, action: string) => {
    if(action != "talk-to") {
        return
    }

    let message: string[]
    const timeOfDay = weatherHandler.timeOfDay

    switch(timeOfDay) {
        case "DAY":
            message = ["Good day, sir."]
            break
        case "MORNING":
            message = ["Good morning, sir."]
            break
        case "EVENING":
            message = ["Good evening, sir."]
            break
    }

    player.window = new Dialogue(npc.data.name, message)
}

export function initDialogue() {
    actionHandler.onNpc("man_a", talkToMan)
    actionHandler.onNpc("man_b", talkToMan)
    actionHandler.onNpc("man_c", talkToMan)
}