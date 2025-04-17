import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { EventRepository, NotificationRepository } from '../../infrastructure/';
import { TrackerAction } from '../enums/action';
import { TrackerArea } from '../enums/area';
import { TrackerLimitType } from '../enums/limit_type';
import { TrackerEventMessageInterface } from '../interfaces/event_message';
import { TrackerEvent, TrackerNotification } from '../models/';

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(
    @Inject('EventRepository') private eventRepository: EventRepository,
    @Inject('NotificationRepository')
    private notificationRepository: NotificationRepository,
    private eventEmitter: EventEmitter2,
  ) {
    this.eventEmitter.on('tracker-event.fired', this.handleTrakerEvent.bind(this));
    this.eventEmitter.on('tracker-notification.fired', this.handleTrackerNotificationEvent.bind(this));
  }

  async trackEvent(event: TrackerEventMessageInterface): Promise<void> {
    const [area, action] = event.scope.split('.');
    const trackerEvent = new TrackerEvent(
      event.userId,
      area,
      action,
      event.date,
    );

    await this.eventRepository.persist(trackerEvent);
    this.eventEmitter.emit('tracker-event.fired', event);
  }

  // @OnEvent('tracker-event.fired')
  handleTrakerEvent(eventData: TrackerEventMessageInterface): void {
    const [_, action] = eventData.scope.split('.');
    try {
      this.logger.debug({ event:'tracker-event.fired', scope: eventData.scope });
      if (action === TrackerAction.DELETE) {
        this.checkUserDeletedLimit(eventData);
        return;
      }
      if (eventData.scope === `${TrackerArea.TOP_SECRET}.${TrackerAction.READ}`) {
        this.checkTopSecretReadLimit(eventData);
        return;
      }
      if (eventData.scope === `${TrackerArea.USER}.${TrackerAction.UPDATE}`) {
          this.checkUserUpdatedLimit(eventData);
          return;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async checkUserDeletedLimit(
    event: TrackerEventMessageInterface,
  ): Promise<void> {
    const deletions = await this.eventRepository.getTotalDeletionsByUserId(
      event.userId,
    );
    if (deletions >= 3) {
      this.eventEmitter.emit('tracker-notification.fired', {
        ...event,
        limitType: TrackerLimitType.USER_DELETIONS,
      });
    }
  }

  async checkUserUpdatedLimit(
    event: TrackerEventMessageInterface,
  ): Promise<void> {
    const updates =
      await this.eventRepository.getTotalUpatesInLastMinuteByUserId(
        event.userId,
      );
    if (updates >= 2) {
      this.eventEmitter.emit('tracker-notification.fired', {
        ...event,
        limitType: TrackerLimitType.USER_UPDATED_IN_1_MINUTE,
      });
    }
  }

  async checkTopSecretReadLimit(
    event: TrackerEventMessageInterface,
  ): Promise<void> {
    const userHasRead = await this.eventRepository.checkIfSecretReadByUserId(
      event.userId,
    );
    if (userHasRead) {
      this.eventEmitter.emit('tracker-notification.fired', {
        ...event,
        limitType: TrackerLimitType.TOP_SECRET_READ,
      });
    }
  }

  // @OnEvent('tracker-notification.fired')
  async handleTrackerNotificationEvent(
    eventData: TrackerEventMessageInterface & { limitType: TrackerLimitType },
  ): Promise<void> {
    try {
      const trackerNotification = new TrackerNotification(
        eventData.userId,
        eventData.date,
        eventData.limitType,
      );
      await this.notificationRepository.persist(trackerNotification);
      this.logger.debug({ event: 'tracker-notification.fired', limit: eventData.limitType });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
