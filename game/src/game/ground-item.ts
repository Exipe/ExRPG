
import { Item, Engine } from "exrpg";
import { Game } from "./game";
import { TakeItemPacket } from "../connection/packet";

export class GroundItem extends Item {

    public readonly id: number

    constructor(engine: Engine, id: number, dataId: string, tileX: number, tileY: number) {
        super(engine, engine.itemHandler.get(dataId), tileX, tileY)
        this.id = id
    }

}

export function initGroundItems(game: Game): void {
    const connection = game.connection
    const engine = game.engine

    connection.on("ADD_GROUND_ITEM", data => {
        data.forEach((i: [number, string, number, number]) => {
            const item = new GroundItem(engine, i[0], i[1], i[2], i[3])
            game.addGroundItem(item)
        })
    })

    connection.on("REMOVE_GROUND_ITEM", id => {
        game.removeGroundItem(id)
    })

    const takeItem = (item: Item) => {
        if(!(item instanceof GroundItem)) {
            return
        }

        game.walkTo(item.x, item.y)
        game.connection.send(new TakeItemPacket(item.id))
    }

    engine.inputHandler.onItemContext = item => {
        const text = `Take /rgb(155,255,255,${item.data.name})`
        game.ctxMenu.add([text, () => {
            takeItem(item)
        }])
    }

    engine.inputHandler.onItemClick = takeItem
}
