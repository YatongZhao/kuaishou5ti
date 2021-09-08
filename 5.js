// 7:55
// 10:30

// 9:31

class Bus {
    eventMap = {};
    beforeTriggerHooks = [];
    beforeCallbackHooks = [];
    afterCallbackHooks = [];
    afterTriggerHooks = [];
    eventId = 0;

    addEventListener(eventName, cb) {
        if (!this.eventMap[eventName]) {
            this.eventMap[eventName] = [];
        }
        this.eventMap[eventName].push(cb);
    }

    triggerWithId(eventId, id) {
        return eventName => this.triggerCore.call(this, eventName, {parentEventId: eventId, parentCbId: id});
    }

    trigger(eventName) {
        return this.triggerCore(eventName);
    }

    triggerCore(eventName, parentIdMap) {
        let events = this.eventMap[eventName];
        if (!events) return;
        let eventId = this.eventId++;

        this.beforeTriggerHooks.forEach(hook => hook({eventId, eventName, parentIdMap}));

        let count = events.length;
        events.forEach((cb, cbId) => {
            this.beforeCallbackHooks.forEach(hook => hook({eventId, cbId, eventName, cb, parentIdMap}));
            let res = cb.call({
                trigger: this.triggerWithId(eventId, cbId)
            });

            if (res instanceof Promise) {
                res.catch(err => {
                    this.afterCallbackHooks.forEach(hook => hook({eventId, cbId, eventName, cb, parentIdMap}));
                    count--;

                    if (count === 0) this.afterTriggerHooks.forEach(hook => hook({eventId, eventName, parentIdMap}));
                    throw err;
                }).then(data => {
                    this.afterCallbackHooks.forEach(hook => hook({eventId, cbId, eventName, cb, parentIdMap}));
                    count--;
                    
                    if (count === 0) this.afterTriggerHooks.forEach(hook => hook({eventId, eventName, parentIdMap}));
                    return data;
                });
            } else {
                count--;
                this.afterCallbackHooks.forEach(hook => hook({eventId, cbId, eventName, cb, parentIdMap}));
            }
        });
        if (count === 0) this.afterTriggerHooks.forEach(hook => hook({eventId, eventName, parentIdMap}));
    }

    removeEventListener(eventName, cb) {
        if (!this.eventMap[eventName]) return;

        this.eventMap[eventName] = this.eventMap[eventName].filter(_cb => _cb !== cb);
    }

    use({ beforeTrigger, beforeCallback, afterCallback, afterTrigger }) {
        beforeTrigger && typeof beforeTrigger === 'function' && this.beforeTriggerHooks.push(beforeTrigger);
        beforeCallback && typeof beforeCallback === 'function' && this.beforeCallbackHooks.push(beforeCallback);
        afterCallback && typeof afterCallback === 'function' && this.afterCallbackHooks.push(afterCallback);
        afterTrigger && typeof afterTrigger === 'function' && this.afterTriggerHooks.push(afterTrigger);
    }
}



class EventLog {
    cb = [];
    eventName;
    eventId;

    constructor(eventName, eventId) {
        this.eventName = eventName;
        this.eventId = eventId;
    }

    logStack(stackNum, cb) {
        let result = '--'.repeat(stackNum) + this.eventName + '\n'
            + this.cb.map(callBackLog => callBackLog.logStack(stackNum+1, cb)).join('');

        if (cb) cb(this.eventId);

        return result;
    }

    log(cb) {
        return this.logStack(0, cb);
    }
}

class CallBackLog {
    event = [];
    name;

    constructor(name) {
        this.name = name;
    }

    logStack(stackNum, cb) {
        let result = '--'.repeat(stackNum) + this.name + '\n'
            + this.event.map(eventLog => eventLog.logStack(stackNum+1, cb)).join('');

        return result;
    }
}

function logger() {
    let rootIdMap = {};
    let eventMap = {};
    return {
        beforeTrigger({eventId, eventName, parentIdMap}) {
            eventMap[eventId] = new EventLog(eventName, eventId);

            if (!parentIdMap) {
                rootIdMap[eventId] = true;
            } else {
                let { parentEventId, parentCbId } = parentIdMap;
                eventMap[parentEventId].cb[parentCbId].event.push(eventMap[eventId]);
            }
        },
        beforeCallback({eventId, cbId, eventName, cb, parentIdMap}) {
            eventMap[eventId].cb[cbId] = new CallBackLog(cb.name);
        },
        afterCallback({eventId, cbId, eventName, cb, parentIdMap}) { },
        afterTrigger({eventId, eventName, parentIdMap}) {
            if (rootIdMap[eventId]) {
                console.log(eventMap[eventId].log((eventId) => delete eventMap[eventId]));
                delete rootIdMap[eventId];
            }
        }
    }
}

const bus = new Bus()
// bus.addEventListener('testEvent', (...argv) => { 
//   console.log('event callback')
// })
// bus.addEventListener('testEvent', (...argv) => { 
//   console.log('event callback')
// })
// bus.trigger('testEvent', 1, 2)
// bus.trigger('testEvent', 1, 2)

bus.addEventListener('testEvent', async function callback1(){
    // console.log('testEvent')
    // do something
    await Promise.resolve();
    this.trigger('testEvent2')
    this.trigger('testEvent2')
})
bus.addEventListener('testEvent', function callback3(){
    // console.log('testEvent')
    // do something
    this.trigger('testEvent2')
})


bus.addEventListener('testEvent2', function callback2(){
    // console.log('testEvent2')
    // do something
})

bus.use(logger());
bus.trigger('testEvent');
bus.trigger('testEvent');