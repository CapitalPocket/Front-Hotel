export const formatInvoice = (text: string) => {
    return `${text?.split(' ')[0]?.slice(0,3)}_${text?.split(' ')[2]?.slice(1,4)}`
}