-- 알림 테이블
CREATE TABLE Notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL , -- 프로젝트 관련 알림일 경우, 없으면 NULL 허용
    type VARCHAR(50) NOT NULL, -- 알림 유형 (LogAlert, TeamTroubleReport, TeamPermissionUpdate, ProjectNotification
    message TEXT, -- 알림 메시지
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 알림 생성 일시
    FOREIGN KEY (project_id) REFERENCES Project(project_id)
);