import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { randomInt } from 'node:crypto';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { afterEach } from 'node:test';
import { InvalidAction, InvalidArea, InvalidDate } from '../../common/errors';
import { TrackerAction } from '../enums/action';
import { TrackerArea } from '../enums/area';
import { TrackerEvent } from '../models';
import { TrackerService } from './service';
import {
  EventRepository,
  NotificationRepository,
} from 'src/tracker/infrastructure/mongodb';
import { TrackerLimitType } from '../enums/limit_type';

const mockEventRepository = {
  fetchById: jest.fn(),
  persist: jest.fn(),
  getTotalDeletionsByUserId: jest.fn(),
  getTotalUpatesInLastMinuteByUserId: jest.fn(),
  checkIfSecretReadByUserId: jest.fn(),
};

const mockNotificationRepository = {
  fetchById: jest.fn(),
  persist: jest.fn(),
};

describe('TrackerService', () => {
  let service: TrackerService;
  let eventEmitter: EventEmitter2;
  let eventRepository: EventRepository;
  let notificationRepository: NotificationRepository;

  let spyIsValidArea;
  let spyIsValidAction;
  let spyIsValidDate;

  let mockArea;
  let mockAction;
  let mockDate;

  let testEvent;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        TrackerService,
        EventEmitter2,
        {
          provide: 'EventRepository',
          useValue: mockEventRepository,
        },
        {
          provide: 'NotificationRepository',
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();
    await module.init();

    service = module.get<TrackerService>(TrackerService);
    eventEmitter = module.get(EventEmitter2);
    eventRepository = module.get<EventRepository>('EventRepository');
    notificationRepository = module.get<NotificationRepository>(
      'NotificationRepository',
    );

    spyIsValidArea = jest.spyOn(TrackerEvent, 'isValidArea');
    spyIsValidAction = jest.spyOn(TrackerEvent, 'isValidAction');
    spyIsValidDate = jest.spyOn(TrackerEvent, 'isValidDate');

    const areas = Object.values(TrackerArea);
    const actions = Object.values(TrackerAction);

    mockArea = areas.at(randomInt(0, areas.length));
    mockAction = actions.at(randomInt(0, actions.length));
    mockDate = new Date().toDateString();

    testEvent = {
      userId: randomInt(1, 101),
      scope: `${mockArea}.${mockAction}`,
      date: mockDate,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(eventEmitter.hasListeners('tracker-event.fired')).toBe(true);
    expect(eventEmitter.hasListeners('tracker-notification.fired')).toBe(true);
  });

  describe('Integration Execution ', () => {
    it('should track event when consume event from kafka', async () => {
      service.trackEvent(testEvent);
  
      expect(spyIsValidArea).toHaveBeenCalledWith(mockArea);
      expect(spyIsValidAction).toHaveBeenCalledWith(mockAction);
      expect(spyIsValidDate).toHaveBeenCalledWith(mockDate);
  
      expect(eventRepository.persist).toBeCalledWith(
        expect.objectContaining({
          userId: testEvent.userId,
          area: mockArea,
          action: mockAction,
          date: expect.any(Date),
        }),
      );
    });
  
    // ('should record notification when user reaches 3+ delete attempts', async () => {
    it.each(Object.values(TrackerArea))
      ('should record notification when user reaches 3+ delete attempts, area: %s', async (area) => {
      mockArea = area;
      mockAction = TrackerAction.DELETE;
      const mockEvent = {
        ...testEvent,
        scope: `${mockArea}.${mockAction}`,
      };
  
      jest
        .spyOn(eventRepository, 'getTotalDeletionsByUserId')
        .mockResolvedValue(randomInt(3,100));
  
      await service.trackEvent(mockEvent);
      expect(eventRepository.persist).toBeCalledWith(
        expect.objectContaining({
          userId: mockEvent.userId,
          area: mockArea,
          action: mockAction,
          date: expect.any(Date),
        }),
      );
  
      expect(notificationRepository.persist).toBeCalledWith(
        expect.objectContaining({
          date: expect.any(Date),
          limitType: TrackerLimitType.USER_DELETIONS,
          userId: mockEvent.userId,
        })
      );
    });
  
    it('should record notification when user reads a top-secret', async () => {
      mockArea = TrackerArea.TOP_SECRET;
      mockAction = TrackerAction.READ;
      const mockEvent = {
        ...testEvent,
        scope: `${mockArea}.${mockAction}`,
      };
  
      jest
        .spyOn(eventRepository, 'checkIfSecretReadByUserId')
        .mockResolvedValue(true);
  
      await service.trackEvent(mockEvent);
      expect(eventRepository.persist).toBeCalledWith(
        expect.objectContaining({
          userId: mockEvent.userId,
          area: mockArea,
          action: mockAction,
          date: expect.any(Date),
        }),
      );
  
      expect(notificationRepository.persist).toBeCalledWith(
        expect.objectContaining({
          date: expect.any(Date),
          limitType: TrackerLimitType.TOP_SECRET_READ,
          userId: mockEvent.userId,
        })
      );
    });
  
    it('should record notification when user updates 2 users in 1 minute', async () => {
      mockArea = TrackerArea.USER;
      mockAction = TrackerAction.UPDATE;
      const mockEvent = {
        ...testEvent,
        scope: `${mockArea}.${mockAction}`,
      };
  
      jest
        .spyOn(eventRepository, 'getTotalUpatesInLastMinuteByUserId')
        .mockResolvedValue(randomInt(2,100));
  
      await service.trackEvent(mockEvent);
      expect(eventRepository.persist).toBeCalledWith(
        expect.objectContaining({
          userId: mockEvent.userId,
          area: mockArea,
          action: mockAction,
          date: expect.any(Date),
        }),
      );
  
      expect(notificationRepository.persist).toBeCalledWith(
        expect.objectContaining({
          date: expect.any(Date),
          limitType: TrackerLimitType.USER_UPDATED_IN_1_MINUTE,
          userId: mockEvent.userId,
        })
      );
    });
  });

  describe('Data validation', () => {
    it('should fail when Area is not valid', async () => {
      const mockEvent = {
        ...testEvent,
        scope: `fake.${mockAction}`,
      };

      await expect(service.trackEvent(mockEvent)).rejects.toThrow(InvalidArea);
    });

    it('should fail when Action is not valid', async () => {
      const mockEvent = {
        ...testEvent,
        scope: `${mockArea}.fake`,
      };

      await expect(service.trackEvent(mockEvent)).rejects.toThrow(InvalidAction);
    });

    it('should fail when Date is not valid', async () => {
      const mockEvent = {
        ...testEvent,
        date: 'fakeDate',
      };

      await expect(service.trackEvent(mockEvent)).rejects.toThrow(InvalidDate);
    });
  });
});
