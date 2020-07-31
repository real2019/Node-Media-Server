var Constants = Constants || {
    ffmpeg: "/home/tengits/ffmpeg/ffmpeg",
    imageInterval: 5,
    imagePath: "/Users/apple/nms/img/",
    nginxPath: "/www/snapshot/",
    COMMON_SPLIT_STR: "|",
    snapShotTime: 120,          // 定时上传截图到cos时间间隔120s
    TimeTick: 15,               // 系统tick时间15s
    imageURL: "http://172.20.91.211:13050/",
    cloudURL: "http://172.20.92.168:13026",
    serverId: 1,
    systemId: 8,
    hd_str: "_hd",

    username: "server1591323265",
    password: "Bc8GO2Rj",

    SYSTEM_EVENT: {
        // 系统相关
        TIME_TICK: 1,

        properties: {
            1: { event: "time_tick", desc: "系统时钟tick" },
        }
    }
}

module.exports = Constants;