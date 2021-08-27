
import { ObjectData } from "../object/object-data"
import { Player } from "../player/player"
import { actionHandler, itemDataHandler, objDataHandler } from "../world"
import { Gathering } from "./gathering"

interface OreData {
    item: string,
    successChance: number,
    respawnTimer: number
}

export class Mining extends Gathering {

    private readonly item: string

    constructor(player: Player, objData: ObjectData, objX: number, objY: number, ore: OreData) {
        super(player, objData, objX, objY, 
            "pickaxe_crude", "ore_depleted", 625, 300, ore.respawnTimer, ore.successChance)
        this.item = ore.item
    }

    protected onLackTool() {
        this.player.sendMessage("You need a pickaxe to mine this ore.")
    }

    protected onSuccess() {
        this.player.inventory.add(this.item, 1)
    }

}

function addOre(objectId: string, oreData: OreData) {
    const ore = objDataHandler.get(objectId)
    if(ore == null) {
        throw `[Invalid mining data] unknown object: ${objectId}`
    }

    if(!itemDataHandler.get(oreData.item)) {
        throw `[Invalid mining data] unknown item: ${oreData.item}`
    }

    actionHandler.onObject(objectId, (player, action, ox, oy) => {
        if(action == "mine") {
            new Mining(player, ore, ox, oy, oreData).start()
        }
    })
}

export function initMining() {
    addOre('ore_copper', {
        "item": "ore_copper",
        "respawnTimer": 30_000,
        "successChance": 10
    })

    addOre('ore_iron', {
        "item": "ore_iron",
        "respawnTimer": 120_000,
        "successChance": 20
    })
}