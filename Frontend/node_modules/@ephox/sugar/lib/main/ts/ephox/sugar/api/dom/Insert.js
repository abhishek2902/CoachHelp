import * as Traverse from '../search/Traverse';
const before = (marker, element) => {
    const parent = Traverse.parent(marker);
    parent.each((v) => {
        v.dom.insertBefore(element.dom, marker.dom);
    });
};
const after = (marker, element) => {
    const sibling = Traverse.nextSibling(marker);
    sibling.fold(() => {
        const parent = Traverse.parent(marker);
        parent.each((v) => {
            append(v, element);
        });
    }, (v) => {
        before(v, element);
    });
};
const prepend = (parent, element) => {
    const firstChild = Traverse.firstChild(parent);
    firstChild.fold(() => {
        append(parent, element);
    }, (v) => {
        parent.dom.insertBefore(element.dom, v.dom);
    });
};
const append = (parent, element) => {
    parent.dom.appendChild(element.dom);
};
const appendAt = (parent, element, index) => {
    Traverse.child(parent, index).fold(() => {
        append(parent, element);
    }, (v) => {
        before(v, element);
    });
};
const wrap = (element, wrapper) => {
    before(element, wrapper);
    append(wrapper, element);
};
export { before, after, prepend, append, appendAt, wrap };
//# sourceMappingURL=Insert.js.map