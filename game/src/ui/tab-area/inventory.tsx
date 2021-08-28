
import { useState, useEffect, useRef } from "react";
import React = require("react");
import { MenuEntry } from "../../game/model/context-menu-model";
import { Inventory, InventoryModel, Item } from "../../game/model/inventory-model";

export interface HeldItem {
    mouseX: number,
    mouseY: number,
    item: Item,
    slot: number
}

export function HeldItemPointer(props: { item: HeldItem }) {
    const item = props.item
    const pointerRef = useRef(null as HTMLDivElement)

    React.useEffect(() => {
        const mouseMove = (ev: MouseEvent) => {
            const style = pointerRef.current.style

            style.left = `${ev.clientX}px`
            style.top = `${ev.clientY}px`
        }

        document.addEventListener("mousemove", mouseMove)
        return () => {
            document.removeEventListener("mousemove", mouseMove)
        }
    }, [])

    return <div className="scaleIcon" id="heldItem"
        ref={pointerRef}
        style={ {
            backgroundImage: `url('${ item.item[0].spritePath }')`,
            left: item.mouseX,
            top: item.mouseY
        } } />
}

interface InventoryProps {
    takeItem: (item: HeldItem) => void
    heldItem: HeldItem,
    showCtxMenu: (entries: MenuEntry[], x: number, y: number) => void,
    inventory: InventoryModel
}

export function InventoryTab(props: InventoryProps) {
    const inventory = props.inventory
    const observable = inventory.observable
    const [items, setItems] = useState(observable.value.items)

    const heldItem = props.heldItem

    useEffect(() => {
        const observer = (inventory: Inventory) => {
            const items = inventory.items
            if(heldItem != null && items[heldItem.slot] != heldItem.item) {
                props.takeItem(null)
            }

            setItems(items)
        }

        observable.register(observer)

        return () => observable.unregister(observer)
    }, [])

    function contextItem(idx: number, mouseX: number, mouseY: number) {
        props.takeItem(null)

        const item = items[idx]
        if(item == null) {
            return
        }

        let ctxMenu = [] as MenuEntry[]

        const data = item[0]
        const name = `/rgb(155,255,255,${data.name})`

        if(data.equipable) {
            ctxMenu.push([
                "Equip " + name, 
                () => { inventory.useItem("equip", data.id, idx) }
            ])
        }

        data.options.forEach(option => {
            ctxMenu.push([
                `${option[0]} ${name}`, 
                () => { inventory.useItem(option[1], data.id, idx) }
            ])
        })

        ctxMenu.push([
            "Drop " + name, 
            () => { inventory.useItem("drop", data.id, idx) }
        ])

        props.showCtxMenu(ctxMenu, mouseX, mouseY)
    }

    function shiftClickItem(idx: number) {
        const item = items[idx][0]
        if(item.equipable) {
            inventory.useItem("equip", item.id, idx)
        }
    }

    function clickItem(idx: number, mouseX: number, mouseY: number) {
        const oldItem = items[idx]

        if(heldItem != null) {
            if(heldItem.slot == idx) {
                props.takeItem(null)
                return
            }

            inventory.moveItem(heldItem.slot, idx)

            const copyItems = [...items]
            copyItems[heldItem.slot] = oldItem
            copyItems[idx] = heldItem.item
            setItems(copyItems)
        }

        if(oldItem == null) {
            props.takeItem(null)
            return
        }

        props.takeItem({
            mouseX: mouseX,
            mouseY: mouseY,
            item: oldItem,
            slot: heldItem != null ? heldItem.slot : idx
        })
    }

    const displayItems = items.map((item, idx) => {
        if(heldItem != null && heldItem.slot == idx) {
            item = null
        }

        let style = {} as React.CSSProperties
        if(item != null) {
            style.backgroundImage = `url('${ item[0].spritePath }')`
        }

        let onClick = (e: React.MouseEvent) => {
            if(e.shiftKey) {
                shiftClickItem(idx)
            } else {
                clickItem(idx, e.clientX, e.clientY) 
            }
        }
        let onContextMenu = (e: React.MouseEvent) => { 
            e.preventDefault()
            contextItem(idx, e.clientX, e.clientY) 
        }

        return <div key={idx} style={style} onClick={onClick} onContextMenu={onContextMenu}>
            {item != null && item[1] > 1 &&
                <div className="itemAmount">{item[1]}</div>}
        </div>
    })

    return <div className="itemContainer box-standard" id="inventory">
        {displayItems}
    </div>
}