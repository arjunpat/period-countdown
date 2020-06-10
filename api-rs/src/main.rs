use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer, Responder, get, middleware};
use mysql::*;
mod db;

#[get("/hello/mom")]
async fn testing() -> impl Responder {
  HttpResponse::Ok().body("What's up bro")
}

#[get("/test/{id}")]
async fn test(req: HttpRequest, db: web::Data<Pool>) -> impl Responder {
  let id = String::from(req.match_info().query("id"));

  // let result = db::get_user(&db, &id);
  let result = db::get_account_by_device_id(&db, &id);

  match result {
    Some(d) => HttpResponse::Ok().json(d),
    None => HttpResponse::Ok().body(id)
  }

  /*
  match db::get_device(&db, &id) {
    Some(d) => HttpResponse::Ok().json(d),
    None => HttpResponse::Ok().body(id)
  } */
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {

  let mysql_url = "mysql://root@127.0.0.1/periods_io";
  
  HttpServer::new(move || {
    let pool = Pool::new(mysql_url).unwrap();

    App::new()
      .data(pool)
      .wrap(middleware::Logger::default())
      .service(testing)
      .service(test)
  })
  .workers(1)
  .bind("127.0.0.1:8080")?
  .run()
  .await
}