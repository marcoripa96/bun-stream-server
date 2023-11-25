export function getRandomElement<T>(arr: T[]) {
    if (arr.length === 0) {
        return null; // or undefined, or throw an error, depending on your needs
    }
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

export function isStringBoolean(str: string) {
    return str === "true" || str === "false";
}
