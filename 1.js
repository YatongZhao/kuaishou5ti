// 开始时间 0907 14:02
// 结束时间 0907 15:18

// Allegoric Alaskans;Blithering Badgers;win
// Devastating Donkeys;Courageous Californians;draw
// Devastating Donkeys;Allegoric Alaskans;win
// Courageous Californians;Blithering Badgers;loss
// Blithering Badgers;Devastating Donkeys;loss
// Allegoric Alaskans;Courageous Californians;win

function tournament(inputStr) {
    if (typeof inputStr !== 'string') {
        return '';
    }

    let map = {};
    let teams = [];
    let maxNameLength = 0;
    let maxMPLength = 2;
    let maxWLength = 1;
    let maxDLength = 1;
    let maxLLength = 1;
    let maxPLength = 1;

    let inputArr = inputStr.split('\n');

    inputArr.forEach(str => {
        let arr = str.split(';');

        if (arr.length !== 3) return;
        switch (arr[2]) {
            case 'win':
                setMapItem(arr[0], 'win');
                setMapItem(arr[1], 'loss');
                break;
            case 'loss':
                setMapItem(arr[1], 'win');
                setMapItem(arr[0], 'loss');
                break;
            case 'draw':
                setMapItem(arr[0], 'draw');
                setMapItem(arr[1], 'draw');
                break;
            default:
                break;
        }
    });

    setMaxNumber();

    return formatMap(map);

    /**
     * 
     * @param {string} name 
     * @param {'win'|'loss'|'draw'} result 
     */
    function setMapItem(name, result) {
        if (!map[name]) {
            map[name] = {
                MP: 0,
                MPString: '',
                W: 0,
                WString: '',
                D: 0,
                DString: '',
                L: 0,
                LString: '',
                P: 0,
                PString: '',
            }

            maxNameLength = Math.max(name.length, maxNameLength);
            teams.push(name);
        }
        map[name].MP += 1;

        if (result === 'win') {
            map[name].W += 1;
            map[name].P += 3;
        } else if (result === 'draw') {
            map[name].D += 1;
            map[name].P += 1;
        } else if (result === 'loss') {
            map[name].L += 1;
        }
    }

    function setMaxNumber() {
        teams.forEach(team => {
            map[team].MPString = '' + map[team].MP;
            maxMPLength = Math.max(map[team].MPString.length, maxMPLength);
            map[team].WString = '' + map[team].W;
            maxWLength = Math.max(map[team].WString.length, maxWLength);
            map[team].DString = '' + map[team].D;
            maxDLength = Math.max(map[team].DString.length, maxDLength);
            map[team].LString = '' + map[team].L;
            maxLLength = Math.max(map[team].LString.length, maxLLength);
            map[team].PString = '' + map[team].P;
            maxPLength = Math.max(map[team].PString.length, maxPLength);
        });
    }

    function formatMap() {
        let body = teams.map(name => {
            let item = map[name];
            return name + ' '.repeat(maxNameLength - name.length) +
                ' | ' + ' '.repeat(maxMPLength - item.MPString.length) + item.MPString +
                ' | ' + ' '.repeat(maxWLength - item.WString.length) + item.WString +
                ' | ' + ' '.repeat(maxDLength - item.DString.length) + item.DString +
                ' | ' + ' '.repeat(maxLLength - item.LString.length) + item.LString +
                ' | ' + ' '.repeat(maxPLength - item.PString.length) + item.PString;
        }).join('\n');

        let head = 'Team' + ' '.repeat(maxNameLength - 4) +
            ' | ' + ' '.repeat(maxMPLength - 2) + 'MP' +
            ' | ' + ' '.repeat(maxWLength - 1) + 'W' +
            ' | ' + ' '.repeat(maxDLength - 1) + 'D' +
            ' | ' + ' '.repeat(maxLLength - 1) + 'L' +
            ' | ' + ' '.repeat(maxPLength - 1) + 'P';

        return head + '\n' + body;
    }
}

console.dir(tournament(`Allegoric Alaskans;Blithering Badgers;win
Devastating Donkeys;Courageous Californians;draw
Devastating Donkeys;Allegoric Alaskans;win
Courageous Californians;Blithering Badgers;loss
Blithering Badgers;Devastating Donkeys;loss
Allegoric Alaskans;Courageous Californians;win`));