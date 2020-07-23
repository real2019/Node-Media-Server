// 系统的tick定时器，抛出系统消息
const Constants = require("../constants");
const SystemContext = require("./systemContext.js");

class TickTimer {
    constructor(tickTime) {
        this.timer = null;
        this.tickTime = tickTime * 1000;
    }

    startTimer() {
        if (this.timer) {
            this.startTimer();
        }

        this.timer = setInterval(function() {
            let msg = Constants.SYSTEM_EVENT.properties[Constants.SYSTEM_EVENT.TIME_TICK].event;
            SystemContext.getNodeEvent().emit(msg);
        }, this.tickTime);
    }

    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }
}

module.exports = TickTimer;