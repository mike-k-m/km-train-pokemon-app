import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// server側のfetch関数で「UNABLE_TO_GET_ISSUER_CERT_LOCALLY」という例外が発生したため、
//    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// を追記した。セキュリティに問題あるかもしれないが、暫定措置
// また、npmのProxy設定、windowsのProxy設定をOFF、Pulse Secureを切断しても、例外が解消されない。
// https://stackoverflow.com/questions/51995925/node-fetch-request-fails-on-server-unable-to-get-local-issuer-certificate
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

export default app;
