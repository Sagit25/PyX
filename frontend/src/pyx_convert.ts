
import { ReactNode, createElement } from "react";
import { PyXNode } from "./pyx_types.ts";
import { Renderable } from "./Renderable.tsx";
import { PyXClient } from "./pyx_client.ts";

export function convert(pyxElement: PyXNode, client: PyXClient): ReactNode {
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
        if (typeof pyxElement.tag === 'string') {
            return createElement(
                pyxElement.tag,
                pyxElement.props,
                ...pyxElement.children.map((element) => convert(element, client))
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
    else {
        console.error('Unknown PyX node type. PyXFragments and PyXPortals are not implemented yet.\n', pyxElement);
    }
    return null;
}
