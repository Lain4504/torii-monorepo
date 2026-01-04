import { Controller, Logger } from '@nestjs/common';

@Controller()
export class CortexController {
  private readonly logger = new Logger(CortexController.name);

  // Controllers for each agent are now in their respective modules
}
