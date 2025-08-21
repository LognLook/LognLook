-- Copyright 2025 LognLook
-- Licensed under the Apache License, Version 2.0
-- LognLook 프로젝트 설정 테이블 스키마

-- 프로젝트 설정 테이블
CREATE TABLE `project_settings` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL UNIQUE, -- 프로젝트 연결 (1:1 관계)
    logstash_config JSON NOT NULL DEFAULT '[]', -- logstash 연결 설정
    log_keywords JSON NOT NULL DEFAULT '[]', -- 로그 키워드 설정
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 설정 최종 수정일
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);