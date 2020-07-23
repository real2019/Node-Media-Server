// 定时截屏的处理类
const fs = require("fs");
const logger = require('../node_core_logger');
const _ = require("lodash");
const moment = require("moment");
const path = require('path');
const Constants = require("../constants");

class SnapShotUtils {
    // 构造函数
    constructor() {}

    // 获取目录下所有文件
    getDirFiles(dir) {
        let files = [];
        let _this = this;
        fs.readdirSync(dir).forEach(function (file) {
            let pathname = path.join(dir, file);
            let stats = fs.statSync(pathname);
            if (!stats.isDirectory()) {
                let result = _this._translateFileInfo({
                    filePath: pathname,
                    createTime: stats.birthtime,
                });

                if (result)
                    files.push(result);
            } 
        });

        return files;
    }

    // 转换文件的信息
    _translateFileInfo(file) {
        let index = file.filePath.lastIndexOf("/");
        let fileName = file.filePath.substr(index+1);
        let arr = _.split(fileName, Constants.COMMON_SPLIT_STR);
        if (!arr || arr.length < 2) {
            return null;
        }

        return {
            filePath: file.filePath,
            createTime: moment(file.createTime).format("YYYY-MM-DD HH:mm:ss"),
            streamName: arr[0],
        }
    }

    // 删除文件
    deleteFile(file) {
        return fs.unlinkSync(file.filePath);
    }
}

module.exports = SnapShotUtils;
