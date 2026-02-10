import { AppErrorName } from "../../../enum/AppErrorName";
import { HTTPErrorMsgStructure } from "./HTTPErrorMsgStructure";

export interface HTTPAppErrorMsgMap
{
    messageMap: Record<AppErrorName, HTTPErrorMsgStructure>;
}




