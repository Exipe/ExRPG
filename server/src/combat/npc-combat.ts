import { Character } from "../character/character";
import { Npc } from "../npc/npc";
import { Player } from "../player/player";
import { actionHandler } from "../world";
import { CombatHandler } from "./combat";

export class NpcCombatHandler extends CombatHandler {

    private readonly npc: Npc

    private readonly xp: number

    public readonly accuracy: number

    public readonly defence: number

    protected readonly heldItem: string

    constructor(npc: Npc, data = npc.data.combatData) {
        super(npc, data.health, data.attackSpeed, data.maxHit)
        this.npc = npc
        this.xp = data.experience
        this.accuracy = data.accuracy
        this.defence = data.defence
        this.heldItem = data.weapon
    }

    protected retaliate(other: Character) {
        const self = this.npc

        if(self.target != null) {
            return
        }

        self.stop()
        self.attack(other)
    }

    protected die(killer: Player) {
        this.npc.remove()

        if(killer != null) {
            killer.level.addExperience(this.xp)
            actionHandler.npcDeath(killer, this.npc)
        }

        this.health = this.maxHealth

        setTimeout(() => {
            this.npc.spawn()
        }, this.npc.data.combatData.respawnTime * 1000)
    }

}