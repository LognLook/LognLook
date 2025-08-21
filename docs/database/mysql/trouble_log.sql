-- Copyright 2025 LognLook
-- Licensed under the Apache License, Version 2.0
-- LognLook 트러블슈팅 리포트-로그 맵핑 테이블 스키마

-- 트러블슈팅 리포트 로그 맵핑 테이블
CREATE TABLE `trouble_logs` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trouble_id INT NOT NULL,
    log_id VARCHAR(100) NOT NULL, -- OpenSearch 문서 ID
    FOREIGN KEY (trouble_id) REFERENCES troubles(id) ON DELETE CASCADE
);
