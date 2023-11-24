
type PyXNode = PyXChild | PyXFragment | PyXPortal | boolean | null | undefined;

type PyXChild = PyXElement | PyXText;

type PyXElement = {
    tag: string | {'__type__': 'Renderable', 'id': PyXID};
    props: any;
    children: PyXNode[];
};

type Key = string | number | null;

type PyXID = string;

type PyXText = string | number;

type PyXFragment = {} | PyXNodeArray;

type PyXNodeArray = Array<PyXNode>;

type PyXPortal = {
    key: Key | null;
    children: PyXNode;
};

export type { PyXNode, PyXChild, PyXElement, PyXText, PyXFragment, PyXNodeArray, PyXPortal, PyXID, Key };