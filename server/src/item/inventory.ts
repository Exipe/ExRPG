
import { Player } from "../player/player";
import { ItemData } from "./item-data";
import { itemDataHandler } from "../world";
import { SelectBuyPacket, UpdateInventoryPacket } from "../connection/outgoing-packet";
import { Item } from "./item";

export const INVENTORY_SIZE = 30

export class Inventory {

    private readonly player: Player

    private readonly items: Item[]

    constructor(player: Player) {
        this.player = player

        this.items = []
        for(let i = 0; i < INVENTORY_SIZE; i++) {
            this.items.push(null)
        }
    }

    public empty(update = true) {
        for(let i = 0; i < INVENTORY_SIZE; i++) {
            this.items[i] = null
        }

        if(update) {
            this.update()
        }
    }

    public hasItem(itemId: string) {
        return this.items.find(i => i != null && i.id == itemId) != null
    }

    public hasSpace() {
        for(let i = 0; i < INVENTORY_SIZE; i++) {
            if(this.items[i] == null) {
                return true
            }
        }

        return false
    }

    private update() {
        const itemIds = this.items.map(item => (
            item != null ? ([item.id, item.amount] as [string, number]) : null
        ))
        this.player.send(new UpdateInventoryPacket(itemIds))
    }

    private checkRange(slot: number) {
        if(slot < 0 || slot >= INVENTORY_SIZE) {
            throw `Slot must be in range of 0-${INVENTORY_SIZE}` 
        }
    }

    public set(slot: number, item: Item, update = true) {
        this.checkRange(slot)
        this.items[slot] = item

        if(update) {
            this.update()
        }
    }

    public get(slot: number) {
        this.checkRange(slot)

        return this.items[slot]
    }

    public emptySlot(slot: number, update = true) {
        this.checkRange(slot)
        
        const item = this.items[slot]
        this.items[slot] = null
        
        if(update) {
            this.update()
        }

        return item
    }

    public swap(fromSlot: number, toSlot: number, update = true) {
        this.checkRange(fromSlot)
        this.checkRange(toSlot)

        const temp = this.items[fromSlot]
        this.items[fromSlot] = this.items[toSlot]
        this.items[toSlot] = temp

        if(update) {
            this.update()
        }
    }

    public count(id: string) {
        return this.items.reduce((previous, current) => (
            previous + (current != null && current.id == id ? current.amount : 0)), 0)
    }

    public add(id: string, amount: number, update = true) {
        const itemData = itemDataHandler.get(id)
        if(itemData == null) {
            throw `Invalid item ID: ${id}`
        }

        this.addData(itemData, amount, update)
    }

    public addData(itemData: ItemData, amount: number, update = true) {
        if(amount <= 0) {
            throw "Can't add a negative number of items"
        }

        if(itemData.stack > 1) {
            amount = this.addPhaseA(itemData, amount)
        }

        amount = this.addPhaseB(itemData, amount)

        if(update) {
            this.update()
        }
        return amount
    }

    /*
    In phase A we search for existing stacks of the item, and add to those
    Returns the amount that didn't fit into existing stacks
    - This phase can be skipped for non-stackable items -
    */
    private addPhaseA(itemData: ItemData, amount: number) {
        for(let i = 0; i < INVENTORY_SIZE; i++) {
            if(amount <= 0) {
                return 0
            }

            const stack = this.items[i]
            if(stack == null || stack.id != itemData.id) {
                continue
            }

            amount = stack.add(amount)
        }

        return amount
    }

    /*
    In phase B we search for empty slots and add the item there
    Returns the amount that did not fit
    */
    private addPhaseB(itemData: ItemData, amount: number) {
        for(let i = 0; i < INVENTORY_SIZE; i++) {
            if(amount <= 0) {
                return 0
            }

            if(this.items[i] != null) {
                continue
            }

            const item = new Item(itemData, Math.min(amount, itemData.stack))
            amount -= item.amount
            this.items[i] = item
        }

        return amount
    }

    public remove(id: string, amount: number, update = true) {
        const itemData = itemDataHandler.get(id)
        if(itemData == null) {
            throw `Invalid item ID: ${id}`
        }

        return this.removeData(itemData, amount, update)
    }

    public removeData(itemData: ItemData, amount: number, update = true) {
        if(amount <= 0) {
            throw "Can't remove a negative number of items"
        }

        amount = this.removePhaseA(itemData, amount)
        if(amount > 0 && itemData.stack > 1) {
            amount = this.removePhaseB(itemData, amount)
        }

        if(update) {
            this.update()
        }
        return amount
    }

    /*
    In phase A we search for stacks that can be exhausted
    Ie. stack.amount <= amount
    Returns the amount that could not be removed by exhausting stacks
    */
    private removePhaseA(itemData: ItemData, amount: number) {
        for(let i = 0; i < INVENTORY_SIZE; i++) {
            if(amount <= 0) {
                return 0
            }

            const stack = this.items[i]
            if(stack != null && stack.id == itemData.id && stack.amount <= amount) {
                amount -= stack.amount
                this.items[i] = null
            }
        }

        return amount
    }

    /*
    In phase B we look for any stack of the item and remove as much as possible from that
    If any stack remains from phase A that must mean stack.amount > amount
    Returns the amount that could not be removed
    - This phase can be skipped for non-stackable items -
    */
    private removePhaseB(itemData: ItemData, amount: number) {
        for(let i = 0; i < INVENTORY_SIZE; i++) {
            const stack = this.items[i]
            if(stack == null || stack.id != itemData.id) {
                continue
            }

            stack.remove(amount)
            return 0
        }

        return amount
    }

}