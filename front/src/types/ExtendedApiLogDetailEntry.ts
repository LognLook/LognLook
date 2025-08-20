import { LogLevel } from './logs';

// ExtendedApiLogDetailEntry 타입 정의
export interface ExtendedApiLogDetailEntry {
  _id: string;
  _source: {
    message?: string;
    event?: {
      original?: string;
    };
    message_timestamp?: string;
    '@timestamp'?: string;
    log_level?: string;
    keyword?: string;
    [key: string]: any; // 추가 필드들을 위한 인덱스 시그니처
  };
} 