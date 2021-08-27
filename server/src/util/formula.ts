import { HitSplatType } from "../connection/outgoing-packet"
import { randomInt } from "./util"

/**
 * Used to calculate movement and attack speed multiplier
 * 
 * @param x player's attribute value
 */
export function speedBonus(x: number) {
    let result = 0.0, remainder = Math.abs(x)

    if(remainder > 25) {
        result += 0.005 * (remainder - 25)
        remainder = 25
    }

    if(remainder > 5) {
        result += 0.01 * (remainder - 5)
        remainder = 5
    }

    result += 0.02 * remainder

    return Math.max(0.05, 1 + (x >= 0 ? 1 : -1) * result)
}

const MIN_DAMAGE = 2

export function maxDamage(x: number) {
    if(x <= 0) {
        return MIN_DAMAGE
    }

    let result = MIN_DAMAGE
    if(x > 10) {
        result += 0.5 * (x - 10)
        x = 10
    }

    result += 0.75 * x

    return Math.floor(result)
}

export function highHitChance(accuracy: number, defence: number) {
    let remainder = Math.abs(accuracy - defence)
    let result = Math.min(0.5, 0.025*remainder)
    return 0.5 + (accuracy > defence ? 1 : -1) * result
}

export function calculateDamage(maxDamage: number, accuracy: number, defence: number): [HitSplatType, number] {
    const highHit = Math.random() < highHitChance(accuracy, defence)
    const lowerBound = highHit ? Math.ceil(maxDamage / 10) : 0
    const higherBound = Math.floor(highHit ? maxDamage : maxDamage / 10)

    return [highHit ? "hit" : "miss", randomInt(lowerBound, higherBound)]
}

export function experienceRequired(level: number) {
    return 100 + Math.floor(Math.pow(level, 3) / 1.5);
}

export function maxHealth(level: number) {
    return Math.floor(15+(level-1)*1.5)
}
