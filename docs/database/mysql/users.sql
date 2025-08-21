-- Copyright 2025 LognLook
-- Licensed under the Apache License, Version 2.0
-- LognLook 사용자 테이블 스키마

-- 회원 테이블 (실제 코드에서는 users 테이블명 사용)
CREATE TABLE `users` (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    username VARCHAR(50) NOT NULL UNIQUE, -- 사용자명
    password VARCHAR(255) NOT NULL, -- 해시된 비밀번호
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 회원 가입 일시
);