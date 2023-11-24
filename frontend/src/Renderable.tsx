import { ReactNode } from "react";
import { PyXID } from "./pyx_types";
import { PyXClient } from "./pyx_client";
import { convert } from "./pyx_convert";

export function Renderable({id, client}: {id: PyXID, client: PyXClient}): ReactNode {
    const renderable = client.useRenderable(id);
    return convert(renderable, client);
}
