// 7:55

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
        return eventName => this.trigger.call(this, eventName, {parentEventId: eventId, parentCbId: id});
    }

    trigger(eventName, {parentEventId, parentCbId}) {
        let events = this.eventMap[eventName];
        if (!events) return;
        let eventId = this.eventId++;

        this.beforeTriggerHooks.forEach(hook => hook(eventId, eventName));

        let count = events.length;
        events.forEach((cb, cbId) => {
            this.beforeCallbackHooks.forEach(hook => hook(eventId, cbId, eventName, cb));
            let res = cb.call({
                trigger: this.triggerWithId(eventId, cbId)
            });

            if (res instanceof Promise) {
                res.catch(err => {
                    this.afterCallbackHooks.forEach(hook => hook(eventId, cbId, eventName, cb));
                    count--;

                    if (count === 0) this.afterTriggerHooks.forEach(hook => hook(eventId, eventName));
                    throw err;
                }).then(data => {
                    this.afterCallbackHooks.forEach(hook => hook(eventId, cbId, eventName, cb));
                    count--;
                    
                    if (count === 0) this.afterTriggerHooks.forEach(hook => hook(eventId, eventName));
                    return data;
                });
            } else {
                count--;
                this.afterCallbackHooks.forEach(hook => hook(eventId, cbId, eventName, cb));
            }
        });
        if (count === 0) this.afterTriggerHooks.forEach(hook => hook(eventId, eventName));
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

function logger() {
    let stackNum = 0;
    let log = '';

    function pushStack(str) {
        log += '--'.repeat(stackNum) + str + '\n';
        stackNum++;
    }

    function popStack() {
        stackNum--;
    }

    return {
        beforeTrigger(eventId, eventName) {
            pushStack('event: ' + eventName);
        },
        beforeCallback(eventId, cbId, eventName, cb) {
            pushStack('callback: ' + cb.name);
        },
        afterCallback(eventId, cbId, eventName, cb) {
            popStack();
        },
        afterTrigger(eventId, eventName) {
            popStack();
            if (stackNum === 0) {
                console.log(log);
                log = '';
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

bus.addEventListener('testEvent', function callback1(){
    console.log('testEvent')
    // do something
    this.trigger('testEvent2')
    this.trigger('testEvent2')
})
bus.addEventListener('testEvent', function callback1(){
    console.log('testEvent')
    // do something
    this.trigger('testEvent2')
})


bus.addEventListener('testEvent2', function callback2(){
    console.log('testEvent2')
    // do something
})

bus.use(logger());
bus.trigger('testEvent');