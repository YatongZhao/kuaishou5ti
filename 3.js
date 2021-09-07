// 开始时间0907 18:07
// 结束时间0907 18:38

let data = [
    {id:1, name: 'i1'},
    {id:2, name:'i2', parentId: 1},
    {id:4, name:'i4', parentId: 3},
    {id:3, name:'i3', parentId: 2},
    {id:8, name:'i8', parentId: 7}
];

function createTree(data) {
    let map = {};
    let firstNode = null;

    data.forEach(({ id, name, parentId }) => {
        if (map[id]) {
            map[id].name = name;
            map[id].parentId = parentId;
        } else {
            map[id] = {
                id,
                name,
                children: [],
                parentId,
            }
        }

        if (parentId === undefined) {
            firstNode = map[id];
            return;
        }

        if (map[parentId]) {
            map[parentId].children.push(map[id]);
        } else {
            map[parentId] = {
                id: parentId,
                name: '',
                children: [map[id]],
            }
        }
    });

    if (!firstNode) throw new Error('no first node.');
    let i = 0;
    let nodes = [firstNode];
    while (nodes.length !== 0) {
        let nextNodes = [];
        nodes.forEach(node => {
            nextNodes = nextNodes.concat(node.children);
        });
        i += nodes.length;
        nodes = nextNodes;
    }

    if (i !== data.length) {
        throw new Error('node error.');
    }

    return firstNode;
}

console.log(createTree(data));