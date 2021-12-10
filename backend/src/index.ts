import "reflect-metadata";

import { fastify, FastifyInstance } from 'fastify';
import fastifyOAS from "fastify-oas";

const app: FastifyInstance = fastify();

app
  .register(fastifyOAS, {
    routePrefix: "/swagger",
    exposeRoute: true,
    swagger: {
      host: "localhost:3000",
      info: {
        title: "Discover Daily",
        description: "Backend for Discover Daily app",
        version: "0.0.1",
      },
      consumes: ["application/json"],
      produces: ["application/json"],
    },
  })

app.listen("3000", (err) => {
  if (err != null) {
    setImmediate(() => console.error(err));
    process.exit(-1);
  }

  console.log("Backend started and listening on http://localhost:3000");
  console.log("Swagger available at http://localhost:3000/swagger");
});
