const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "영화 추천 및 리뷰 API",
      version: "1.0.0",
      description: "영화 추천 및 리뷰 정보 관련 REST API 문서입니다.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/auth.js"], // 주석으로부터 API 문서 생성
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
