import { Character } from "../character/character";
import { Player } from "../player/player";
import { Dialogue } from "../player/window/dialogue";
import { cyan, yellow } from "../util/color";
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

        const clr = yellow
        const title = [cyan.toString(), `~ ${this.self.name} vs. ${this.opponentName} ~`]
        const dpsL1 = [`${this.self.name} DPS: ${clr}`, selfDps.toFixed(2)]
        const dpsL2 = [`${this.opponentName} DPS: ${clr}`, otherDps.toFixed(2)]
        const durL = [`Duration: ${clr}`, Math.min(selfDur, otherDur).toFixed(2)]
        const winnerL = [`Winner: ${clr}`, winner]
        const healthL = [`${winner} health: ${clr}`, `${winnerHealth.toFixed(2)} / ${winnerHealthTotal}`]

        this.self.window = new Dialogue(title, [
            dpsL1, dpsL2, durL, winnerL, healthL
        ])
    }

}