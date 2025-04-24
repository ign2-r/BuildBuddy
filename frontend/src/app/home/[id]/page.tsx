import {HomePage} from "./clientComponent";

export default async function HomeServerside({
    params,
  }: {
    params: Promise<{ id: string }>
  }){
    const {id} = await params;
    return (
        <>
            <HomePage chatId={id}/>
        </>
    )
}