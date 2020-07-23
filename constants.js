var Constants = Constants || {
    ffmpeg: "/Users/apple/Temp/rtmp/ffmpeg",
    imageInterval: 5,
    imagePath: "/Users/apple/nms/img/",
    COMMON_SPLIT_STR: "|",
    snapShotTime: 120,          // 定时上传截图到cos时间间隔120s
    TimeTick: 15,               // 系统tick时间15s

    SYSTEM_EVENT: {
        // 系统相关
        TIME_TICK: 1,

        properties: {
            1: { event: "time_tick", desc: "系统时钟tick" },
        }
    }
}

module.exports = Constants;