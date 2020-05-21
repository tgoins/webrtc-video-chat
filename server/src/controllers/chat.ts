import { controller, httpGet } from 'inversify-express-utils';

@controller('/api/chat')
export class ChatController {
  @httpGet('/')
  public async find() {
    return 'Hello';
  }
}
