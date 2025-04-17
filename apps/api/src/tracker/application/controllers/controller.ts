import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { TrackerEventMessageInterface } from '../../domain/interfaces/event_message';
import { TrackerService } from '../../domain/services/service';

@Controller()
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @MessagePattern('test.events.system')
  eventFired(@Payload() event: TrackerEventMessageInterface) {
    this.trackerService.trackEvent(event);
  }
}
