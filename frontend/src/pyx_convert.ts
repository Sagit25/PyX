
import { createElement } from "react";
import { Renderable } from "./Renderable.tsx";
import { PyXClient } from "./pyx_client.ts";

export function convert(pyxElement: any, client: PyXClient): any {
    if (typeof pyxElement === 'boolean') {
        return null;
    }
    else if (typeof pyxElement === 'number') {
        return pyxElement.toString();
    }
    else if (typeof pyxElement === 'string') {
        return pyxElement;
    }
    else if (Array.isArray(pyxElement)) {
        return pyxElement.map((element) => convert(element, client));
    }
    else if (pyxElement === null) {
        return null;
    }
    else if (typeof pyxElement === 'object' && 'tag' in pyxElement) {
        if (!('props' in pyxElement)) pyxElement.props = {};
        if (!('children' in pyxElement)) pyxElement.children = [];
        const convertedProps: any = {};
        for (const key in pyxElement.props) {
            convertedProps[key] = convert(pyxElement.props[key], client);
        }
        if (typeof pyxElement.tag === 'string') {
            return createElement(
                pyxElement.tag,
                convertedProps,
                ...pyxElement.children.map((element: any) => convert(element, client))
            );
        }
    }
    else if (typeof pyxElement === 'object' && '__renderable__' in pyxElement) {
        if (typeof pyxElement.__renderable__ !== 'string') {
            console.error('PyX ID should be a string.\n', pyxElement);
            return null;
        }
        return createElement(Renderable, {'id': pyxElement.__renderable__, 'client': client});
    }
    else if (typeof pyxElement === 'object' && '__callable__' in pyxElement) {  // Event handler
        if (typeof pyxElement.__callable__ !== 'string') {
            console.error('PyX ID should be a string.\n', pyxElement);
            return null;
        }
        const callableID = pyxElement.__callable__;
        return (e: any) => {
            client.socket.emit('event_handler', {'id': callableID, 'e': client.addJSObject(e)});
        }
    }
    else {
        console.error('Unknown PyX node type. PyXFragments and PyXPortals are not implemented yet.\n', pyxElement);
    }
    return null;
}
