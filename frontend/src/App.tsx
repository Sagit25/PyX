
import { useMemo } from "react"
import { PyXClient } from "./pyx_client"

export default function App() {
  const client: PyXClient = useMemo(() => new PyXClient(), [])
  const root = client.useRoot();
  return root;
}
