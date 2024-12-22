import http from "node:http"
import mongoose from "mongoose"
import { PollRepository, ResultRepository } from "./repositories";

const port = process.env.PORT ?? 8080;

// TODO: Refactor this code into separate routes and controllers
// TODO: Refactor the chunking of request body into a common function or a middleware
// TODO Refactor the sending of response into a common function
const server = http.createServer(async (req, res) => {
  const url = req.url
  const method = req.method

  const pollRoute = "/api/poll"
  if (url?.startsWith(pollRoute)) {
    switch (method) {
      case "GET": {
        if (pollRoute === url) {
          const data = await new PollRepository().getAll()
          res.writeHead(200, { 'Content-Type': 'text/json' });
          return res.end(JSON.stringify({ data }));
        } else {
          const id = url.replace(pollRoute, "").slice(1)
          const data = await new PollRepository().getById(id)
          res.writeHead(200, { 'Content-Type': 'text/json' });
          return res.end(JSON.stringify({ data }));
        }
      }
      case "POST": {
        if (pollRoute === url) {
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
          }
          const json = JSON.parse(body);
          const data = await new PollRepository().create(json)
          res.writeHead(200, { 'Content-Type': 'text/json' });
          return res.end(JSON.stringify({ data }));
        }
      }
    }
  }

  const resultsRoute = "/api/result"
  if (url?.startsWith(resultsRoute)) {
    switch (method) {
      case "POST": {
        if (resultsRoute === url) {
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
          }
          const json = JSON.parse(body);
          const data = await new ResultRepository().create(json)
          res.writeHead(200, { 'Content-Type': 'text/json' });
          return res.end(JSON.stringify({ data }));
        }
        if (url === `${resultsRoute}/generate`) {
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
          }
          const json = JSON.parse(body);
          const data = await new ResultRepository().aggregateResults(json.pollId, json.questionId)
          res.writeHead(200, { 'Content-Type': 'text/json' });
          return res.end(JSON.stringify({ data }));
        }
      }
    }
  }


  res.writeHead(404);
  return res.end()
});

server.on('clientError', (err, socket) => {
  console.error(err)
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(port, async () => {
  const inst = await mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  if (inst.connection.readyState === 1) {
    console.log("Mongo connected")
  } else {
    throw new Error(`Error connecting to db. State: ${inst.connection.readyState}`)
  }

  console.log(`Server running at port: ${port}`)
});

