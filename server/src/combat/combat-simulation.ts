import { Character } from "../character/character";
import { Player } from "../player/player";
import { Dialogue } from "../player/window/dialogue";
import { calculateDamage } from "../util/formula";
import { CombatHandler } from "./combat";

const ITERATIONS = 1000

export class CombatSimulation {

    private readonly self: Player
    private readonly otherCh: CombatHandler
    private readonly opponentName: string

    constructor(self: Player, otherCh: CombatHandler, opponentName: string) {
        this.self = self
        this.otherCh = otherCh
        this.opponentName = opponentName
    }

    public simulate() {
        const selfCh = this.self.combatHandler
        const otherCh = this.otherCh

        let selfSum = 0
        let otherSum = 0

        for(let i = 0; i < 1000; i++) {
            let [_s, selfDamage] = calculateDamage(selfCh.maxDamage, selfCh.accuracy, otherCh.defence)
            let [_o, otherDamage] = calculateDamage(otherCh.maxDamage, otherCh.accuracy, selfCh.defence)
            selfSum += selfDamage
            otherSum += otherDamage
        }

        const selfDps = (1000 / selfCh.attackDelay) * (selfSum / ITERATIONS)
        const otherDps = (1000 / otherCh.attackDelay) * (otherSum / ITERATIONS)

        const selfDur = otherCh.maxHealth / selfDps
        const otherDur = selfCh.maxHealth / otherDps

        let winner: string
        let winnerHealth: number
        let winnerHealthTotal: number

        if(selfDur <= otherDur) {
            winner = this.self.name
            winnerHealth = selfCh.maxHealth - otherDps * selfDur
            winnerHealthTotal = selfCh.maxHealth
        } else {
            winner = this.opponentName
            winnerHealth = otherCh.maxHealth - selfDps * otherDur
            winnerHealthTotal = otherCh.maxHealth
        }

        this.self.window = new Dialogue(`~ ${this.self.name} vs. ${this.opponentName} ~`, [
            `${this.self.name} DPS: ${selfDps.toFixed(2)}`,
            `${this.opponentName} DPS: ${otherDps.toFixed(2)}`,
            `Duration: ${Math.min(selfDur, otherDur).toFixed(2)}S`,
            `Winner: ${winner}`,
            `${winner} health: ${winnerHealth.toFixed(2)} / ${winnerHealthTotal}`
        ])
    }

}