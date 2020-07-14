#![allow(unused)]

use std::time::{SystemTime, UNIX_EPOCH};
use mysql::{
  Pool, Row, Params,
  prelude::{Queryable}
};
use serde::{Serialize, Deserialize};
use crate::utils::now;

fn exec_first<P>(pool: &Pool, sql: &str, params: P) -> Option<Row>
where
  P: Into<Params>
{
  let mut conn = pool.get_conn().ok()?;
  conn.exec_first::<Row, _, _>(sql, params).ok()?
}

#[derive(Serialize, Deserialize)]
pub struct User {
  pub email: String,
  pub time: i64,
  pub first_name: String,
  pub last_name: String,
  pub profile_pic: String,
  pub school: Option<String>,
  pub theme: Option<i8>,
  pub period_names: Option<String>
}

pub fn get_user(pool: &Pool, email: &String) -> Option<User> {
  let mut row = exec_first(pool, "SELECT * FROM users WHERE email = ?", (email,))?;
  
  Some(User {
    email: row.take("email").unwrap(),
    time: row.take("time").unwrap(),
    first_name: row.take("first_name").unwrap(),
    last_name: row.take("last_name").unwrap(),
    profile_pic: row.take("profile_pic").unwrap(),
    school: row.take("school").unwrap(),
    theme: row.take("theme").unwrap(),
    period_names: row.take("period_names").unwrap()
  })
}

#[derive(Serialize, Deserialize)]
pub struct Device {
  pub device_id: String,
  pub time: i64,
  pub platform: String,
  pub browser: String,
  pub user_agent: String,
  pub registered_to: Option<String>,
  pub time_registered: Option<i64>
}

pub fn get_device(pool: &Pool, device_id: &String) -> Option<Device> {
  let mut row = exec_first(pool, "SELECT * FROM devices_id WHERE device_id = ?", (device_id,))?;
  
  Some(Device {
    device_id: row.take("device_id").unwrap(),
    time: row.take("time").unwrap(),
    platform: row.take("platform").unwrap(),
    browser: row.take("browser").unwrap(),
    user_agent: row.take("user_agent").unwrap(),
    registered_to: row.take("registered_to").unwrap(),
    time_registered: row.take("time_registered").unwrap()
  })
}

pub fn get_account_by_device_id(pool: &Pool, device_id: &String) -> Option<String> {
  let mut row = exec_first(pool, "SELECT registered_to FROM devices WHERE device_id = ?", (device_id,))?;

  row.take("registered_to")?
}

pub fn login(pool: &Pool, device_id: &String, email: &String) -> bool {
  exec_first(
    pool,
    "UPDATE devices SET registered_to = ?, time_registered = ? WHERE device_id = ?",
    (email, now(), device_id)
  ).is_some()
}