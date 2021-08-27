
import { Player } from "../player/player";
import { Scene } from "../scene/scene";
import { ObjectData } from "../object/object-data";
import { objectDirection, randomChance } from "../util/util";
import { SwingItemPacket } from "../connection/outgoing-packet";
import { PrimaryTask } from "../character/task";

export abstract class Gathering extends PrimaryTask {

    protected readonly player: Player
    private readonly map: Scene

    private readonly objData: ObjectData
    private readonly objX: number
    private readonly objY: number

    private readonly toolId: string
    private readonly depletdId: string

    public readonly delay: number

    private readonly animInterval: number
    private readonly respawnTime: number

    private readonly successChance: number

    constructor(player: Player, objData: ObjectData, objX: number, objY: number, 
        toolId: string, depletedId: string, actionInterval: number, animInterval: number, respawnTime: number,
        successChance: number) 
    {
        super(player)
        this.player = player
        this.map = player.map
        this.objData = objData
        this.objX = objX
        this.objY = objY
        this.toolId = toolId
        this.depletdId = depletedId
        this.delay = actionInterval
        this.animInterval = animInterval
        this.respawnTime = respawnTime
        this.successChance = successChance
    }

    private get reachesResource() {
        return this.map.reachesObject(this.player.x, this.player.y, this.objData, this.objX, this.objY)
    }

    private get hasTool() {
        return this.player.inventory.hasItem(this.toolId)
    }

    protected abstract onLackTool(): void

    public start() {
        if(!this.hasTool) {
            this.onLackTool()
            return
        }

        this.player.taskHandler.setTask(this)
    }

    protected abstract onSuccess(): void

    public tick() {
        if(!this.reachesResource || !this.hasTool) {
            this.player.taskHandler.stopTask(this)
            return
        }

        const [offX, offY] = objectDirection(this.objData, this.objX, this.objY, this.player.x, this.player.y)
        this.map.broadcast(new SwingItemPacket(this.toolId, "player", this.player.id, offX, offY, this.animInterval))

        if(!randomChance(this.successChance)) {
            return
        }

        this.player.taskHandler.stopTask(this)
        this.map.addTempObj(this.depletdId, this.objX, this.objY, this.respawnTime)

        this.onSuccess()
    }

}

export class Woodcutting extends Gathering {

    constructor(player: Player, objData: ObjectData, objX: number, objY: number) {
        super(player, objData, objX, objY, 
            "axe_crude", "stump_common", 750, 350, 10_000, 3)
    }

    protected onLackTool() {
        this.player.sendMessage("You need an axe to cut this tree.")
    }

    protected onSuccess(): void {
        this.player.inventory.add("log_common", 1)
    }
    
}
