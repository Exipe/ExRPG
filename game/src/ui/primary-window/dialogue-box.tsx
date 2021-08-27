
import { useState, useEffect } from "react";
import { Dialogue, DialogueModel } from "../../game/model/dialogue-model";
import React = require("react");
import { FormatText } from "../format-text";

interface DialogueBoxProps {
    model: DialogueModel
}

export function DialogueBox(props: DialogueBoxProps) {
    const dialogueObserver = props.model.observable
    const [dialogue, setDialogue] = useState(dialogueObserver.value as Dialogue)
    
    useEffect(() => {
        dialogueObserver.register(setDialogue)
        return () => dialogueObserver.unregister(setDialogue)
    }, [])

    const clickOption = (index: number) => {
        props.model.clickOption(dialogue.id, index)
    }

    const options = dialogue.options.map((option, idx) =>
        <p key={idx} onClick={ _ => { clickOption(idx) } }>{option}</p>)

    return <div className="window box-gradient" id="dialogueBox">
        <p id="dialogueName"><FormatText>{dialogue.name}</FormatText></p>

        {dialogue.lines.map((line, idx) => <p key={idx}><FormatText>{line}</FormatText></p>)}

        <div id="dialogueOptions">
            {options}
        </div>
    </div>
}
