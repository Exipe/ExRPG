
import Lexer = require('lex')
import React = require('react')

interface FormatTextProps {
    children: string | string[]
}

function lex(text: string[]) {
    const items = []
    let argCounter = 0
    const parseText = (input: string) => input.replace(/{}/g, _ => text[++argCounter])

    const lexer = new Lexer()

    lexer.addRule(/\/rgb\([^\(\)]*\)/, function(lexeme: string) {
        let text = lexeme.slice('/rgb('.length, -')'.length)
        const args = text.split(',', 3)
        text = text.substring(args.join().length+1)

        items.push({
            token: 'rgb',
            r: args[0],
            g: args[1],
            b: args[2],
            text: parseText(text)
        })
    })

    lexer.addRule(/\/sprite\([^\(\)]*\)/, function(lexeme: string) {
        let text = lexeme.slice('/sprite('.length, -')'.length)

        items.push({
            token: 'sprite',
            path: parseText(text)
        })
    }) 

    lexer.addRule(/[^/]+/, function(lexeme: string) {
        items.push({
            token: 'none',
            text: parseText(lexeme)
        })
    })

    lexer.input = text[0]
    lexer.lex()

    return items
}

(window as any).lex = lex

export function FormatText(props: FormatTextProps) {
    const text = typeof props.children == "string" ? [props.children] : props.children
    const tokens = lex(text)

    return <>{tokens.map((value, idx) => {
        switch(value.token) {
            case "rgb":
                const color = `rgb(${value.r},${value.g},${value.b})`
                return <span key={idx} style={{color:color}}>{value.text}</span>
            case "sprite":
                const path = `${value.path}.png`
                return <img key={idx} className="text-icon" src={path} />
            case "none":
                return <span key={idx}>{value.text}</span>
        }
    })}</>
}