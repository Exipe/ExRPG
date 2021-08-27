
import fetch from "node-fetch"
import { RES_PATH } from ".."
import { ReadOnlyMap } from "../util/readonly-map"

const DEFAULT_RESPAWN_TIME = 15
const DEFAULT_ATTACK_SPEED = 1
const DEFAULT_WALK_SPEED = 1
const DEFAULT_WALK_RADIUS = 0 // don't move

export interface NpcCombatData {
    weapon: string
    respawnTime: number
    health: number
    attackSpeed: number
    maxHit: number
    accuracy: number
    defence: number
    experience: number
}

export interface NpcData {
    id: string
    name: string
    walkRadius: number
    walkSpeed: number
    actions: string[]
    combatData: NpcCombatData
}

export async function loadNpcData() {
    const npcDataMap = new Map<string, NpcData>()
    const data = await fetch(RES_PATH + "data/npc.json")
    .then(res => res.json())

    data.forEach((npc: any) => {
        if(npcDataMap.get(npc.id) != null) {
            throw "IMPORTANT - duplicate NPC ID: " + npc.id
        }

        const actions = npc.options ? npc.options.map((action: string) =>
            action.toLowerCase().replace(" ", "_")) : []

        let combatData = null as NpcCombatData
        const cb = npc.combat

        if(cb != null) {
            combatData = {
                weapon: cb.weapon ? cb.weapon : "",
                respawnTime: cb.respawnTime ? cb.respawnTime : DEFAULT_RESPAWN_TIME,
                health: cb.health,
                attackSpeed: cb.attackSpeed ? cb.attackSpeed : DEFAULT_ATTACK_SPEED,
                maxHit: cb.maxHit,
                accuracy: cb.accuracy,
                defence: cb.defence,
                experience: cb.experience ? cb.experience : cb.health
            }
        }

        const npcData = {
            id: npc.id,
            name: npc.name,
            walkRadius: npc.walkRadius ? npc.walkRadius : DEFAULT_WALK_RADIUS,
            walkSpeed: npc.walkSpeed ? npc.walkSpeed : DEFAULT_WALK_SPEED,
            actions: actions,
            combatData: combatData
        }
        npcDataMap.set(npc.id, npcData)
    })

    return new ReadOnlyMap(npcDataMap)
}
