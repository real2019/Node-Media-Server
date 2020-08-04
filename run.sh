#!/bin/bash

pm2 delete /home/tengits/Node-Media-Server/app.js
pm2 start /home/tengits/Node-Media-Server/app.js