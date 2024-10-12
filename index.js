var Random;
(function (Random) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    function str(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }
    Random.str = str;
})(Random || (Random = {}));

class Opt {
    hasValue;
    value;
    constructor() {
        this.hasValue = false;
        this.value = null;
    }
    static none() {
        return new Opt();
    }
    static some(value) {
        let toReturn = new Opt();
        toReturn.hasValue = true;
        toReturn.value = value;
        return toReturn;
    }
    static of_value_or_null(value) {
        if (value === null) {
            return Opt.none();
        }
        else {
            return Opt.some(value);
        }
    }
    is_none() {
        return this.hasValue === false;
    }
    is_some() {
        return this.is_none() === false;
    }
    unwrap() {
        return this.value;
    }
    value_or(t) {
        if (this.is_none()) {
            return t;
        }
        else {
            return this.value_unchecked();
        }
    }
    value_or_throw() {
        if (this.is_none()) {
            throw new Error();
        }
        else {
            return this.value_unchecked();
        }
    }
    value_unchecked() {
        return this.value;
    }
    do_if_some(fn) {
        if (this.is_some()) {
            fn(this.value_unchecked());
        }
    }
    async do_if_some_async(fn) {
        if (this.is_some()) {
            return await fn(this.value_unchecked());
        }
    }
    do(filledAction, emptyAction) {
        if (this.is_some()) {
            return filledAction(this.value_unchecked());
        }
        else {
            return emptyAction();
        }
    }
    async do_async(filledAction, emptyAction) {
        if (this.is_some()) {
            return await filledAction(this.value_unchecked());
        }
        else {
            return await emptyAction();
        }
    }
    transform(action) {
        if (this.is_some()) {
            return Opt.some(action(this.value_unchecked()));
        }
        else {
            return Opt.none();
        }
    }
}

class HashSet {
    innerSet;
    constructor() {
        this.innerSet = new Set();
    }
    size() { return this.innerSet.size; }
    contains(str) { return this.innerSet.has(str); }
    _add(str) {
        this.innerSet.add(str);
    }
    _remove(str) {
        this.innerSet.delete(str);
    }
    to_list() {
        let output = new List();
        this.innerSet.forEach(x => output._push(x));
        return output;
    }
}

class List {
    inner_array;
    constructor() {
        this.inner_array = [];
    }
    static of(array) {
        let toReturn = new List();
        toReturn.inner_array = array;
        return toReturn;
    }
    clone(inner_clone) {
        let ouptut = new List();
        this.for_each(item => ouptut._push(inner_clone(item)));
        return ouptut;
    }
    clear() {
        this.inner_array = [];
    }
    get_array() {
        return this.inner_array;
    }
    len() { return this.inner_array.length; }
    is_valid_index(index) {
        return 0 <= index && index <= this.len() - 1;
    }
    last_index() { return this.len() - 1; }
    get(index) {
        return this.inner_array[index];
    }
    get_last() {
        if (this.len() === 0) {
            return Opt.none();
        }
        else {
            let lastValue = this.get(this.last_index());
            return Opt.some(lastValue);
        }
    }
    get_last_many(amount, order) {
        if (this.len() < amount)
            throw new Error();
        let to_return = new List();
        switch (order) {
            case "ascending": {
                let i_start = this.len() - amount;
                let i_end = this.len() - 1;
                for (let i = i_start; i <= i_end; i++) {
                    to_return._push(this.inner_array[i]);
                }
                break;
            }
            case "descending": {
                let i_start = this.len() - 1;
                let i_end = this.len() - amount;
                for (let i = i_end; i >= i_start; i--) {
                    to_return._push(this.inner_array[i]);
                }
                break;
            }
        }
        return to_return;
    }
    set(index, item) {
        this.inner_array[index] = item;
    }
    _push(item) {
        this.inner_array.push(item);
    }
    _push_all(list) {
        list.for_each(x => this._push(x));
    }
    _remove(index) {
        this.inner_array.splice(index, 1);
    }
    _pop() {
        let popped = this.inner_array.pop();
        if (popped === undefined) {
            return Opt.none();
        }
        else {
            return Opt.some(popped);
        }
    }
    _swap(index_a, index_b) {
        let temp = this.inner_array[index_a];
        this.inner_array[index_a] = this.inner_array[index_b];
        this.inner_array[index_b] = temp;
    }
    _swap_pop(index) {
        if (0 <= index && index <= this.last_index()) {
            if (index === this.last_index()) {
                return this._pop();
            }
            else {
                let current_value = this.get(index);
                let last_item = this._pop().value_or_throw();
                this.set(index, last_item);
                return Opt.some(current_value);
            }
        }
        else {
            return Opt.none();
        }
    }
    range(start, end) {
        let output = new List();
        for (let i = start; i <= end; i++) {
            output._push(this.get(i));
        }
        return output;
    }
    _slice(start, end) {
        let array_removed = this.inner_array.splice(start, end - start + 1);
        return List.of(array_removed);
    }
    *iter() {
        for (let i = 0; i <= this.last_index(); i++) {
            yield this.inner_array[i];
        }
    }
    *enumerate() {
        for (let i = 0; i < this.len(); i++) {
            yield { index: i, value: this.get(i) };
        }
    }
    map(mapFn) {
        let new_array = this.inner_array.map((item, index) => mapFn(item, index));
        return List.of(new_array);
    }
    async map_async_all(mapFn) {
        let promises = this.inner_array.map((item, index) => mapFn(item, index));
        let results = await Promise.all(promises);
        return List.of(results);
    }
    to_hash_set(strFn) {
        let output = new HashSet();
        for (let t of this.iter()) {
            output._add(strFn(t));
        }
        return output;
    }
    filter(fn) {
        let new_inner_array = this.inner_array.filter(fn);
        return List.of(new_inner_array);
    }
    filter_map(filter, map) {
        let output = new List();
        for (let { index, value } of this.enumerate()) {
            if (filter(value, index)) {
                output._push(map(value, index));
            }
        }
        return output;
    }
    for_each(fn) {
        for (let i = 0; i <= this.last_index(); i++) {
            fn(this.get(i), i);
        }
    }
    /**
     * sorts inplace
     */
    _sort(comparison) {
        this.inner_array.sort((a, b) => comparison(a, b));
        return this;
    }
    /**
     * sorts inplace
     */
    _sort_by_str(fn) {
        this._sort((a, b) => fn(a).localeCompare(fn(b)));
        return this;
    }
    /**
     * sorts inplace
     */
    _sort_by_number(fn) {
        this._sort((a, b) => fn(a) - fn(b));
        return this;
    }
    to_hash_map(hashFn) {
        let toReturn = new HashMap();
        for (let t of this.iter()) {
            toReturn._put(hashFn(t), t);
        }
        return toReturn;
    }
    group_by(groupHashFn) {
        let to_return = new HashMap();
        for (let t of this.iter()) {
            let item_group = groupHashFn(t);
            if (to_return.contains(item_group) === false) {
                to_return._put(item_group, new List());
            }
            let to_return_array = to_return.get(item_group).value_unchecked();
            to_return_array._push(t);
        }
        return to_return;
    }
    zip(other) {
        let output = new List();
        for (let i = 0; i <= this.last_index(); i++) {
            let left = this.get(i);
            let right;
            if (i <= other.last_index()) {
                right = Opt.some(other.get(i));
            }
            else {
                right = Opt.none();
            }
            output._push({ left, right });
        }
        return output;
    }
    find_first(conditionFn) {
        for (let t of this.inner_array) {
            if (conditionFn(t)) {
                return Opt.some(t);
            }
        }
        return Opt.none();
    }
    find_first_with_index(conditionFn) {
        for (let i = 0; i <= this.last_index(); i++) {
            let t = this.inner_array[i];
            if (conditionFn(t)) {
                return Opt.some([t, i]);
            }
        }
        return Opt.none();
    }
    aggregate(g, agregation) {
        let g_aux = g;
        this.for_each(t => {
            g_aux = agregation(g, t);
        });
        return g_aux;
    }
    max(comp_fn) {
        if (this.len() === 0) {
            return Opt.none();
        }
        let t_aux = this.get(0);
        for (let i = 1; i <= this.last_index(); i++) {
            let t_next = this.get(i);
            if (comp_fn(t_aux, t_next) === 1) {
                t_aux = t_next;
            }
        }
        return Opt.some(t_aux);
    }
    max_by_number(fn) {
        return this.max((a, b) => {
            let dif = fn(a) - fn(b);
            if (dif < 0) {
                return -1;
            }
            else if (dif === 0) {
                return 0;
            }
            else {
                return 1;
            }
        });
    }
    min(comp_fn) {
        if (this.len() === 0) {
            return Opt.none();
        }
        let t_aux = this.get(0);
        for (let i = 1; i <= this.last_index(); i++) {
            let t_next = this.get(i);
            if (comp_fn(t_aux, t_next) === -1) {
                t_aux = t_next;
            }
        }
        return Opt.some(t_aux);
    }
    min_by_number(fn) {
        return this.min((a, b) => {
            let dif = fn(a) - fn(b);
            if (dif < 0) {
                return -1;
            }
            else if (dif === 0) {
                return 0;
            }
            else {
                return 1;
            }
        });
    }
}

class HashMap {
    size_;
    innerMap;
    constructor() {
        this.size_ = 0;
        this.innerMap = {};
    }
    static of(obj) {
        let toReturn = new HashMap();
        toReturn.size_ = Object.keys(obj).length;
        toReturn.innerMap = obj;
        return toReturn;
    }
    clone(clone_inner) {
        let new_hash_map = new HashMap();
        for (let key of this.keys().get_array()) {
            let value = clone_inner(this.get_unchecked(key));
            new_hash_map._put(key, value);
        }
        return new_hash_map;
    }
    size() {
        return this.size_;
    }
    get_inner_map() { return this.innerMap; }
    contains(hash) {
        return hash in this.innerMap;
    }
    get(hash) {
        if (this.contains(hash)) {
            let value = this.innerMap[hash];
            return Opt.some(value);
        }
        else {
            return Opt.none();
        }
    }
    get_unchecked(hash) {
        return this.innerMap[hash];
    }
    _put(hash, value) {
        if (this.contains(hash) === false) {
            this.size_ += 1;
        }
        this.innerMap[hash] = value;
    }
    _remove(hash) {
        if (this.contains(hash)) {
            this.size_ -= 1;
        }
        delete this.innerMap[hash];
    }
    *iter() {
        for (let key in this.innerMap) {
            yield {
                hash: key,
                value: this.innerMap[key],
            };
        }
    }
    *iter_values() {
        for (let item of this.iter()) {
            yield item.value;
        }
    }
    for_each(action) {
        for (let hash of Object.keys(this.innerMap)) {
            action(this.get_unchecked(hash), hash);
        }
    }
    entries() {
        let to_return = new List();
        for (let entry of this.iter()) {
            to_return._push(entry);
        }
        return to_return;
    }
    keys() {
        let keysArrys = Object.keys(this.innerMap);
        return List.of(keysArrys);
    }
    gen_available_random_key(key_len) {
        let newKey = Random.str(key_len);
        while (this.contains(newKey)) {
            newKey = Random.str(key_len);
        }
        return newKey;
    }
    transform(transformFn) {
        let output = new HashMap();
        for (let { hash, value } of this.entries().iter()) {
            output._put(hash, transformFn(value));
        }
        return output;
    }
}

class TreeHashMap {
    root;
    value_map;
    parent_map;
    children_map;
    constructor() {
        this.root = Opt.none();
        this.value_map = new HashMap();
        this.parent_map = new HashMap();
        this.children_map = new HashMap();
    }
    contains(key) { return this.value_map.contains(key); }
    get_value(key) { return this.value_map.get(key); }
    get_parent_key(key) {
        let parent_key_opt = this.parent_map.get(key).value_or_throw();
        if (parent_key_opt.is_some()) {
            return Opt.some(parent_key_opt.value_unchecked());
        }
        else {
            return Opt.none();
        }
    }
    get_root_hash() { return this.root; }
    _remove(key) {
        // if the key is not on the map there is no reason the remove it
        if (this.value_map.contains(key) === false) {
            return;
        }
        // if key has a parent we remove key as a children of it
        if (this.parent_map.get(key).value_unchecked().is_some()) {
            let parent_key = this.parent_map.get(key).value_unchecked().value_unchecked();
            let new_children_list = this.children_map.get(parent_key).value_unchecked().filter(x => x !== key);
            this.children_map._put(parent_key, new_children_list);
        }
        // remove every child of key
        this.children_map.get(key).value_unchecked().for_each(key => this._remove(key));
        // remove key from every map
        this.value_map._remove(key);
        this.parent_map._remove(key);
        this.children_map._remove(key);
    }
    _put(key, value, parent) {
        if (this.value_map.contains(key))
            throw new Error();
        this.value_map._put(key, value);
        this.children_map._put(key, new List());
        if (parent.is_some()) {
            let parent_key = parent.value_unchecked();
            if (this.value_map.contains(parent_key) === false)
                throw new Error();
            this.parent_map._put(key, Opt.some(parent_key));
            this.children_map.get(parent_key).value_unchecked()._push(key);
        }
        else {
            if (this.root.is_some())
                throw new Error();
            this.root = Opt.some(key);
            this.parent_map._put(key, Opt.none());
        }
    }
    list_keys() { return this.value_map.keys(); }
    list_level_ordered(order) {
        if (this.root.is_none()) {
            return new List();
        }
        else {
            return this.list_level_ordered_from(this.root.value_unchecked(), order, 0);
        }
    }
    list_level_ordered_from(key, order, lv) {
        let output = new List();
        this.list_level_ordered_from_(key, order, output, lv);
        return output;
    }
    list_children(key) {
        return this.children_map
            .get(key)
            .value_or_throw()
            .map(child_key => ({
            key: child_key,
            value: this.value_map.get(child_key).value_unchecked(),
        }));
    }
    list_children_recursive(key) {
        let output = new List();
        this.list_children_recursive_(key, output);
        return output;
    }
    list_subtree(key) {
        if (this.value_map.contains(key) === false) {
            throw new Error();
        }
        let output = new List();
        output._push({ key: key, value: this.value_map.get_unchecked(key) });
        let children_list = this.list_children_recursive(key);
        output._push_all(children_list);
        return output;
    }
    list_parents(key) {
        if (this.contains(key) === false) {
            throw new Error();
        }
        let output = new List();
        let active_key = key;
        while (true) {
            let parent_key_opt = this.parent_map.get(active_key).value_or_throw();
            if (parent_key_opt.is_none()) {
                break;
            }
            let parent_key = parent_key_opt.value_unchecked();
            output._push(parent_key);
            active_key = parent_key;
        }
        return output;
    }
    find_first_parent_such_that(key, criterion) {
        if (this.contains(key) === false) {
            throw new Error();
        }
        let parent_list = this.list_parents(key);
        if (parent_list.len() === 0) {
            return Opt.none();
        }
        else {
            for (let parent_key of parent_list.get_array()) {
                let parent_value = this.value_map.get_unchecked(parent_key);
                if (criterion(parent_key, parent_value)) {
                    return Opt.some({ display_key: parent_key, value: parent_value });
                }
            }
            return Opt.none();
        }
    }
    *iter_breadth(display_key) {
        // define the starting key
        let start_key;
        if (display_key.is_none()) {
            if (this.root.is_none()) {
                return;
            }
            else {
                start_key = this.root.value_unchecked();
            }
        }
        else {
            start_key = display_key.value_unchecked();
            if (this.contains(start_key) === false) {
                throw new Error();
            }
        }
        // iter
        let order_list = new List();
        order_list._push(start_key);
        while (order_list.len() > 0) {
            // yield current level
            for (let i = 0; i <= order_list.last_index(); i++) {
                let active_key = order_list.get(i);
                yield {
                    key: active_key,
                    value: this.value_map.get_unchecked(active_key),
                };
            }
            // populate with children
            order_list = new List();
            for (let i = 0; i <= order_list.last_index(); i++) {
                let active_key = order_list.get(i);
                this.children_map.get_unchecked(active_key).for_each(child_key => order_list._push(child_key));
            }
        }
    }
    // find_first_by_breadth(        
    //     display_key_opt: Opt<string>,
    //     criterion: (key: string, value: T) => boolean,
    // ): Opt<{key: string, value: T}> {
    //     for (let iter_item of this.iter_breadth(display_key_opt)) {
    //         if (criterion(iter_item.key, iter_item.value)) {
    //             return Opt.some(iter_item)
    //         }
    //     }
    //     return Opt.none()
    // }
    list_children_recursive_(key, output) {
        let chidren_list = this.list_children(key);
        output._push_all(chidren_list);
        chidren_list.for_each(child => this.list_children_recursive_(child.key, output));
    }
    list_level_ordered_from_(key, order, ouptut, current_lv) {
        ouptut._push({ hash: key, lv: current_lv });
        let children = this.list_children(key);
        children._sort((a, b) => order(a.value, b.value));
        children.for_each(c => this.list_level_ordered_from_(c.key, order, ouptut, current_lv + 1));
    }
}

class TreeHashMapMulti {
    roots;
    constructor() {
        this.roots = new List();
    }
    contains(key) {
        for (let root of this.roots.get_array()) {
            if (root.contains(key)) {
                return true;
            }
        }
        return false;
    }
    get_value(key) {
        for (let root of this.roots.get_array()) {
            let val = root.get_value(key);
            if (val.is_some()) {
                return val;
            }
        }
        return Opt.none();
    }
    get_parent_key(key) {
        for (let root of this.roots.iter()) {
            if (root.contains(key)) {
                return root.get_parent_key(key);
            }
        }
        return Opt.none();
    }
    _remove(key) {
        for (let root of this.roots.get_array()) {
            if (root.contains(key)) {
                root._remove(key);
                return;
            }
        }
    }
    _put(key, value, parent_opt) {
        parent_opt.do(parent => {
            for (let root of this.roots.get_array()) {
                if (root.contains(parent)) {
                    root._put(key, value, parent_opt);
                    return;
                }
            }
            throw new Error();
        }, () => {
            let tree = new TreeHashMap();
            tree._put(key, value, parent_opt);
            this.roots._push(tree);
        });
    }
    list_keys() {
        let output = new List();
        this.roots.for_each(root => output._push_all(root.list_keys()));
        return output;
    }
    list_level_ordered(order) {
        this.roots._sort((a, b) => {
            let a_key = a.get_root_hash().value_unchecked();
            let a_value = a.get_value(a_key).value_unchecked();
            let b_key = b.get_root_hash().value_unchecked();
            let b_value = b.get_value(b_key).value_unchecked();
            return order(a_value, b_value);
        });
        let output = new List();
        for (let root of this.roots.get_array()) {
            output._push_all(root.list_level_ordered(order));
        }
        return output;
    }
    list_level_ordered_from(key, order) {
        for (let root of this.roots.get_array()) {
            if (root.contains(key)) {
                return root.list_level_ordered_from(key, order, 0);
            }
        }
        return new List();
    }
    list_children(key) {
        for (let root of this.roots.get_array()) {
            if (root.contains(key)) {
                return root.list_children(key);
            }
        }
        throw new Error();
    }
    list_children_recursive(key) {
        for (let root of this.roots.get_array()) {
            if (root.contains(key)) {
                return root.list_children_recursive(key);
            }
        }
        throw new Error();
    }
    list_subtree(key) {
        for (let root of this.roots.get_array()) {
            if (root.contains(key)) {
                return root.list_subtree(key);
            }
        }
        throw new Error();
    }
    list_parents(key) {
        for (let root of this.roots.iter()) {
            if (root.contains(key)) {
                return root.list_parents(key);
            }
        }
        throw new Error();
    }
    find_first_parent_such_that(key, criterion) {
        for (let root of this.roots.get_array()) {
            if (root.contains(key)) {
                let first_parent = root.find_first_parent_such_that(key, criterion);
                if (first_parent.is_some()) {
                    return first_parent;
                }
            }
        }
        return Opt.none();
    }
    *iter_breadth(start_key_opt) {
        for (let root of this.roots.get_array()) {
            if (start_key_opt.is_some()) {
                if (root.contains(start_key_opt.value_unchecked()) === false) {
                    continue;
                }
            }
            for (let item of root.iter_breadth(start_key_opt)) {
                yield item;
            }
        }
    }
}

var DateExtensions;
(function (DateExtensions) {
    function load() { }
    DateExtensions.load = load;
})(DateExtensions || (DateExtensions = {}));

var NumberExtensions;
(function (NumberExtensions) {
    function load() { }
    NumberExtensions.load = load;
})(NumberExtensions || (NumberExtensions = {}));
const TOL = 0.000_000_1;
Number.prototype.tol_equals = function (other) {
    return (this - other).abs() <= TOL;
};
Number.prototype.delta_equals = function (other, delta) {
    return (this - other).abs() < delta;
};
Number.prototype.min = function (other) {
    return Math.min(this, other);
};
Number.prototype.max = function (other) {
    return Math.max(this, other);
};
Number.prototype.abs = function () {
    return Math.abs(this);
};
Number.prototype.sqrt = function () {
    return Math.sqrt(this);
};
Number.prototype.to_px = function () {
    return this * 96.0 / 2.54;
};
Number.prototype.to_cm = function () {
    return this * 2.54 / 96.0;
};

var StringExtensions;
(function (StringExtensions) {
    function load() { }
    StringExtensions.load = load;
})(StringExtensions || (StringExtensions = {}));
String.prototype.parse_json = function () {
    return JSON.parse(this);
};
String.prototype.parse_int = function () {
    return parseInt(this);
};
String.prototype.parse_float = function () {
    return parseFloat(this);
};
String.prototype.parse_number = function () {
    return Number(this);
};
String.prototype.parse_number_or = function (if_nan) {
    let parsed = Number(this);
    if (isNaN(parsed)) {
        parsed = if_nan;
    }
    return parsed;
};
String.prototype.to_number_or = function (or_value) {
    try {
        let parsed = Number(this);
        return isNaN(parsed) ? or_value : parsed;
    }
    catch {
        return or_value;
    }
};
String.prototype.encode_uri_component = function () {
    return encodeURIComponent(this);
};
String.prototype.decode_uri_component = function () {
    return decodeURIComponent(this);
};
String.prototype.is_whitespace = function () {
    return /\s/.test(this);
};
String.prototype.is_newline = function () {
    return /\n/.test(this);
};
String.prototype.is_digit = function () {
    const char_code = this.charCodeAt(0);
    return char_code >= 48 && char_code <= 57;
};
String.prototype.is_letter = function () {
    const char_code = this.charCodeAt(0);
    return (char_code >= 65 && char_code <= 90) || (char_code >= 97 && char_code <= 122);
};
String.prototype.is_alphanumeric = function () {
    return this.is_digit() || this.is_letter();
};

var CoreExtensions;
(function (CoreExtensions) {
    function load() {
        DateExtensions.load();
        NumberExtensions.load();
        StringExtensions.load();
    }
    CoreExtensions.load = load;
})(CoreExtensions || (CoreExtensions = {}));

class IdGen {
    counter;
    constructor(start_at) {
        this.counter = start_at;
    }
    _next() {
        this.counter += 1;
        return this.counter;
    }
}

function exaustive_switch(_) {
    throw new Error("Didn't expect to get here");
}

var Log;
(function (Log) {
    function json(x, n) {
        let shift = n ?? 2;
        console.log(JSON.stringify(x, null, shift));
    }
    Log.json = json;
})(Log || (Log = {}));

var PathUtils;
(function (PathUtils) {
    function remove_last_extension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return filename; // Return the filename as is if there's no dot
        }
        return filename.substring(0, lastDotIndex);
    }
    PathUtils.remove_last_extension = remove_last_extension;
})(PathUtils || (PathUtils = {}));

function sleep(time_ms) {
    return new Promise((res, rej) => {
        setTimeout(() => res(), time_ms);
    });
}

class PromiseScheduler {
    static SLEEP_MS = 1000.0 / 60.0;
    static async run(n_simultanious_jobs, jobs) {
        let scheduler = new PromiseScheduler(n_simultanious_jobs, jobs);
        await scheduler.run();
    }
    n_simultanious_jobs;
    jobs;
    active_jobs;
    current_job_index;
    finished_jobs;
    constructor(n_simultanious_jobs, jobs) {
        this.n_simultanious_jobs = n_simultanious_jobs.min(jobs.len());
        this.jobs = jobs;
        this.active_jobs = new HashMap();
        this.current_job_index = 0;
        this.finished_jobs = 0;
    }
    async run() {
        if (this.jobs.len() === 0) {
            return;
        }
        while (this.finished_jobs < this.jobs.len()) {
            this.clear_finished_jobs();
            if (this.finished_jobs === this.jobs.len()) {
                return;
            }
            if (this.active_jobs.size() < this.n_simultanious_jobs) {
                this.push_next_job();
            }
            await sleep(PromiseScheduler.SLEEP_MS);
        }
    }
    clear_finished_jobs() {
        let keys_that_ended = new List();
        for (let entry of this.active_jobs.iter()) {
            if (entry.value.is_done()) {
                keys_that_ended._push(entry.hash);
            }
        }
        for (let key_that_ended of keys_that_ended.iter()) {
            this.active_jobs._remove(key_that_ended);
            this.finished_jobs += 1;
        }
    }
    push_next_job() {
        if (this.jobs.is_valid_index(this.current_job_index) === false)
            return;
        let job_to_add = this.jobs.get(this.current_job_index);
        this.active_jobs._put(this.current_job_index.toString(), job_to_add);
        job_to_add.start();
        this.current_job_index += 1;
    }
}

class SimplePromiseSchedulerJob {
    action;
    isDone = false;
    constructor(action) {
        this.action = action;
    }
    start() {
        this.run();
    }
    is_done() {
        return this.isDone;
    }
    async run() {
        await this.action();
        this.isDone = true;
    }
}
var SimplePromiseScheduler;
(function (SimplePromiseScheduler) {
    async function run_jobs(nJobs, actionList) {
        await PromiseScheduler.run(nJobs, actionList.map(action => new SimplePromiseSchedulerJob(action)));
    }
    SimplePromiseScheduler.run_jobs = run_jobs;
})(SimplePromiseScheduler || (SimplePromiseScheduler = {}));

class Result {
    _is_ok;
    value;
    error;
    constructor() {
        this._is_ok = false;
        this.value = null;
        this.error = null;
    }
    static error(error) {
        let to_return = new Result();
        to_return._is_ok = false;
        to_return.value = null;
        to_return.error = error;
        return to_return;
    }
    static ok(value) {
        let to_return = new Result();
        to_return._is_ok = true;
        to_return.value = value;
        to_return.error = null;
        return to_return;
    }
    is_ok() { return this._is_ok; }
    is_error() { return this.is_ok() === false; }
    get_value() {
        if (this.is_error())
            throw new Error();
        return this.value;
    }
    get_error() {
        if (this.is_ok())
            throw new Error();
        return this.error;
    }
    value_or_throw() {
        if (this.is_error())
            throw new Error();
        return this.value;
    }
}

class UniqueHashGenerator {
    hash_set;
    constructor() {
        this.hash_set = new HashSet();
    }
    _next(size) {
        let next = Random.str(size);
        while (this.hash_set.contains(next)) {
            next = Random.str(size);
        }
        this.hash_set._add(next);
        return next;
    }
    _remove(hash) {
        this.hash_set._remove(hash);
    }
    _add_hash(hash) {
        this.hash_set._add(hash);
    }
}

class WebWorker {
    worker;
    constructor(worker) {
        this.worker = worker;
    }
    static from_uri(url_or_src) {
        let worker = new Worker(url_or_src);
        return new WebWorker(worker);
    }
    run(input) {
        return new Promise((res, rej) => {
            this.worker.onmessage = (r) => {
                res({});
            };
            this.worker.onerror = (r) => {
                rej();
            };
            this.worker.onmessageerror = (r) => {
                rej();
            };
            this.worker.postMessage(input);
        });
    }
}

export { CoreExtensions, DateExtensions, HashMap, HashSet, IdGen, List, Log, NumberExtensions, Opt, PathUtils, PromiseScheduler, Random, Result, SimplePromiseScheduler, StringExtensions, TreeHashMap, TreeHashMapMulti, UniqueHashGenerator, WebWorker, exaustive_switch, sleep };
