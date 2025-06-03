import { LogLevel } from '../features/logs/types/logTypes';

export interface ExtendedApiLogDetailEntry {
  _index: string;
  _id: string;
  _score: number;
  _type?: string;
  _source?: {
    ecs?: {
      version?: string;
    };
    log?: {
      file?: {
        device_id?: string;
        fingerprint?: string;
        inode?: string;
        path?: string;
      };
      offset?: number;
      level?: string;
    };
    tags?: string[];
    agent?: {
      name?: string;
      version?: string;
      type?: string;
      ephemeral_id?: string;
      id?: string;
    };
    "@version"?: string;
    input?: {
      type?: string;
    };
    message?: string;
    event?: {
      original?: string;
      created?: string;
      dataset?: string;
      module?: string;
    };
    container?: {
      id?: string;
    };
    "@timestamp"?: string;
    host?: {
      name?: string;
      os?: {
        name?: string;
        version?: string;
        kernel?: string;
        type?: string;
        platform?: string;
        build?: string;
        family?: string;
      };
      id?: string;
      ip?: string | string[];
      hostname?: string;
      architecture?: string;
      mac?: string | string[];
    };
    comment?: string;
    keyword?: string;
    message_timestamp?: string;
    log_level?: LogLevel;
    fields?: Record<string, unknown>;
    file?: Record<string, unknown>;
  };
} 