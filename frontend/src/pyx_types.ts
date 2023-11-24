
type PyXNode = PyXChild | PyXFragment | PyXPortal | boolean | null | undefined;

type PyXChild = PyXElement | PyXText;

type PyXElement = {
    type: string | PyXID;
    props: any;
    key: Key | null;
};

type Key = string | number | null;

type PyXID = string | null;

type PyXText = string | number;

type PyXFragment = {} | PyXNodeArray;

type PyXNodeArray = Array<PyXNode>;

type PyXPortal = {
    key: Key | null;
    children: PyXNode;
};

export type { PyXNode, PyXChild, PyXElement, PyXText, PyXFragment, PyXNodeArray, PyXPortal, PyXID, Key };