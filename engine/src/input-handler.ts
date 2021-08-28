
import { Camera } from "./camera";
import { TILE_SIZE, Scene, Item } from ".";
import { ObjectEntity } from "./object/object-entity";
import { NpcEntity } from "./npc/npc-entity";

export class InputHandler {

    private _scene: Scene

    public set scene(scene: Scene) {
        this._scene = scene
    }

    public mouseX: number
    public mouseY: number

    private camera: Camera

    public onMouseDrag: (dx: number, dy: number, altKey: boolean) => any
    public onTileHover: (x: number, y: number) => any

    public onTileClick: (x: number, y: number, altKey: boolean) => any
    public onItemClick: (item: Item) => any
    public onObjectClick: (object: ObjectEntity) => any
    public onNpcClick: (npc: NpcEntity) => any

    public onItemContext: (item: Item) => any
    public onObjectContext: (object: ObjectEntity) => any
    public onNpcContext: (npc: NpcEntity) => any
    public onTileContext: (x: number, y: number) => any
    public onContext: (clientX: number, clientY: number) => any

    public clickOnDrag = false

    private mouseDrag: {
        altKey: boolean,
        lastX: number,
        lastY: number
    }

    constructor(canvas: HTMLCanvasElement, camera: Camera) {
        this.camera = camera

        canvas.oncontextmenu = e => this.context(e)
        canvas.onmousedown = e => this.mouseDown(e)
        document.onmousemove = e => this.mouseMove(e)
        canvas.onmouseleave = canvas.onmouseup = () => this.mouseUp()
    }

    private context(e: MouseEvent) {
        e.preventDefault()

        if(this._scene != null) {
            const [x, y] = this.camera.translateClick(e.clientX, e.clientY)
            this._scene.contextMenu(this, x, y)
        }

        if(this.onContext != null) {
            this.onContext(e.clientX, e.clientY)
        }
    }

    private registerClick() {
        const mouse = this.mouseDrag
        const [x, y] = this.camera.translateClick(mouse.lastX, mouse.lastY)

        if(this._scene != null) {
            this._scene.click(this, x, y, mouse.altKey)
        }
    }

    private mouseDown(e: MouseEvent) {
        if(e.button != 0) {
            return
        }

        this.mouseDrag = {
            altKey: e.altKey,
            lastX: e.clientX,
            lastY: e.clientY
        }

        this.registerClick()
    }

    private handleMouseDrag(x: number, y: number) {
        if(!this.mouseDrag) return

        const dx = (x - this.mouseDrag.lastX) / this.camera.scale
        const dy = (y - this.mouseDrag.lastY) / this.camera.scale

        if(this.onMouseDrag) this.onMouseDrag(dx, dy, this.mouseDrag.altKey)

        this.mouseDrag.lastX = x
        this.mouseDrag.lastY = y

        if(this.clickOnDrag) {
            this.registerClick()
        }
    }

    private mouseMove(e: MouseEvent) {
        this.handleMouseDrag(e.clientX, e.clientY)

        this.mouseX = e.clientX
        this.mouseY = e.clientY
        const [x, y] = this.camera.translateClick(e.clientX, e.clientY)
        if(this.onTileHover) {
            this.onTileHover(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE))
        }
    }

    private mouseUp() {
        delete this.mouseDrag
    }

}