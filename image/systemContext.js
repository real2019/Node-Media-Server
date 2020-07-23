// 系统公用的上下文

var SystemContext = SystemContext || {};
module.exports = SystemContext;

const EventEmitter = require('events');

var g_event = null;
SystemContext.getNodeEvent= function() {
    if (!g_event) {
        g_event = new EventEmitter();
    }

    return g_event;
}