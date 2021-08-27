
import { Scene } from "../scene/scene"
import { Walking } from "./walking"
import { sceneHandler } from "../world"
import { TaskHandler } from "./task-handler"
import { Combat } from "../combat/combat-task"
import { SwingItemPacket } from "../connection/outgoing-packet"
import { CombatHandler } from "../combat/combat"
import { MapId } from "../scene/map-id"

export type CharacterType = "player" | "npc"

const WALK_DELAY = 250

export abstract class Character {

    public lastPrimaryExecution = -1

    public readonly taskHandler = new TaskHandler()
    protected readonly walking = new Walking(this)

    private followers = [] as Character[]
    protected following = null as Character

    public readonly type: CharacterType

    public readonly id: number

    /*
    The last tile the character moved away from
    (or their current position, after a placement)
    Useful to get behind the character
    */
    private lastX = 0
    private lastY = 0

    private _x = 0
    private _y = 0

    private _map: Scene

    private _walkSpeed: number
    private _walkDelay: number

    public combatHandler = null as CombatHandler

    constructor(type: CharacterType, id: number, walkSpeed = 1) {
        this.type = type
        this.id = id
        this.walkSpeed = walkSpeed
    }

    public get followDebug() {
        return this.followers.includes(this.following) && !this.following.walking.still
    }

    public swingItem(itemId: string, offX: number, offY: number, duration: number): void {
        this.map.broadcast(
            new SwingItemPacket(itemId, this.type, this.id, offX, offY, duration))
    }

    public get attackable() {
        return this.combatHandler != null
    }

    public get target() {
        return this.following
    }

    public get walkSpeed() {
        return this._walkSpeed
    }

    public set walkSpeed(value: number) {
        this._walkSpeed = value
        this._walkDelay = Math.trunc(WALK_DELAY / value)
    }

    public get walkDelay() {
        return this._walkDelay
    }

    /**
     * If we are following another character slower than us, and have caught up with them, return their walk delay
     */
    public get predictWalkDelay() {
        if(this.walking.still && this.following != null && this.following._walkDelay > this._walkDelay) {
            return this.following._walkDelay
        }

        return this._walkDelay
    }

    public reaches(other: Character) {
        const distX = Math.abs(other.x - this.x)
        const distY = Math.abs(other.y - this.y)

        return this.map == other.map && distX <= 1 && distY <= 1
    }

    public get still() {
        return this.following == null && this.walking.still
    }

    private addFollower(character: Character) {
        this.followers.push(character)
    }

    private removeFollower(character: Character) {
        this.followers = this.followers.filter(c => c != character)
    }

    private getBehind(other: Character, x = this.walking.goalX, y = this.walking.goalY) {
        const diffX = other.x - x
        const diffY = other.y - y
        const distX = Math.abs(diffX)
        const distY = Math.abs(diffY)

        /*
        stop if u already reach the other character
        how ever, to prevent the follower from getting trapped behind walls,
        make sure you can walk to the target's position
        */
        if((distX == 0 && distY == 0) || distX > 1 || distY > 1 || !this.walkable(x, y, diffX, diffY)) {
            this.walking.followStep(other.lastX, other.lastY)
        }
    }

    public follow(character: Character) {
        if(this.following != null) {
            this.unfollow()
        }

        this.following = character
        character.addFollower(this)

        this.getBehind(character)
    }

    public attack(character: Character) {
        this.follow(character)
        this.walking.persistentGoal = () => {
            this.taskHandler.setTask(new Combat(this))
        }
    }

    public unfollow() {
        if(this.following == null) {
            return
        }

        this.following.removeFollower(this)
        this.following = null
    }

    public get x() {
        return this._x
    }

    public get y() {
        return this._y
    }

    public get map() {
        return this._map
    }

    public goToMap(map: Scene, x: number, y: number) {
        this.stop()

        for(let f of this.followers) {
            f.stop()
        }

        if(this._map != map) {
            if(this._map != null) {
                this.leaveMap()
            }

            this._x = x
            this._y = y
            this.lastX = x
            this.lastY = y

            this._map = map
            this.enterMap()
        } else {
            this.move(x, y)
        }
    }

    public goTo(mapId: MapId, x: number, y: number) {
        const map = sceneHandler.get(mapId)
        this.goToMap(map, x, y)
    }

    protected abstract enterMap(): void
    protected abstract leaveMap(): void

    public walk(x: number, y: number) {
        this.move(x, y, true)
    }

    public tileWalkable(x: number, y: number) {
        return !this._map.isBlocked(x, y)
    }

    public walkable(x: number, y: number, diffX: number, diffY: number) {
        return this.tileWalkable(x+diffX, y+diffY) && 
            (diffX == 0 || this.tileWalkable(x+diffX, y)) && 
            (diffY == 0 || this.tileWalkable(x, y+diffY))
    }

    public stop() {
        this.unfollow()
        this.walking.clear()
        this.taskHandler.stopTask()
    }

    public addSteps(goalX: number, goalY: number) {
        return this.walking.addSteps(goalX, goalY)
    }

    protected abstract onMove(animate: boolean): void

    public move(x: number, y: number, animate = false) {
        this.lastX = this._x
        this.lastY = this._y
        this._x = x
        this._y = y

        this.followers.forEach(f => {
            f.getBehind(this, f.x, f.y)
        })

        this.onMove(animate)
    }

    public remove() {
        if(this._map != null) {
            this.leaveMap()
            this._map = null
        }

        for(let f of this.followers) {
            f.unfollow()
        }

        this.stop()
    }

}