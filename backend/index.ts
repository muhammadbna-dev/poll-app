import http from "node:http"
import mongoose from "mongoose"
import { PollRepository, ResultRepository } from "./repositories";

const port = process.env.PORT ?? 8080;

let QUESTION_USERS_COUNT: { [questionId: string]: Set<string> } = {}

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
          try {
            const data = await new ResultRepository().create(json)
            res.writeHead(200, { 'Content-Type': 'text/json' });
            return res.end(JSON.stringify({ data }));
          } catch (err) {
            // TODO: Assuming that err is unique constraint only
            res.writeHead(400, { 'Content-Type': 'text/json' });
            return res.end(JSON.stringify({ error: "Error creating result as user has already voted in question" }));
          }
        }
        if (url === `${resultsRoute}/generate`) {
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
          }
          const json = JSON.parse(body);
          const data = await new ResultRepository().aggregateResults(json.pollId)
          res.writeHead(200, { 'Content-Type': 'text/json' });
          return res.end(JSON.stringify({ data }));
        }
        if (url === `${resultsRoute}/get-answered`) {
          let body = '';
          for await (const chunk of req) {
            body += chunk.toString();
          }
          const json = JSON.parse(body);
          const data = await new ResultRepository().getAnsweredQuestions(json.pollId, json.session)
          res.writeHead(200, { 'Content-Type': 'text/json' });
          return res.end(JSON.stringify({ data }));
        }
      }
    }
  }

  const usersRoute = "/api/users"
  if (url?.startsWith(usersRoute)) {
    const questionId = url.replace(usersRoute, "").slice(1)
    // TODO: Check for invalid questionId
    switch (method) {
      case "GET": {
        console.log(QUESTION_USERS_COUNT)
        res.writeHead(200, { 'Content-Type': 'text/json' });
        const returnVal: { [questionId: string]: number } = {}

        for (const [questionId, userSet] of Object.entries(QUESTION_USERS_COUNT)) {
          returnVal[questionId] = userSet.size
        }

        return res.end(JSON.stringify({ data: returnVal }));
      }
      case "POST": {
        let body = '';
        for await (const chunk of req) {
          body += chunk.toString();
        }
        if (!questionId) {
          res.writeHead(400);
          return res.end()
        }
        if (!QUESTION_USERS_COUNT?.[questionId]) {
          QUESTION_USERS_COUNT[questionId] = new Set()
        }
        const onlineUsers = QUESTION_USERS_COUNT[questionId]

        const user = JSON.parse(body).user
        if (user) {
          onlineUsers.add(user)
          res.writeHead(200, { 'Content-Type': 'text/json' });
          return res.end(JSON.stringify({ data: onlineUsers.size }));
        }
      }
      case "DELETE": {
        let body = '';
        for await (const chunk of req) {
          body += chunk.toString();
        }

        if (!questionId) {
          res.writeHead(400);
          return res.end()
        }

        if (!QUESTION_USERS_COUNT?.[questionId]) {
          QUESTION_USERS_COUNT[questionId] = new Set()
        }

        const userSession = JSON.parse(body).user
        // TODO: CHeck if user invalid session
        QUESTION_USERS_COUNT[questionId].delete(userSession)

        res.writeHead(200, { 'Content-Type': 'text/json' });
        return res.end(JSON.stringify({ data: QUESTION_USERS_COUNT[questionId].size }));
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

