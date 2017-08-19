export function cmp(object1, object2, properties) {
    let same = true;

    for (let property of properties) {
        if (object1[property] !== object2[property]) {
            same = false;
            break;
        }
    }

    return same;
}
