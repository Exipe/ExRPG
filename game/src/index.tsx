
import ReactDOM = require('react-dom')
import React = require('react')
import { Main } from './main'
import { Menu } from './menu'
import './ui/format-text'

export type StateId = "menu" | "main"

function App(_: any) {
    const [state, setState] = React.useState("menu" as StateId)

    let displayState = <></>
    if(state == "main") {
        displayState = <Main />
    } else if(state == "menu") {
        displayState = <Menu setState={ state => setState(state) } />
    }

    return displayState
}

window.onload = () => {
    ReactDOM.render(<App />, document.querySelector("#container"))
}