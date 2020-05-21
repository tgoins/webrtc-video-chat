import * as express from 'express';
import * as path from 'path';
import { init } from './utilities';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import { container } from './ioc/inversify.config';
import * as cors from 'cors';
import * as compression from 'compression';
import * as errorHandler from 'errorhandler';
import * as socketIo from 'socket.io';
import * as https from 'https';
import { readFileSync } from 'fs';

/**
 * The API server
 */
export class Api {
  /**
   * Starts the API server.
   */
  public static start(): Api {
    return new Api();
  }
  /**
   * Creates an instance of the Api.
   */
  constructor() {
    this.init().catch(err => {
      console.error(err);
    });
  }

  private async init() {
    this.startServer();
  }

  private startServer() {
    const server = new InversifyExpressServer(container);

    server.setConfig(app => {
      app.enable('trust proxy');
      app.use(
        bodyParser.urlencoded({
          extended: true,
        }),
      );
      app.use(bodyParser.json());
      app.use(helmet());
      app.use(cors());
      app.use(compression());
      app.use(
        morgan('tiny', {
          stream: {
            write: message => console.info(message.trim()),
          },
        }),
      );

      app.use('/api', express.static(path.join(__dirname, '../../../public')));

      app.use(errorHandler());
    });

    const api = server.build();
    const port = Number(process.env.PORT) || 3003;

    const config = JSON.parse(
      readFileSync(path.join(__dirname, '../config.json'), 'utf8'),
    );

    const ssl = {
      key: readFileSync(config.ssl.key, 'utf8'),
      cert: readFileSync(config.ssl.cert, 'utf8'),
    };

    const httpsServer = https.createServer(ssl, api);

    const instance = httpsServer.listen(port, '0.0.0.0');

    const io = socketIo.listen(instance);
    init(io);

    console.info(`Express server listening on port ${port}`);
  }
}
