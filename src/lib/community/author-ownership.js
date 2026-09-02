function asCleanString(value) {
  return String(value || "").trim();
}

function normalizeName(value) {
  return asCleanString(value).toLowerCase();
}

export function getUserIdentifierValues(user = {}) {
  return [
    user.id,
    user.userId,
    user.memberId,
    user.authorId,
    user.createdBy,
    user.user?.id,
    user.user?.userId,
    user.member?.id,
    user.member?.userId,
  ]
    .map(asCleanString)
    .filter(Boolean);
}

export function getCourseAuthorIdentifierValues(course = {}) {
  return [
    course.authorId,
    course.writerId,
    course.userId,
    course.memberId,
    course.createdBy,
    course.createdById,
    course.ownerId,
    course.writer?.id,
    course.writer?.userId,
    course.author?.id,
    course.author?.userId,
    course.member?.id,
    course.member?.userId,
    course.user?.id,
    course.user?.userId,
    course.course?.authorId,
    course.course?.userId,
    course.course?.memberId,
    course.course?.createdBy,
  ]
    .map(asCleanString)
    .filter(Boolean);
}

export function isCommunityPostOwner(course = {}, user = {}) {
  if (!course || !user) return false;

  if (
    course.isOwner ||
    course.isMine ||
    course.mine ||
    course.canEdit ||
    course.editable
  ) {
    return true;
  }

  const userIds = getUserIdentifierValues(user);
  const authorIds = getCourseAuthorIdentifierValues(course);

  if (userIds.length > 0 && authorIds.length > 0) {
    if (userIds.some((id) => authorIds.includes(id))) {
      return true;
    }
  }

  const userNames = [
    user.nickname,
    user.name,
    user.userName,
    user.username,
    user.displayName,
    user.nickName,
    user.memberName,
    user.user?.nickname,
    user.user?.name,
  ]
    .map(normalizeName)
    .filter(Boolean);
  const authorNames = [
    course.name,
    course.authorKey,
    course.writerNickname,
    course.authorNickname,
    course.nickname,
    course.userName,
    course.writerName,
    course.authorName,
    course.createdByName,
    course.displayName,
    course.writer?.nickname,
    course.writer?.name,
    course.author?.nickname,
    course.author?.name,
    course.member?.nickname,
    course.member?.name,
    course.user?.nickname,
    course.user?.name,
    course.course?.writerNickname,
    course.course?.authorNickname,
    course.course?.nickname,
    course.course?.userName,
    course.course?.authorName,
    course.course?.user?.nickname,
    course.course?.user?.name,
  ]
    .map(normalizeName)
    .filter(Boolean);

  return userNames.length > 0 && userNames.some((name) => authorNames.includes(name));
}
