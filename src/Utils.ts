export function random(min: number, max: number): number {
    if (min > max) {
        const temp = min;
        min = max;
        max = temp;
    }

    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function isStringNullOrWhitespace(str: string): boolean {
    return !str || !/\S/.test(str);
}