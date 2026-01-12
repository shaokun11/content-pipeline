export function maxNumber(ids: string[]) {
  let max = BigInt(0);

  for (const row of ids) {
    const id = BigInt(row);
    if (id > max) {
      max = id;
    }
  }

  return max.toString();
}

export function isNumberStr(str:any) {
    if (typeof str !=="string") {
        return false
    }
    try {
        BigInt(str)
        return true;
    } catch (error) {
        return false
    }
}