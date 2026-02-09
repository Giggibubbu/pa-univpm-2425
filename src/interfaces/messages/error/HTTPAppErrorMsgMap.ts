import { AppErrorName } from "../../../enum/AppErrorName.js";
import { HTTPErrorMsgStructure } from "./HTTPErrorMsgStructure.js";

export interface HTTPAppErrorMsgMap
{
    messageMap: Record<AppErrorName, HTTPErrorMsgStructure>;
}




