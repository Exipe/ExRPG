
import { CombatSimulation } from "../combat/combat-simulation";
import { NpcCombatHandler } from "../combat/npc-combat";
import { ShopPacket } from "../connection/outgoing-packet";
import { ATTRIBUTES, isAttribId } from "../player/attrib";
import { Player } from "../player/player";
import { formatStrings } from "../util/util";
import { playerHandler, itemDataHandler, commandHandler, weatherHandler, sceneHandler, npcDataHandler } from "../world";
import { CommandCallback } from "./command-handler";

function onMeTo(player: Player, args: string[]) {
    if(args.length == 0) {
        player.colorMessage("Correct usage: '/meto player_name'")
        return
    }

    const other = playerHandler.getName(args[0])
    if(other == null) {
        player.colorMessage(`Could not find player: ${args[0]}`)
        return
    }

    player.goToMap(other.map, other.x, other.y)
}

function onToMe(player: Player, args: string[]) {
    if(args.length == 0) {
        player.colorMessage("Correct usage: '/tome player_name'")
        return
    }

    const other = playerHandler.getName(args[0])
    if(other == null) {
        player.colorMessage(`Could not find player: ${args[0]}`)
        return
    }

    other.goToMap(player.map, player.x, player.y)
}

function onItem(player: Player, args: string[]) {
    if(args.length == 0) {
        player.colorMessage("Correct usage: '/item [player_name] item_id [amount]'")
        return
    }

    let toPlayer = player
    let itemArg = args[0]
    let amountArg = "1"

    if(args.length == 2) {
        amountArg = args[1]
    } else if(args.length > 2) {
        toPlayer = playerHandler.getName(args[0])
        if(toPlayer == null) {
            player.colorMessage(`Could not find player: ${args[0]}`)
            return
        }

        itemArg = args[1]
        amountArg = args[2]
    }

    const item = itemDataHandler.get(itemArg)
    if(item == null) {
        player.colorMessage(`Could not find item: ${itemArg}`)
        return
    }

    const amount = parseInt(amountArg, 10)
    if(isNaN(amount)) {
        player.colorMessage(`Amount '${amountArg}' is not a valid integer`)
        return
    }

    if(toPlayer != player) {
        player.colorMessage(`Gave ${toPlayer.name} ${amount}x ${item.name}`)
        toPlayer.colorMessage(`${player.name} gives you ${amount}x ${item.name}`)
    } else {
        player.colorMessage(`Added ${amount}x ${item.name}`)
    }

    toPlayer.inventory.addData(item, amount)
}

function onEmpty(player: Player, _: any) {
    player.inventory.empty()
    player.colorMessage("Emptied inventory")
}

function onPos(player: Player, _: string[]) {
    player.colorMessage(`Current pos: (${player.x}, ${player.y}) @ ${player.map.id}`)
}

function onSet(player: Player, args: string[]) {
    if(args.length < 2) {
        player.colorMessage("Correct usage: /set attrib_id value")
        player.colorMessage(`attrib_ids: ${formatStrings(ATTRIBUTES, "[", ", ", "]")}`)
        return
    }

    const attribId = args[0]
    const value = parseInt(args[1])

    if(!isAttribId(attribId)) {
        player.colorMessage(`attrib_id '${attribId}' is invalid`)
        player.colorMessage(`attrib_ids: ${formatStrings(ATTRIBUTES, "[", ", ", "]")}`)
        return
    }

    if(isNaN(value)) {
        player.colorMessage(`value '${value}' is not a valid integer`)
        return
    }

    player.attributes.setBase(attribId, value)
    player.colorMessage(`Set ${attribId} to ${value}`)
}

function onBrightness(player: Player, args: string[]) {
    let brightness: number

    if(args.length < 1 || isNaN(brightness = parseFloat(args[0]))) {
        player.colorMessage("Correct usage: /brightness value")
        return
    }

    player.colorMessage(`Brightness set to ${brightness}`)
    weatherHandler.brightness = brightness

    weatherHandler.enableClock = false
}

function onClock(player: Player, _: any) {
    weatherHandler.enableClock = !weatherHandler.enableClock
    player.colorMessage(`Weather clock ${weatherHandler.enableClock ? "enabled" : "disabled"}`)
}

function onTele(player: Player, args: string[]) {
    let xarg: any
    let yarg: any

    let map = player.map

    if(args.length == 2) {
        xarg = args[0]
        yarg = args[1]
    } else if(args.length == 3) {
        map = sceneHandler.get(args[0])
        if(map == null) {
            player.colorMessage(`map_id ${args[0]} does not exist`)
            return
        }

        xarg = args[1]
        yarg = args[2]
    } else {
        player.colorMessage("Correct usage: /tele [map_id] x y")
        return
    }

    const x = parseInt(xarg)
    const y = parseInt(yarg)

    let isNumber = !(isNaN(x) || isNaN(y))
    let isInRange = isNumber && x >= 0 && y >= 0 && x < map.width && y < map.height

    if(!isInRange) {
        player.colorMessage(`Invalid coords (${xarg}, ${yarg})`)
        return
    }

    player.goToMap(map, x, y)
}

function onPsim(player: Player, args: string[]) {
    if(args.length == 0) {
        player.colorMessage("Correct usage: /psim player_name")
        return
    }

    const other = playerHandler.getName(args[0])
    if(other == null) {
        player.colorMessage(`Could not find player: ${args[0]}`)
        return
    }

    const simulation = new CombatSimulation(player, other.combatHandler, other.name)
    simulation.simulate()
}

function onMsim(player: Player, args: string[]) {
    if(args.length == 0) {
        player.colorMessage("Correct usage: /msim monster_id")
        return
    }

    const npc = npcDataHandler.get(args[0])
    if(npc == null) {
        player.colorMessage(`Invalid monster_id (${args[0]})`)
        return
    }

    if(npc.combatData == null) {
        player.colorMessage(`Monster (${args[0]}) is not attackable`)
        return
    }

    const combatHandler = new NpcCombatHandler(null, npc.combatData)
    const simulation = new CombatSimulation(player, combatHandler, npc.name)
    simulation.simulate()
}

function onLevel(player: Player, args: string[]) {
    if(args.length == 0) {
        player.colorMessage("Correct usage: /level target_level")
        return
    }

    const targetArg = args[0]
    const target = parseInt(targetArg)

    if(isNaN(target) || target <= 0) {
        player.colorMessage(`${targetArg} is not a valid level`)
        return
    }

    player.level.setLevel(target)
}

export function initCommands() {
    const ch = commandHandler
    const playerCommand = (command: string, callback: CommandCallback) => {
        ch.on(command, callback, 0)
    }
    const devCommand = (command: string, callback: CommandCallback) => {
        ch.on(command, callback, 1)
    }

    playerCommand("players", p => {
        p.colorMessage(`There are ${playerHandler.count} players online`)
    })

    playerCommand("msim", onMsim)
    playerCommand("psim", onPsim)

    devCommand("item", onItem)
    devCommand("empty", onEmpty)
    devCommand("pos", onPos)
    devCommand("set", onSet)
    devCommand("meto", onMeTo)
    devCommand("tome", onToMe)
    devCommand("brightness", onBrightness)
    devCommand("clock", onClock)
    devCommand("tele", onTele)
    devCommand("level", onLevel)
}