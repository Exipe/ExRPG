
import { CharacterType } from "../character/character"
import { EquipSlot } from "../item/equipment"
import { AttribId } from "../player/attrib"

export interface Packet {
    id: string,
    data: any
}

export class BrightnessPacket implements Packet {
    public readonly id = "BRIGHTNESS"
    public readonly data: any

    constructor(brightness: number) {
        this.data = brightness
    }
}

export class ConnectResponse implements Packet {
    public readonly id = "CONNECT_RESPONSE"
    public readonly data: any

    constructor(accepted: boolean, message = undefined as string) {
        this.data = {
            accepted: accepted
        }

        this.data.message = message
    }
}

export class WelcomePacket implements Packet {
    public readonly id = "WELCOME"
    public readonly data: any

    constructor(id: number, name: string) {
        this.data = {
            id: id,
            name: name
        }
    }
}

export class LoadMapPacket implements Packet {
    public readonly id = "LOAD_MAP"
    public readonly data: any

    constructor(mapId: string) {
        this.data = mapId
    }
}

export interface OutgoingPlayer {
    id: number,
    name: string,
    rank: string,
    x: number,
    y: number,
    equipment: string[]
}

export class AddPlayerPacket implements Packet {
    public readonly id = "ADD_PLAYER"
    public readonly data: any

    constructor(players: OutgoingPlayer[]) {
        this.data = players
    }
}

export class RemovePlayerPacket implements Packet {
    public readonly id = "REMOVE_PLAYER"
    public readonly data: any

    constructor(id: number) {
        this.data = id
    }
}

export class MovePlayerPacket implements Packet {
    public readonly id = "MOVE_PLAYER"
    public readonly data: any

    constructor(id: number, x: number, y: number, animationSpeed = -1) {
        const animate = animationSpeed > 0

        this.data = {
            id: id,
            x: x,
            y: y,
            animate: animate,
            animationSpeed: animate ? animationSpeed: undefined
        }
    }
}

export class UpdatePlayerAppearancePacket implements Packet {
    public readonly id = "PLAYER_APPEARANCE"
    public readonly data: any

    constructor(id: number, equipment: string[]) {
        this.data = {
            id: id,
            equipment: equipment
        }
    }
}

export class AddNpcPacket implements Packet {
    public readonly id = "ADD_NPC"
    public readonly data: any

    constructor(npcs: [number, string, number, number][]) {
        this.data = npcs
    }
}

export class RemoveNpcPacket implements Packet {
    public readonly id = "REMOVE_NPC"
    public readonly data: any

    constructor(id: number) {
        this.data = id
    }
}

export class MoveNpcPacket implements Packet {
    public readonly id = "MOVE_NPC"
    public readonly data: any

    constructor(id: number, x: number, y: number, animationSpeed = -1) {
        const animate = animationSpeed > 0

        this.data = {
            id: id,
            x: x,
            y: y,
            animate: animate,
            animationSpeed: animate ? animationSpeed: undefined
        }
    }
}

export class AddGroundItemPacket implements Packet {
    public readonly id = "ADD_GROUND_ITEM"
    public readonly data: any

    constructor(items: [number, string, number, number][]) {
        this.data = items
    }
}

export class RemoveGroundItemPacket implements Packet {
    public readonly id = "REMOVE_GROUND_ITEM"
    public readonly data: any

    constructor(id: number) {
        this.data = id
    }
}

export class MessagePacket implements Packet {
    public readonly id = "MESSAGE"
    public readonly data: any

    constructor(message: string[]) {
        this.data = message
    }
}

export type OutgoingItem = [string, number]

export class UpdateInventoryPacket implements Packet {
    public readonly id = "INVENTORY"
    public readonly data: any

    constructor(items: OutgoingItem[]) {
        this.data = items
    }
}

export class UpdateEquipmentPacket implements Packet {
    public readonly id = "EQUIPMENT"
    public readonly data: [EquipSlot, string][]

    constructor(equipment: [EquipSlot, string][]) {
        this.data = equipment
    }
}

export class SwingItemPacket implements Packet {
    public readonly id = "SWING_ITEM"
    public readonly data: any

    constructor(itemId: string, character: CharacterType, characterId: number, offX: number, offY: number, duration: number) {
        this.data = {
            itemId: itemId,
            character: character,
            characterId: characterId,
            offX: offX,
            offY: offY,
            duration: duration
        }
    }
}

export type HitSplatType = "hit" | "miss" | "heal"

export class HitSplatPacket implements Packet {
    public readonly id = "HIT_SPLAT"
    public readonly data: any

    constructor(character: CharacterType, characterId: number, type: HitSplatType, damage: number) {
        this.data = {
            character: character,
            characterId: characterId,
            type: type,
            damage: damage
        }
    }
}

export class HealthPacket implements Packet {
    public readonly id = "HEALTH"
    public readonly data: any

    constructor(health: number, totalHealth: number) {
        this.data = {
            health: health,
            totalHealth: totalHealth
        }
    }
}

export class HealthBarPacket implements Packet {
    public readonly id = "HEALTH_BAR"
    public readonly data: any

    constructor(character: CharacterType, characterId: number, ratio: number) {
        this.data = {
            character: character,
            characterId: characterId,
            ratio: ratio
        }
    }
}

export class SetObjectPacket implements Packet {
    public readonly id = "SET_OBJECT"
    public readonly data: any

    constructor(objects: [string, number, number][]) {
        this.data = objects
    }
}

export class DialoguePacket implements Packet {
    public readonly id = "DIALOGUE"
    public readonly data: any

    constructor(id: number, name: string[], lines: string[][], options: string[]) {
        this.data = {
            id: id,
            name: name,
            lines: lines,
            options: options
        }
    }
}

export class CloseWindowPacket implements Packet {
    public readonly id = "CLOSE_WINDOW"
    public readonly data: any
}

export class UpdateAttribPacket implements Packet {
    public readonly id = "ATTRIB"
    public readonly data: any

    constructor(points: number, attribs: [AttribId, number, number][]) {
        this.data = {
            points: points,
            attribs: attribs
        }
    }
}

export class UpdateLevelPacket implements Packet {
    public readonly id = "LEVEL"
    public readonly data: any

    constructor(level: number, experience: number, requiredExperience: number) {
        this.data = {
            level: level,
            experience: experience,
            requiredExperience: requiredExperience
        }
    }
}

export class ShopPacket implements Packet {
    public readonly id = "SHOP"
    public readonly data: any

    constructor(name: string, items: string[]) {
        this.data = {
            name: name,
            items: items
        }
    }
}

export class SelectBuyPacket implements Packet {
    public readonly id = "SELECT_BUY"
    public readonly data: any

    constructor(slot: number, item: string, currency: string, price: number) {
        this.data = {
            slot: slot,
            item: item,
            currency: currency,
            price: price
        }
    }
}

export class SelectSellPacket implements Packet {
    public readonly id = "SELECT_SELL"
    public readonly data: any

    constructor(slot: number, item: string, currency: string, value: number) {
        this.data = {
            slot: slot,
            item: item,
            currency: currency,
            value: value
        }
    }
}

export interface OutgoingRecipe {
    item: string,
    unlocked: boolean,
    materials: OutgoingItem[]
}

export class CraftingPacket implements Packet {
    public readonly id = "CRAFTING"
    public readonly data: any

    constructor(name: string, recipes: OutgoingRecipe[]) {
        this.data = {
            name: name,
            recipes: recipes
        }
    }
}
