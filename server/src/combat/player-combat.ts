
import { HealthPacket, HitSplatType, MessagePacket } from "../connection/outgoing-packet";
import { maxDamage, maxHealth, speedBonus } from "../util/formula";
import { Player, SPAWN_POINT } from "../player/player";
import { playerHandler } from "../world";
import { CombatHandler } from "./combat";
import { red } from "../util/color";

export class PlayerCombatHandler extends CombatHandler {

    private readonly player: Player

    constructor(player: Player) {
        super(player, maxHealth(1), 1, maxDamage(1))
        this.player = player
        player.attributes.onChange('speed_attack', value => this.attackSpeed = speedBonus(value))
        player.attributes.onChange('damage', value => this.maxDamage = maxDamage(value))
    }

    public get accuracy(): number {
        return this.player.attributes.get("accuracy")
    }

    public get defence(): number {
        return this.player.attributes.get("defence")
    }

    protected get heldItem(): string {
        return this.player.equipment.idOf("sword")
    }

    protected retaliate() {
        //todo: auto retaliate?
    }

    protected die(killer: Player) {
        this.player.stop()

        if(killer != null) {
            const msg = `${this.player.name} was killed by ${killer.name}!`
            playerHandler.globalMessage(msg)
        }

        this.player.colorMessage("Goodness gracious! You die", red)
        this.health = this.maxHealth
        this.player.goTo(...SPAWN_POINT)
    }

    public updateHealth() {
        this.player.send(new HealthPacket(this.health, this.maxHealth))
    }

    public setMaxHealth(maxHealth: number, update = true) {
        this.maxHealth = maxHealth

        if(update) {
            this.updateHealth()
        }
    }

    public setHealth(health: number, update = true) {
        this.health = health

        if(update) {
            this.updateHealth()
        }
    }

    public heal(value: number) {
        super.heal(value)
        this.updateHealth()
    }

    public damage(value: number, type: HitSplatType) {
        super.damage(value, type)
        this.updateHealth()
    }
    
}