-- Copyright 2025 LognLook
-- Licensed under the Apache License, Version 2.0
-- LognLook 프로젝트 테이블 스키마

-- 프로젝트 테이블
CREATE TABLE `project` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL, -- 프로젝트 이름
    description VARCHAR(50), -- 프로젝트 설명
    `index` VARCHAR(36) NOT NULL, -- OpenSearch 인덱스 UUID
    api_key VARCHAR(36) NOT NULL, -- API 키 UUID
    invite_code VARCHAR(22) NOT NULL, -- 초대 코드
    language ENUM('KOREAN', 'ENGLISH') NOT NULL DEFAULT 'KOREAN', -- 언어 설정
    create_by INT, -- 프로젝트 생성자
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 프로젝트 생성 일시
    FOREIGN KEY (create_by) REFERENCES users(id)
);