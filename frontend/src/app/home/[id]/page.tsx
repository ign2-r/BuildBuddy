import {HomePage} from "./clientComponent";

// TODO: move chat call here

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