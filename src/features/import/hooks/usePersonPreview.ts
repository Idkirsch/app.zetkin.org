import createPreviewData from '../utils/createPreviewData';
import { Sheet } from '../utils/types';
import useOrganizations from 'features/organizations/hooks/useOrganizations';
import useTags from 'features/tags/hooks/useTags';
import { ZetkinTag } from 'utils/types/zetkin';

export default function usePersonPreview(
  sheet: Sheet,
  personIndex: number,
  orgId: number
) {
  const allTags = useTags(orgId).data ?? [];
  const organizations = useOrganizations().data ?? [];

  const previewRow = createPreviewData(sheet, personIndex);

  const fields = previewRow?.data;
  const tags =
    previewRow?.tags?.reduce((acc: ZetkinTag[], mappedTag) => {
      const tag = allTags.find((t) => t.id === mappedTag.tag_id);
      if (tag) {
        return acc.concat(tag);
      }
      return acc;
    }, []) ?? [];

  const org = organizations.find(
    (org) => org.id === (previewRow?.organizations?.[0] || [])
  );

  return {
    fields,
    org,
    tags,
  };
}
