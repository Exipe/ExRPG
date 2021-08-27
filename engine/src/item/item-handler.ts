import { ItemData, ItemOption } from "./item-data";
import { EquipmentData, EquipmentSprite, EquipmentSpriteSheet } from "./equipment-data";

function getEquipSprite(resPath: string, map: Map<string, EquipmentSpriteSheet>, key: string) {
    let sprite = map.get(key)

    if(sprite == null) {
        sprite = new EquipmentSpriteSheet(resPath + "/equip/" + key + ".png")
        map.set(key, sprite)
    }

    return sprite
}

export async function initItems(resPath: string) {
    const itemMap = new Map<string, ItemData>()
    const equipSpriteMap = new Map<string, EquipmentSpriteSheet>()

    const data = await fetch(resPath + "/data/item.json").then(text => text.json())
    data.forEach((itemData: any) => {
        const id = itemData.id
        const name = itemData.name
        const sprite = itemData.sprite ? itemData.sprite : "null"

        if(itemMap.has(id)) {
            throw "IMPORTANT - duplicate item ID: " + id
        }

        const options: ItemOption[] = itemData.options ? itemData.options.map((option: string) => [
            option, option.toLowerCase().replace(" ", "_")]) : []

        let equip = null as EquipmentData

        if(itemData.equip != null && itemData.equip.sprite != null) {
            const equipData = itemData.equip
            let spriteData = equipData.sprite

            if(typeof spriteData == "string") {
                spriteData = [spriteData, 0]
            }

            let sprite = getEquipSprite(resPath, equipSpriteMap, spriteData[0])
            equip = new EquipmentData(new EquipmentSprite(sprite, spriteData[1]), equipData.slot)
        } else if(itemData.equip != null) {
            equip = new EquipmentData(null, itemData.equip.slot)
        }

        itemMap.set(id, new ItemData(id, name, resPath + "/item/" + sprite + ".png", equip, options))
    })

    return new ItemHandler(itemMap, equipSpriteMap, resPath)
}

export class ItemHandler {

    private readonly resPath: string
    private readonly equipSpriteMap: Map<string, EquipmentSpriteSheet>
    private readonly itemMap: Map<string, ItemData>
    private readonly itemList: string[]

    constructor(itemMap: Map<string, ItemData>, 
                equipSpriteMap: Map<string, EquipmentSpriteSheet>, 
                resPath: string) 
    {
        this.itemMap = itemMap
        this.itemList = [ ...itemMap.keys() ]
        this.resPath = resPath
        this.equipSpriteMap = equipSpriteMap
    }

    public search(prefix: string) {
        return this.itemList.filter(item => item.startsWith(prefix))
    }

    public get(id: string) {
        return this.itemMap.get(id)
    }

    public getEquipSprite(sprite: string) {
        return getEquipSprite(this.resPath, this.equipSpriteMap, sprite)
    }

}
