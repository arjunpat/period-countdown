use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer, Responder, get, middleware};
use sqlx::mysql::MySqlPool;

mod db;
mod utils;

#[get("/hello/mom")]
async fn testing() -> impl Responder {
  HttpResponse::Ok().body("What's up bro")
}

#[get("/test/{id}")]
async fn test(req: HttpRequest, db: web::Data<MySqlPool>) -> impl Responder {
  let id = String::from(req.match_info().query("id"));

  // let result = db::get_user(&db, &id);
  // let result = db::get_account_by_device_id(&db, &id);
  // let result = db::get_device(&db, &id);

  /* match result {
    Some(d) => HttpResponse::Ok().json(d),
    None => HttpResponse::Ok().body(id)
  } */

  HttpResponse::Ok().body("wassup")
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {

  let mysql_url = "mysql://root@127.0.0.1/periods_io";
  let pool = MySqlPool::new(mysql_url).await.unwrap();
  
  HttpServer::new(move || {
    App::new()
      .data(&pool)
      .wrap(middleware::Logger::default())
      .service(testing)
      .service(test)
  })
  .workers(1)
  .bind("127.0.0.1:8080")?
  .run()
  .await
}