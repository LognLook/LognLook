-- Copyright 2025 LognLook
-- Licensed under the Apache License, Version 2.0
-- LognLook 트러블슈팅 리포트 테이블 스키마

-- 트러블슈팅 리포트 테이블
CREATE TABLE `troubles` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    created_by INT NOT NULL, -- 리포트 작성자
    report_name VARCHAR(1000) NOT NULL, -- 리포트 제목
    user_query VARCHAR(1000) NOT NULL, -- 사용자 쿼리
    content VARCHAR(10000) NOT NULL, -- 리포트 내용
    is_shared BOOLEAN NOT NULL DEFAULT FALSE, -- 리포트 공유 여부
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 리포트 생성 일시
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);