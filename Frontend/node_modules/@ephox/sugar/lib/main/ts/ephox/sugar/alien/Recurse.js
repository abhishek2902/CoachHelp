/**
 * Applies f repeatedly until it completes (by returning Optional.none()).
 *
 * Normally would just use recursion, but JavaScript lacks tail call optimisation.
 *
 * This is what recursion looks like when manually unravelled :)
 */
const toArray = (target, f) => {
    const r = [];
    const recurse = (e) => {
        r.push(e);
        return f(e);
    };
    let cur = f(target);
    do {
        cur = cur.bind(recurse);
    } while (cur.isSome());
    return r;
};
export { toArray };
//# sourceMappingURL=Recurse.js.map