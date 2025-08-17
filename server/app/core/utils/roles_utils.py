from typing import List, Dict

from app.core.enums.roles import Permission, ProjectRole


# 역할별 권한 매핑
ROLE_PERMISSIONS: Dict[ProjectRole, List[Permission]] = {
    ProjectRole.MASTER: [
        Permission.KICK_MEMBER,
        Permission.CHANGE_ROLE,
        Permission.VIEW_PROJECT,
    ],
    ProjectRole.MANAGER: [
        Permission.KICK_MEMBER,
        Permission.CHANGE_ROLE,
        Permission.VIEW_PROJECT,
    ],
    ProjectRole.MODERATOR: [
        Permission.KICK_MEMBER,
        Permission.VIEW_PROJECT,
    ],
    ProjectRole.MEMBER_MANAGER: [
        Permission.VIEW_PROJECT,
    ],
    ProjectRole.MEMBER: [
        Permission.VIEW_PROJECT,
    ],
}

# 역할 계층 구조 (상위 역할이 하위 역할을 관리할 수 있음)
ROLE_HIERARCHY: Dict[ProjectRole, List[ProjectRole]] = {
    ProjectRole.MASTER: [
        ProjectRole.MANAGER,
        ProjectRole.MODERATOR,
        ProjectRole.MEMBER_MANAGER,
        ProjectRole.MEMBER,
    ],
    ProjectRole.MANAGER: [
        ProjectRole.MODERATOR,
        ProjectRole.MEMBER_MANAGER,
        ProjectRole.MEMBER,
    ],
    ProjectRole.MODERATOR: [
        ProjectRole.MEMBER,
    ],
    ProjectRole.MEMBER_MANAGER: [
        ProjectRole.MEMBER,
    ],
    ProjectRole.MEMBER: [],
}


def has_permission(role: ProjectRole, permission: Permission) -> bool:
    """특정 역할이 권한을 가지고 있는지 확인"""
    return permission in ROLE_PERMISSIONS.get(role, [])


def can_manage_role(manager_role: ProjectRole, target_role: ProjectRole) -> bool:
    """관리자 역할이 대상 역할을 관리할 수 있는지 확인"""
    # 같은 역할인 경우
    if manager_role == target_role:
        return True
    # 하위 역할 관리 가능
    return target_role in ROLE_HIERARCHY.get(manager_role, [])
