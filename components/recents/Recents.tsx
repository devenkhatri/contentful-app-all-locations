import React, { useCallback } from 'react';
import { Box, EntityList, EntityListItem, Flex, Grid, Heading, Note, Paragraph, Text } from '@contentful/f36-components';
import { useAsync } from 'react-async-hook';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Recent } from './Recent';
import { LoadingRecents } from './LoadingRecents';
import { ContentEntitySys, HomeAppSDK } from '@contentful/app-sdk';

const Recents = () => {
  const sdk = useSDK<HomeAppSDK>();
  const cma = sdk.cma;

  // Fetch some entries were last updated by the current user.
  const getRecentEntries = useCallback(async () => {
    return await cma.entry.getMany({ query: { 'sys.updatedBy.sys.id': sdk.user.sys.id, limit: 3 } });
  }, [cma]);

  const { result, loading } = useAsync(getRecentEntries, []);

  const getContentTypes = useCallback(async () => {
    return await cma.contentType.getMany({});
  }, [cma]);

  const contentTypes = useAsync(getContentTypes, []);

  function getEntryStatus(entrySys: ContentEntitySys) {
    if (!!entrySys.archivedVersion) {
      return 'archived';
    } else if (!!entrySys.publishedVersion && entrySys.version == entrySys.publishedVersion + 1) {
      return 'published';
    } else if (!!entrySys.publishedVersion && entrySys.version >= entrySys.publishedVersion + 2) {
      return 'changed';
    }
    return 'draft';
  }

  return (
    <Flex
      style={{ width: '900px' }}
      flexDirection="column"
      marginTop="spacing3Xl"
      paddingBottom="spacing2Xl">
      <Text fontColor="blue900" fontSize="fontSize2Xl" fontWeight="fontWeightDemiBold" marginBottom='spacingS'>
        Your recent work:
      </Text>
      <Text>These entries were most recently updated by you.</Text>
      {loading ? (
        <Flex marginTop="spacingXl">
          <LoadingRecents />
        </Flex>
      ) : (

        <Box marginTop="spacingM">
          <EntityList>
            {result &&
              result.items.map((entry: any) => {
                const contentType = contentTypes && contentTypes.result && contentTypes.result.items &&
                  contentTypes.result.items.length &&
                  contentTypes.result.items.find((ct) => ct.sys.id === entry.sys.contentType.sys.id);
                return (
                  <EntityListItem
                    entityType="entry"
                    onClick={() => sdk.navigator.openEntry(entry.sys.id)}
                    key={entry.sys.id}
                    title={
                      (contentType &&
                        entry.fields[contentType.displayField] &&
                        entry.fields[contentType.displayField]['en-US']) ||
                      'Untitled'
                    }
                    status={getEntryStatus(entry.sys)}
                    contentType={contentType ? contentType.name : entry.sys.contentType.type}
                  />
                );
              })}
          </EntityList>
          {result && result.items && result.items.length <= 0 &&
            <Note variant="neutral">
              No Result Found!
            </Note>
          }
        </Box>
      )}
    </Flex>
  );
};

export default Recents;
