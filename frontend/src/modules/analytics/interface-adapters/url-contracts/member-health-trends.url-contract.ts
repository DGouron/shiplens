export const MEMBER_HEALTH_TRENDS_PATH = '/member-health-trends';

export const MEMBER_HEALTH_TRENDS_URL_PARAM = {
  teamId: 'teamId',
  memberName: 'memberName',
} as const;

export interface MemberHealthTrendsHrefParams {
  teamId: string;
  memberName: string;
}

export function memberHealthTrendsHref(
  params: MemberHealthTrendsHrefParams,
): string {
  const search = new URLSearchParams({
    [MEMBER_HEALTH_TRENDS_URL_PARAM.teamId]: params.teamId,
    [MEMBER_HEALTH_TRENDS_URL_PARAM.memberName]: params.memberName,
  });
  return `${MEMBER_HEALTH_TRENDS_PATH}?${search.toString()}`;
}
