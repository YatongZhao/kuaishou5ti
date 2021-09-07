// 开始时间0907 15:20
// 结束时间0907 18:00

let input = [
    {id: 1, before: 3},
    {id: 2, before: 1},
    {id: 3, first: true},
]
// 2 before 1 3

function sort(arr) {
    let item = {
        index: 0,
        before: [],
        after: [],
    }

    let map = {};
    let firstId = null;
    let lastId = null;

    arr.forEach(({ before, after, id, first, last }, index) => {
        let _item = map[id] = {
            index,
            before: new Set(),
            after: new Set(),
            checked: false,
        }

        before !== undefined && _item.before.add(before);
        after !== undefined && _item.after.add(after);

        if (first) {
            if (firstId !== null) throw new Error('Should only have one first item.');
            firstId = id;
        }
        if (last) {
            if (lastId !== null) throw new Error('Should only have one last item.');
            lastId = id;
        }
    });

    arr.forEach(({ before, after, id }) => {
        before && map[before].after.add(id);
        after && map[after].before.add(id);
    });

    if (firstId !== null && map[firstId].before.size !== 0) {
        throw new Error('First item should not have before.');
    }
    if (lastId !== null && map[lastId].after.size !== 0) {
        throw new Error('Last item should not have after.');
    }

    let currentFirst = new Set();

    let hasNoResult = arr.some(({ before, after, id }) => {
        return checkBefore(id, new Set());
    });

    function checkBefore(id, queueSet) {
        if (queueSet.has(id)) return true;

        let item = map[id];

        if (item.checked) return false;

        if (item.before.size === 0) {
            currentFirst.add(item);
        } else {
            let hasNoResult = false;
            item.before.forEach(_id => {
                let set = new Set(queueSet);
                set.add(id);
                checkBefore(_id, set) && (hasNoResult = true);
            });

            if (hasNoResult) {
                return true;
            }
        }
        item.checked = true;
        return false;
    }

    if (hasNoResult) throw new Error('Has no result.');

    let result = [];

    while (currentFirst.size !== 0) {
        let nextFirst = new Set();

        currentFirst.forEach(item => {
            result.push(arr[item.index]);
        });

        currentFirst.forEach(item => {
            item.after.forEach(son => {
                nextFirst.add(map[son]);
            });
        });

        nextFirst.forEach(item => {
            item.after.forEach(son => {
                if (nextFirst.has(map[son])) {
                    nextFirst.delete(map[son]);
                }
            });
        });

        currentFirst = nextFirst;
    }

    if (firstId === null && lastId === null) return result;
    result = result.filter(item => {
        return item.id !== firstId && item.id !== lastId;
    });
    firstId !== null && result.unshift(arr[map[firstId].index]);
    lastId !== null && result.push(arr[map[lastId]]);

    return result;
}

console.log(sort(input));