
import React = require("react");
import { ItemData } from "exrpg";
import { AttribId, AttributeModel, Attributes, ATTRIBUTES } from "../../game/model/attrib-model";
import { EquipmentModel } from "../../game/model/equipment-model";

export interface EquipmentProps {
    equipment: EquipmentModel,
    attributes: AttributeModel
}

interface EquipmentSlotProps {
    slot: string,
    item: ItemData,
    unequip: (id: string) => void
}

function EquipmentSlot(props: EquipmentSlotProps) {
    const item = props.item

    let style = {} as React.CSSProperties
    let onClick: () => void

    if(item != null) {
        style.backgroundImage = `url('${ item.spritePath }')`
        onClick = () => { props.unequip(item.id) }
    } else {
        style.backgroundImage = `url('ui/equip/${ props.slot }.png')`
        onClick = () => {}
    }

    return <div className="scaleIcon"
        style={style}
        onClick={onClick}
    />
}

interface PointSpendProps {
    equipment: EquipmentModel
    attributes: Attributes,
    onClose: () => void
}

function PointSpendContainer(props: PointSpendProps) {
    const [points, setPoints] = React.useState(props.attributes.points)
    const [attribValues, setAttribValues] = React.useState(ATTRIBUTES.map(attribType => {
        const attrib = props.attributes.get(attribType[0])
        
        return {
            name: attribType[1],
            title: attribType[2],
            value: attrib.value,
            points: 0
        }
    }))

    function confirm() {
        props.equipment.spendPoints(attribValues.map((attrib, idx) => {
            return [ATTRIBUTES[idx][0], attrib.points]
        }))
        props.onClose()
    }

    function plus(idx: number) {
        if(points <= 0) {
            return
        }

        setPoints(points-1)
        setAttribValues(attribValues.map((attrib, idx2) => {
            if(idx != idx2) {
                return attrib
            }

            return {
                ...attrib,
                points: attrib.points + 1,
                value: attrib.value + 1
            }
        }))
    }

    function minus(idx: number) {
        if(attribValues[idx].points <= 0) {
            return
        }

        setPoints(points+1)
        setAttribValues(attribValues.map((attrib, idx2) => {
            if(idx != idx2) {
                return attrib
            }

            return {
                ...attrib,
                points: attrib.points - 1,
                value: attrib.value - 1
            }
        }))
    }

    return <div id="pointSpendContainer" className="box-standard">
        <div id="pointSpendHeader">
            <div>Remaining points: {points}</div>
            <div onClick={props.onClose} className="closeButton" />
        </div>

        <div id="pointSpendAttribs">
            { attribValues.map((attrib, idx) =>
                <React.Fragment key={attrib.name}>
                    <div className="pointSpendAttrib">{attrib.name}: {attrib.value}</div> 
                    <div onClick={() => plus(idx)} className="uiButton">+</div> 
                    <div onClick={() => minus(idx)} className="uiButton">-</div>
                </React.Fragment>
            )}

            <div onClick={() => confirm()} id="pointSpendConfirm" className="uiButton">Confirm</div>
        </div>
    </div>
}

export function Equipment(props: EquipmentProps) {
    const [equippedItems, setEquippedItems] = React.useState(props.equipment.equippedItems)
    const [attributes, setAttributes] = React.useState(props.attributes.attributes)
    const [showSpendPoints, setShowSpendPoints] = React.useState(false)

    React.useEffect(() => {
        props.equipment.onEquipmentUpdate = equippedItems => {
            setEquippedItems(equippedItems)
        }

        return () => {
            props.equipment.onEquipmentUpdate = null
        }
    }, [])

    React.useEffect(() => {
        props.attributes.onAttributeUpdate = attributes => {
            setAttributes(attributes)
        }

        return () => {
            props.attributes.onAttributeUpdate = null
        }
    }, [])

    const unequip = (id: string, slot: string) => props.equipment.unequipItem(id, slot)

    const attribValues = ATTRIBUTES.map(attribType => {
        const attrib = attributes.get(attribType[0])

        let suffix = ""
        if(attrib.armor > 0) {
            suffix = " (+" + attrib.armor + ")"
        } else if(attrib.armor < 0) {
            suffix = " (" + attrib.armor + ")"
        }

        let title = attribType[2]
        if(attribType[0] == "speed_move") {
            const percentage = (attributes.walkSpeed * 100).toFixed(2)
            title += ` (${percentage}%)`
        }

        return {
            name: attribType[1],
            className: attrib.armor >= 0 ? "positiveBonus" : "negativeBonus",
            title: title,
            value: (attrib.total) + suffix
        }
    })

    const createSlot = (slot: string) => (
        <EquipmentSlot slot={slot} item={equippedItems.get(slot)} unequip={ id => unequip(id, slot) } />
    )

    return <>
    <div id="equipment" className="box-standard">
        <div id="equipmentGrid">
            <div /> 
            {createSlot("helm")}
            <div />

            {createSlot("sword")}
            {createSlot("plate")}
            {createSlot("shield")}

            <div /> 
            {createSlot("legs")}
            <div />
        </div>

        <div id="equipmentAttribs">
            <ul id="attribs">
                { attribValues.map(attrib =>
                    <li key={attrib.name} title={attrib.title}>
                        {attrib.name}: <span className={attrib.className}>{attrib.value}</span>
                    </li>
                )}
            </ul>

            <div onClick={() => setShowSpendPoints(true)} id="openPointSpend" className="uiButton">Spend points ({attributes.points})</div>
        </div>
    </div>

    {showSpendPoints && 
        <PointSpendContainer equipment={props.equipment} onClose={() => setShowSpendPoints(false)} attributes={attributes} />
    }
    </>
}