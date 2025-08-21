-- Copyright 2025 LognLook
-- Licensed under the Apache License, Version 2.0
-- LognLook 사용자-프로젝트 매핑 테이블 스키마

-- 프로젝트 참여 (UserProject) 매핑 테이블
CREATE TABLE `user_project` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    role VARCHAR(20), -- 프로젝트 내 역할 (Owner, Member)
    email_notification BOOLEAN NOT NULL DEFAULT TRUE, -- 프로젝트별 알림 설정
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);