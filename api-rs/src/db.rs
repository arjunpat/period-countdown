#![allow(unused)]
use std::time::{SystemTime, UNIX_EPOCH};
use sqlx::{
  query_as, FromRow, Row,
  mysql::{MySqlPool, MySqlRow},
  prelude::{MySqlQueryAs}
};
use serde::{Serialize, Deserialize};
use crate::utils::now;

#[derive(Serialize, Deserialize, FromRow)]
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

/* pub async fn get_device(pool: &MySqlPool, device_id: &String) -> Result<Device> {
  let mut stream = sqlx::query_as::<_, Device>("SELECT * FROM devices WHERE device_id = ?").bind(device_id).fetch_one(&mut pool);
}
 */
#[derive(Serialize, Deserialize, FromRow)]
pub struct Device {
  pub device_id: String,
  pub time: i64,
  pub platform: String,
  pub browser: String,
  pub user_agent: String,
  pub registered_to: Option<String>,
  pub time_registered: Option<i64>
}

/* pub fn get_account_by_device_id(pool: &MySqlPool, device_id: &String) -> Option<String> {

} */