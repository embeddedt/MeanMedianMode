
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export function getRandomArrayMember<T>(arr: Array<T>, startIdx = 0): T {
    if(startIdx >= arr.length)
        throw new Error("Start index must be less than array length.");
    return arr[getRandomInt(startIdx, arr.length)];
}