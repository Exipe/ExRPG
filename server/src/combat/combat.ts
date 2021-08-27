
import { Character } from "../character/character";
import { HealthBarPacket, HitSplatPacket, HitSplatType } from "../connection/outgoing-packet";
import { calculateDamage } from "../util/formula";
import { DamageCounter } from "./damage-counter";

const ATTACK_DELAY = 2000

export abstract class CombatHandler {

    private readonly character: Character
    
    private damageCounter = new DamageCounter()

    public attackDelay: number

    public maxDamage: number

    public maxHealth: number

    public health: number

    constructor(character: Character, health: number, attackSpeed: number, maxDamage: number) {
        this.character = character
        this.maxHealth = this.health = health
        this.attackSpeed = attackSpeed
        this.maxDamage = maxDamage
    }

    public set attackSpeed(value: number) {
        this.attackDelay = Math.trunc(ATTACK_DELAY / value)
    }

    public abstract get accuracy(): number

    public abstract get defence(): number

    protected abstract get heldItem(): string

    protected abstract retaliate(other: Character): void

    protected abstract die(killer: Character): void;

    public attack(other: CombatHandler) {
        const self = this.character
        const target = other.character

        const distX = target.x - self.x
        const distY = target.y - self.y

        if((distX == 0 && distY == 0) || Math.abs(distX) > 1 || Math.abs(distY) > 1) {
            return
        }

        const [type, damage] = calculateDamage(this.maxDamage, this.accuracy, other.defence)

        const heldItem = this.heldItem
        if(heldItem != "") {
            self.swingItem(heldItem, distX, distY, this.attackDelay / 5)
        }

        other.retaliate(self)

        if(self.type == "player") {
            other.damageCounter.count(self.id, damage)
        }
        other.damage(damage, type)
    }

    public heal(value: number) {
        const self = this.character
        this.character.map.broadcast(
            new HitSplatPacket(self.type, self.id, "heal", value)
        )

        this.health = Math.min(this.health + value, this.maxHealth)
    }

    public damage(value: number, type: HitSplatType) {
        const self = this.character
        const damage = Math.min(this.health, value)

        self.map.broadcast(
            new HitSplatPacket(self.type, self.id, type, damage)
        )

        this.health -= damage
        self.map.broadcast(
            new HealthBarPacket(self.type, self.id, this.health / this.maxHealth)
        )

        if(this.health <= 0) {
            const killer = this.damageCounter.determineKiller()
            this.die(killer)
        }
    }

}