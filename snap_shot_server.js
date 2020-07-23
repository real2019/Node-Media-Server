// 截图定时上传的服务
const logger = require('./node_core_logger');
const Constants = require("./constants");
const SnapShotUtils = require("./image/SnapShotUtils");
const SystemContext = require("./image/systemContext.js");
const SystemTick = require("./image/ticktimer");
const co = require("co");
const _ = require("lodash");
const moment = require("moment");
const uuid = require("node-uuid");
const Promise = require("bluebird");
const fs = require("fs");
Promise.promisifyAll(fs);

class SnapShotServer {
    constructor() {
        logger.debug("SnapShotServer starting...............");

        this.tickTimer = new SystemTick(Constants.TimeTick);
        let msg = Constants.SYSTEM_EVENT.properties[Constants.SYSTEM_EVENT.TIME_TICK].event;
        SystemContext.getNodeEvent().on(msg, this.processTickTimeLocal.bind(this));
        
        this.snapShotUtils = new SnapShotUtils();
        this.batch_count = 10;
    }

    start() {
        this.tickTimer.startTimer();
        logger.debug("SnapShotServer started...............");
    }

    processTickTimeLocal() {
        this.currentTick++;
        if (this.currentTick * Constants.TimeTick >= Constants.snapShotTime) {
            let _this = this;
            co(function*() {
                yield _this._processSnapShot();

                _this.currentTick = 0;
            }).catch(function(error) {
                _this.currentTick = 0;

                logger.debug("processTickTime error:", error);
            })
        } else {
            logger.debug("processTickTime:", this.currentTick);
        }
    }

    _uploadToCosLocal(file) {
        return new Promise((resolve, reject) => {
            let _this = this;
            co(function*() {
                let fileName = uuid.v4();
                if (!fs.existsSync(_this.sysConf.LocalImagePath + file.streamName))
                    fs.mkdirSync(_this.sysConf.LocalImagePath + file.streamName);
                let dest_path = _this.sysConf.LocalImagePath + file.streamName + "/" + fileName;
                fs.copyFileSync(file.filePath, dest_path);

                let url = "http://192.168.100.121/" + file.streamName + "/" + fileName;
                return resolve(url);
            }).catch(function(error) {
                logger.debug("_uploadToCosLocal error:", error);
                return resolve("");
            })
        })
    }

    // 提交上传url
    _commitCosUrl(files) {
        return new Promise((resolve, reject) => {
            let _this = this;
            co(function*() {
                let req = {
                    server_id: _this.conf.serverId,
                    nonce: uuid.v4(),
                    time_stamp: moment().unix(),
                    data: JSON.stringify(files),
                    system_id: _this.conf.systemId,
                }
                let signStr = _this.protocolSign.getSignString(req);
                _.assign(req, {sign: signStr});

                var options = {
                    "url": _this.sysConf.cloudURL + "/web/base/commitCosUrl",
                    "method": "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    "body": JSON.stringify(req),
                };
                logger.debug("options: " + JSON.stringify(options));

                request(options, function(err, res, body){
                    if (err) {
                        return logger.debug("commitCosUrl error:", err);
                    }
                    logger.debug("body:", body); 
                    let obj = JSON.parse(body);

                    return resolve(obj.data);
                });
            }).catch(function(error) {
                logger.debug("error:", error);
                return resolve(0);
            })
        })
    }

    // 周期性处理截图
    _processSnapShot() {
        return new Promise((resolve, reject) => {
            let _this = this;
            co(function*() {
                // 遍历目录，获取上传文件列表
                let files = _this.snapShotUtils.getDirFiles("/home/qcjk/img/");
                while(files && files.length > 0) {
                    let cache = _.slice(files, 0, _this.batch_count);
                    let request_array = [];

                    // 上传
                    for (let item of cache) {
                        let request_obj = null;
                        if (_this.sysConf.isLocal === 1) {
                            request_obj = _this._uploadToCosLocal(item);
                        } else {
                            request_obj = _this._uploadToCos(item);
                        }
                        if (request_obj)
                            request_array.push(request_obj);
                    }
                    let response_array = yield Promise.all(request_array);
                    if (response_array && response_array.length === request_array.length) {
                        for (let i=0; i<cache.length; i++) {
                            let _item = cache[i];
                            _.assign(_item, {url: response_array[i]});
                        }
                    }

                    // 去掉url为空的
                    let commit_cache = [];
                    for (let item of cache) {
                        if (item.url && item.url.length > 0) {
                            commit_cache.push(item);
                        }
                    }

                    if (commit_cache.length <= 0)
                        continue;

                    // 提交上传url
                    let commit_count = yield _this._commitCosUrl(commit_cache);
                    logger.debug("commit_count:", commit_count);

                    // 删除已经上传成功的本地文件
                    if (commit_count > 0) {
                        for (let obj of commit_cache) {
                            if (obj.url && obj.url.length > 0) {
                                _this.snapShotUtils.deleteFile(obj);
                            }
                        }
                    }

                    files = _.drop(files, _this.batch_count);
                }

                return resolve(1);
            }).catch(function(error) {
                return reject(error);
            })
        })
    }
}

module.exports = SnapShotServer;