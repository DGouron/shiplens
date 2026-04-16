import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { type MemberDigestResponse } from '../../entities/member-digest/member-digest.response.ts';
import { MemberDigestPresenter } from '../presenters/member-digest.presenter.ts';
import { memberDigestTranslations } from '../presenters/member-digest.translations.ts';
import { type MemberDigestViewModel } from '../presenters/member-digest.view-model.schema.ts';

export interface UseMemberDigestParams {
  teamId: string;
  cycleId: string;
  memberName: string;
}

export type MemberDigestState = AsyncState<MemberDigestViewModel>;

export interface UseMemberDigestResult {
  state: MemberDigestState;
  generate: () => void;
  copyToClipboard: () => void;
}

const COPY_CONFIRMATION_TIMEOUT_MS = 2000;

export function useMemberDigest(
  params: UseMemberDigestParams,
): UseMemberDigestResult {
  const locale = useLocale();
  const { teamId, cycleId, memberName } = params;
  const [digestResponse, setDigestResponse] =
    useState<MemberDigestResponse | null>(null);
  const [copyConfirmation, setCopyConfirmation] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousMemberNameRef = useRef<string>(memberName);

  useEffect(() => {
    if (previousMemberNameRef.current !== memberName) {
      setDigestResponse(null);
      setCopyConfirmation(null);
      previousMemberNameRef.current = memberName;
    }
  }, [memberName]);

  const generateMutation = useMutation({
    mutationFn: () =>
      usecases.generateMemberDigest.execute({ cycleId, teamId, memberName }),
    onSuccess: (response) => {
      setDigestResponse(response);
    },
  });

  const translations = memberDigestTranslations[locale];
  const presenter = useMemo(
    () => new MemberDigestPresenter(translations),
    [translations],
  );

  const state: MemberDigestState = {
    status: 'ready',
    data: presenter.present({
      response: digestResponse,
      isGenerating: generateMutation.isPending,
      copyConfirmation,
      memberName,
    }),
  };

  const generate = useCallback(() => {
    generateMutation.mutate();
  }, [generateMutation]);

  const triggerCopyConfirmation = useCallback(() => {
    if (copyTimeoutRef.current !== null) {
      clearTimeout(copyTimeoutRef.current);
    }
    setCopyConfirmation(translations.copyConfirmation);
    copyTimeoutRef.current = setTimeout(() => {
      setCopyConfirmation(null);
      copyTimeoutRef.current = null;
    }, COPY_CONFIRMATION_TIMEOUT_MS);
  }, [translations.copyConfirmation]);

  const copyToClipboard = useCallback(() => {
    if (digestResponse === null || digestResponse.digest === null) return;
    void navigator.clipboard.writeText(digestResponse.digest).then(() => {
      triggerCopyConfirmation();
    });
  }, [digestResponse, triggerCopyConfirmation]);

  return { state, generate, copyToClipboard };
}
