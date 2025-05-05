-- 프로젝트 참여 (UserProject) 매핑 테이블
CREATE TABLE UserProject (
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    role VARCHAR(20), -- 프로젝트 내 역할 (Owner, Member)
    email_notification BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id, project_id), -- 프로젝트별 알림 설정
    FOREIGN KEY (user_id) REFERENCES `User`(user_id),
    FOREIGN KEY (project_id) REFERENCES Project(project_id)
);