-- 프로젝트 테이블
CREATE TABLE Project (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL, -- 프로젝트 이름
    description VARCHAR(50),   -- 프로젝트 설명
    created_by INT NOT NULL, -- 프로젝트 생성자
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 프로젝트 생성 일시
    FOREIGN KEY (created_by) REFERENCES `User`(user_id)
);