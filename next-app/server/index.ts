import express, { Request, Response } from "express";
import next from "next";

import { Redis } from "ioredis";
import {createBullBoard} from "@bull-board/api";
import {BullMQAdapter} from "@bull-board/api/bullMQAdapter";
import {ExpressAdapter} from "@bull-board/express";

import { Queue as QueueMQ, Worker } from "bullmq";

const sleep = (t:number) => new Promise((resolve) => setTimeout(resolve, t * 1000));

const connection = new Redis(6379,"redis",{ maxRetriesPerRequest: null });

const createQueueMQ = (name:string) => new QueueMQ(name, { connection});

function setupBullMQProcessor(queueName:string) {
  new Worker(
    queueName,
    async (job) => {
      for (let i = 0; i <= 100; i++) {
        await sleep(Math.random());
        await job.updateProgress(i);
        await job.log(`Processing job at interval ${i}`);

        if (Math.random() * 200 < 1) throw new Error(`Random error ${i}`);
      }

      return { jobId: `This is the return value of job (${job.id})` };
    },
    { connection }
  );
}

async function mainAsync(){
  const exampleBullMq = createQueueMQ('BullMQ');

  await setupBullMQProcessor(exampleBullMq.name);
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/ui');
  
  createBullBoard({
    queues: [new BullMQAdapter(exampleBullMq)],
    serverAdapter,
  });
  
  
  const port = parseInt(process.env.PORT || '3000', 10)
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();
  
  await app.prepare();
  const server = express();
  server.use('/ui', serverAdapter.getRouter());
  server.use('/add', (req, res) => {
    exampleBullMq.add('Add', { title: req.query.title });

    res.json({
      ok: true,
    });
  });

  server.all("*", (req: Request, res: Response) => {
    return handle(req, res);
  });
  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`
    );
  });
}

mainAsync();