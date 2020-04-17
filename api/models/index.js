const { MYSQL_USER, MYSQL_PASS, MYSQL_HOST, MYSQL_DB } = process.env;

const MySQL = require('../lib/MySQL');
const Devices = require('./Devices');
const Users = require('./Users');
const Hits = require('./Hits');
const Errors = require('./Errors');
const Events = require('./Events');

const mysql = new MySQL(
  MYSQL_USER,
  MYSQL_PASS,
  MYSQL_DB,
  MYSQL_HOST
);

module.exports = {
  devices: new Devices(mysql),
  users: new Users(mysql),
  hits: new Hits(mysql),
  errors: new Errors(mysql),
  events: new Events(mysql)
}
