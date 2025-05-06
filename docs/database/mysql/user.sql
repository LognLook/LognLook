-- 회원 테이블
CREATE TABLE `User` (
    user_id INT AUTO_INCREMENT PRIMARY KEY, 
    email VARCHAR(255) NOT NULL, -- 구글 로그인 식별자
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 회원 가입 일시
);