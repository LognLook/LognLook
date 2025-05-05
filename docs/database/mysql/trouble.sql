-- 트러블슈팅 리포트 테이블
CREATE TABLE Trouble (
    trouble_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    trouble_name VARCHAR(50), -- 리포트 제목
    is_shared BOOLEAN NOT NULL DEFAULT FALSE, -- 리포트 공유 여부
    description TEXT, -- 리포트 내용
    created_by INT NOT NULL, -- 리포트 작성자
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 리포트 생성 일시
    FOREIGN KEY (project_id) REFERENCES Project(project_id),
    FOREIGN KEY (created_by) REFERENCES `User`(user_id)
);