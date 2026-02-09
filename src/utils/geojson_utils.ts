import { Polygon } from "geojson";
import * as turf from "@turf/turf";

export const transformPolygonToArray = (route: Polygon): number[][] => {
        const bbox = turf.bbox(route);
        const pointBBoxArray:number[][] = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
        return pointBBoxArray;
}

export const transformArrayToPolygon = (route: number[][]): Polygon => {
        const routeFlat: number[] = [route[0][0], route[0][1], route[1][0], route[1][1]]
        return turf.bboxPolygon(routeFlat as [number, number, number, number]).geometry
}