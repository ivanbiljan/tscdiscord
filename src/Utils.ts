import * as fs from "fs";
import * as path from "path";

/**
 * Returns a random value between the specified boundaries.
 * @param min The lower boundary.
 * @param max The upper boundary.
 */
export function random(min: number, max: number): number {
    if (min > max) {
        const temp = min;
        min = max;
        max = temp;
    }

    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Checks whether the provided string is null or consists purely of whitespace characters.
 * @param str The string to check for.
 */
export function isStringNullOrWhitespace(str: string): boolean {
    return !str || !/\S/.test(str);
}

/**
 * Traverses the specified directory and returns an array of file paths within that directory, optionally traversing all subdirectories.
 * @param directory The parent directory.
 * @param traverseChildren A value indicating whether the traversal is done recursively, i.e whether subdirectories should be included in the search.
 * @param excludeFromSearch An enumerable list of directory names to exclude from traversal.
 */
export function traverseDirectory(directory: string, traverseChildren: boolean = true, ...excludeFromSearch: string[]): string[] {
    let results: string[] = [];
    const files = fs.readdirSync(directory);
    for (let file of files) {
        if (file.startsWith('.') || excludeFromSearch.includes(file)) {
            continue;
        }

        file = path.resolve(directory, file);
        const stat = fs.statSync(file);
        if (traverseChildren && stat && stat.isDirectory()) {
            results = results.concat(traverseDirectory(file, traverseChildren));
        } else {
            results.push(file);
        }
    }

    return results;
}