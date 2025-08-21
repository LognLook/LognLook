-- Copyright 2025 LognLook
-- Licensed under the Apache License, Version 2.0
-- LognLook 알림 테이블 스키마

-- 알림 테이블
CREATE TABLE `notifications` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL, -- 프로젝트 관련 알림
    type VARCHAR(50) NOT NULL, -- 알림 유형 (LogAlert, TeamTroubleReport, TeamPermissionUpdate, ProjectNotification)
    message TEXT, -- 알림 메시지
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 알림 생성 일시
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);