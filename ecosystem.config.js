module.exports = {
  apps : [{
    name      : "sip-server",
    instances : 1,
    exec_mode : "fork",
    env       : {
        "PORT" : 3000,
	"NODE_ENV": "production"
    },
    cwd    : "/home/fyc/projects/desa/",
    script : "server.js",
    args   : "limit",
  }]
}
