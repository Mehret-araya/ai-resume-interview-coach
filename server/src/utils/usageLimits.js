
export const FREE_RESUME_REWRITES = Number(
  process.env.FREE_RESUME_REWRITES || 2
);

export const FREE_INTERVIEWS = Number(
  process.env.FREE_INTERVIEWS || 1
);

export const initializeUsageFields = (user) => {
  let changed = false;

  if (
    typeof user.resumeRewriteCount !== "number"
  ) {
    user.resumeRewriteCount = 0;
    changed = true;
  }

  if (
    typeof user.interviewCount !== "number"
  ) {
    user.interviewCount = 0;
    changed = true;
  }

  if (!user.usagePeriodStart) {
    user.usagePeriodStart = new Date();
    changed = true;
  }

  return changed;
};

export const hasResumeRewriteAvailable = (user) => {
  return user.resumeRewriteCount < FREE_RESUME_REWRITES;
};

export const hasInterviewAvailable = (user) => {
  return user.interviewCount < FREE_INTERVIEWS;
};

