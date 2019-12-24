export function random(min: number, max: number) {
    if (min > max) {
        const temp = min;
        min = max;
        max = temp;
    }

    return Math.floor(Math.random() * (max - min + 1) + min);
}