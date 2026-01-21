import { NextFunction, Request, Response,  } from "express";
import { HTTPError } from "../errors/http/HTTPError";
import { HTTPErrorFactory } from "../factories/HTTPErrorFactory";

const logError = (err:Error, req:Request, res:Response, next:NextFunction):void=>{
  console.log("ahi ahi",err);
  next(err);
}

export const httpErrorHandler = async (err:HTTPError, req:Request, res:Response, next:NextFunction) => {
  res.status(err.statusCode).json(err.getError());
}

export const catchAllRoutes = async (req:Request, res:Response, next:NextFunction) => {
  next(HTTPErrorFactory.getError("ROUTE_NOT_FOUND"));
}

export const genericErrorHandler = async (err:Error, req:Request, res:Response, next:NextFunction) => {
  console.log(err);
  res.status(404).json({statusCode: 404, name: err.name, message: err.message});
}

