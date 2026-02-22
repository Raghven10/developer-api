import { getPublicModels } from "@/lib/actions"
import CreateAppClient from "./CreateAppClient"

export default async function CreateAppPage() {
    const models = await getPublicModels()
    return <CreateAppClient publicModels={models} />
}

