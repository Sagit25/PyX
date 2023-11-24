
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
        else if (typeof pyxElement.tag === 'object' && '__renderable__' in pyxElement.tag) {
            if (typeof pyxElement.tag.__renderable__ !== 'string') {
                console.error('PyXElement tag.id should be a string. Got:', pyxElement.tag.id);
                return null;
            }
            return createElement(Renderable, {'id': pyxElement.tag.__renderable__, 'client': client});
        }
        else {
            console.error('Unknown PyX node type. PyXElement type should be strings(HTML tags) or numbers(PyXIDs).');
        }
    }
    else {
        console.error('Unknown PyX node type. PyXFragments and PyXPortals are not implemented yet.\n', pyxElement);
    }
    return null;
}
