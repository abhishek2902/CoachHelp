import { SugarElement } from '../node/SugarElement';
import * as Attribute from '../properties/Attribute';
import * as Traverse from '../search/Traverse';
import * as Insert from './Insert';
import * as InsertAll from './InsertAll';
import * as Remove from './Remove';
const clone = (original, isDeep) => SugarElement.fromDom(original.dom.cloneNode(isDeep));
/** Shallow clone - just the tag, no children */
const shallow = (original) => clone(original, false);
/** Deep clone - everything copied including children */
const deep = (original) => clone(original, true);
/** Shallow clone, with a new tag */
const shallowAs = (original, tag) => {
    const nu = SugarElement.fromTag(tag);
    const attributes = Attribute.clone(original);
    Attribute.setAll(nu, attributes);
    return nu;
};
/** Deep clone, with a new tag */
const copy = (original, tag) => {
    const nu = shallowAs(original, tag);
    // NOTE
    // previously this used serialisation:
    // nu.dom.innerHTML = original.dom.innerHTML;
    //
    // Clone should be equivalent (and faster), but if TD <-> TH toggle breaks, put it back.
    const cloneChildren = Traverse.children(deep(original));
    InsertAll.append(nu, cloneChildren);
    return nu;
};
/** Change the tag name, but keep all children */
const mutate = (original, tag) => {
    const nu = shallowAs(original, tag);
    Insert.after(original, nu);
    const children = Traverse.children(original);
    InsertAll.append(nu, children);
    Remove.remove(original);
    return nu;
};
export { shallow, shallowAs, deep, copy, mutate };
//# sourceMappingURL=Replication.js.map