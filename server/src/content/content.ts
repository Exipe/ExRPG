
import { actionHandler, craftingHandler, itemDataHandler, objDataHandler, shopHandler, weatherHandler } from "../world"
import { Woodcutting } from "./gathering"
import { Dialogue } from "../player/window/dialogue"
import { randomChance, randomInt } from "../util/util"
import { initFood } from "./food"
import { initDrops } from "./drops"
import { cyan, green, red, yellow } from "../util/color"
import { initMining } from "./mining"
import { initDialogue } from "./dialogue"

export function initContent() {
    initFood()
    initDrops()
    initMining()
    initDialogue()

    actionHandler.onObject("ladder_dungeon", (player) => {
        player.goTo('main', 78, 7)
    })

    actionHandler.onObject("door_skeleton_boss", (player) => {
        if(!player.inventory.hasItem('key_dungeon')) {
            player.colorMessage("You need a key to unlock this door", red)
            return
        }

        const dialoge = new Dialogue("Warning", [
            "You are about to enter Ikkedoden's chamber.",
            [red.toString(), "Players below level 30 are adviced to stay away."]
        ])
        dialoge.addOption("Enter chamber", () => {
            if(player.inventory.remove('key_dungeon', 1) == 0) {
                player.goTo('skeleton_boss_chamber', 4, 9)
            }

            return null
        })
        dialoge.addOption("Never mind", () => {
            return null
        })
        player.window = dialoge
    })

    actionHandler.onObject("door_open", (player, _action, ox, oy) => {
        player.map.addTempObj("door_closed", ox, oy)
    })

    actionHandler.onObject("door_closed", (player, _action, ox, oy) => {
        player.map.addTempObj("door_open", ox, oy)
    })

    actionHandler.onObject("anvil", player => {
        player.window = craftingHandler.get("Anvil")
    })

    actionHandler.onObject("furnace", player => {
        player.window = craftingHandler.get("Furnace")
    })

    actionHandler.onObject("fountain", player => {
        const ch = player.combatHandler
        ch.heal(ch.maxHealth-ch.health)
        player.colorMessage("You drink from the fountain and feel rejuvenated", green)
    })

    actionHandler.onObject("car", (player, action) => {
        if(action == "drive") {
            player.sendMessage("Car racing - coming soon™!")
        }
    })

    actionHandler.onObject("crate_small", (player, action) => {
        if(action != "search" || !player.inTimeLimit(60_000)) {
            return
        }

        if(randomChance(2)) {
            player.sendMessage("You find an apple.")
            player.inventory.add("apple", 1)
        } else {
            player.sendMessage("You find some coins.")
            player.inventory.add("coins", randomInt(1, 3))
        }
    })

    const treeCommon = objDataHandler.get("tree_common")
    actionHandler.onObject(treeCommon.id, (player, action, ox, oy) => {
        if(action == "chop_down") {
            new Woodcutting(player, treeCommon, ox, oy).start()
        }
    })

    const appleTree = objDataHandler.get("tree_apple")
    actionHandler.onObject(appleTree.id, (player, action, ox, oy) => {
        switch(action) {
            case "pick_from":
                player.map.addTempObj(treeCommon.id, ox, oy, 10_000)
                player.colorMessage("You pick an apple", green)
                player.inventory.add('apple', 1)
                break
            case "chop_down":
                new Woodcutting(player, appleTree, ox, oy).start()
                break
        }
    })

    actionHandler.onObject('bush_strawberry', (player, _, ox, oy) => {
        player.map.addTempObj('bush', ox, oy, 10_000)
        player.colorMessage("You pick a strawberry", green)
        player.inventory.add('strawberry', 1)
    })

    actionHandler.onNpc("t_t_c", (player, npc, action) => {
        if(action != "talk-to") {
            return
        }

        const dialogue = new Dialogue(npc.data.name, [
            `Hello, ${player.name}.`, "What can I help you with?"
        ])

        dialogue.addOption("Let's trade", () => {
            player.window = shopHandler.get("Tony's Tools for Aspiring Adventurers")
            return null
        })

        dialogue.addOption("Never mind", () => null)

        player.window = dialogue
    })

    actionHandler.onNpc("carl_armor", (player, npc, action) => {
        const shop = shopHandler.get("Carl's Armor")
        
        const dialoge = new Dialogue(npc.data.name, [
            "Greetings adventurer.",
            "Would you like to see my selection of armor?"
        ])

        dialoge.addOption("Yes please", () => {
            player.window = shop
            return null
        })

        dialoge.addOption("I'm fine", () => null)

        switch(action) {
            case "trade":
                player.window = shop
                break
            case "talk-to":
                player.window = dialoge
                break
        }
    })

    actionHandler.onNpc("cat_white", (player, npc, action) => {
        if(action != "pet") {
            return
        }

        const dialogue = randomChance(50) ? 
            new Dialogue("猫", [ "にゃー。" ]) :
            new Dialogue(npc.data.name, [ "Meow." ])
        player.window = dialogue
    })
}
