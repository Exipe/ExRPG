
import { Character } from "../character/character";
import { NpcData } from "./npc-data";
import { MoveNpcPacket } from "../connection/outgoing-packet";
import { MapId } from "../scene/map-id";
import { randomChance, randomOffset } from "../util/util";
import { NpcCombatHandler } from "../combat/npc-combat";
import { ReadOnlyMap } from "../util/readonly-map";

export class NpcHandler {

    private idCount = 0
    private npcMap = new Map<number, Npc>()

    private readonly npcDataHandler: ReadOnlyMap<string, NpcData>

    constructor(npcDataHandler: ReadOnlyMap<string, NpcData>) {
        this.npcDataHandler = npcDataHandler
    }

    public get(id: number) {
        return this.npcMap.get(id)
    }

    public spawnAll() {
        this.npcMap.forEach(npc => npc.spawn())
    }

    public tick() {
        this.npcMap.forEach(npc => npc.tick())
    }

    public create(dataId: string, map: MapId, x: number, y: number) {
        const data = this.npcDataHandler.get(dataId)
        if(data == null) {
            return null
        }

        const id = this.idCount++
        const npc = new Npc(id, data, map, x, y)
        this.npcMap.set(id, npc)
        return npc
    }

}

export class Npc extends Character {

    public readonly id: number
    public readonly data: NpcData

    public readonly mapId: MapId
    private readonly spawnX: number
    private readonly spawnY: number

    constructor(id: number, data: NpcData, map: MapId, x: number, y: number) {
        super("npc", id, data.walkSpeed)
        this.mapId = map
        this.spawnX = x
        this.spawnY = y
        this.id = id
        this.data = data

        if(this.data.combatData != null) {
            this.combatHandler = new NpcCombatHandler(this)
        }
    }

    public get alive() {
        return this.map != null
    }

    public tileWalkable(x: number, y: number) {
        return !this.map.isNpcBlocked(x, y)
    }

    public spawn() {
        this.goTo(this.mapId, this.spawnX, this.spawnY)
    }

    public tick() {
        if(!this.alive) {
            return
        }

        const radius = this.data.walkRadius

        if(this.target == null && this.data.id == "skeleton") {
            for(let p of this.map.players) {
                const diffX = p.x - this.x
                const diffY = p.y - this.y

                if((diffX != 0 || diffY != 0) && 
                Math.abs(diffX) <= 1 && Math.abs(diffY) <= 1 && 
                this.walkable(this.x, this.y, diffX, diffY)) {
                    this.attack(p)
                    return
                }
            }
        }

        if(!this.alive || !this.still || !randomChance(15)) {
            return
        }

        const goalX = randomOffset(this.spawnX, radius)
        const goalY = randomOffset(this.spawnY, radius)

        this.walking.clear()
        this.walking.addSteps(goalX, goalY)
    }

    protected enterMap() {
        this.map.addNpc(this)
    }

    protected leaveMap() {
        this.map.removeNpc(this)
    }
    
    protected onMove(animate: boolean) {
        this.map.broadcast(new MoveNpcPacket(this.id, this.x, this.y, animate ? this.predictWalkDelay : -1))
    }

}