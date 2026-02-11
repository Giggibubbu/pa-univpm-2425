import { Polygon } from "geojson";
import * as turf from "@turf/turf";
import { DateCompareConst } from "../enum/DateCompareConst";

/**
 * Converte un poligono GeoJSON in un array di coordinate del bounding box.
 * @param route - Poligono GeoJSON da convertire
 * @returns Array di due punti [[minLon, minLat], [maxLon, maxLat]] che rappresentano il bounding box
 */
export const transformPolygonToArray = (route: Polygon): number[][] => {
        const bbox = turf.bbox(route);
        const pointBBoxArray:number[][] = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
        return pointBBoxArray;
}

/**
 * Converte un array di coordinate in un poligono GeoJSON.
 * @param route - Array di due punti [[minLon, minLat], [maxLon, maxLat]] che definiscono il bounding box
 * @returns Poligono GeoJSON corrispondente al bounding box
 */
export const transformArrayToPolygon = (route: number[][]): Polygon => {
        const routeFlat: number[] = [route[0][0], route[0][1], route[1][0], route[1][1]]
        return turf.bboxPolygon(routeFlat as [number, number, number, number]).geometry
}

/**
 * Esegue un confronto profondo tra due array di numeri tramite serializzazione JSON.
 * * @param a - Primo array da confrontare.
 * @param b - Secondo array da confrontare.
 * @returns True se i due array sono identici per contenuto e ordine.
 */

export const equals = (a: number[], b: number[]):boolean => {
    return JSON.stringify(a) === JSON.stringify(b)
}


/**
 * Valida se i valori forniti rientrano nei range geografici di Longitudine e Latitudine.
 * * @param a - Valore della longitudine (range: -180 a 180).
 * @param b - Valore della latitudine (range: -90 a 90).
 * @returns True se entrambi i parametri sono coordinate valide.
 */

export const isLatLon = (a: number, b: number):boolean => {
    return (a >= -180 && a <= 180) && (b >= -90 && b <= 90);
}