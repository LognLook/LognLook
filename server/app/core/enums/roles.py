from enum import Enum


class ProjectRole(str, Enum):
    """프로젝트 내 사용자 역할"""

    MASTER = "master"
    MANAGER = "manager"
    MODERATOR = "moderator"
    MEMBER_MANAGER = "member_manager"
    MEMBER = "member"


class Permission(str, Enum):
    """프로젝트 권한"""

    KICK_MEMBER = "kick_member"
    CHANGE_ROLE = "change_role"
    VIEW_PROJECT = "view_project"
