import React, { useCallback } from 'react';
import { Flex, Grid, Text } from '@contentful/f36-components';
import { useAsync } from 'react-async-hook';
import { useCMA } from '@contentful/react-apps-toolkit';
import { StatCard } from './StatCard';
import { LoadingStats } from './LoadingStats';

const Stats = () => {
  const cma = useCMA();
  // cma.entry.getMany({query: {'status':'changed'}})
  const getStats = useCallback(async () => {
    const [contentTypes, entries, publishedEntries, assets, locales, tags] = await Promise.all([
      cma.contentType.getMany({}),
      cma.entry.getMany({}),
      cma.entry.getPublished({}),
      cma.asset.getMany({}),
      cma.locale.getMany({}),
      cma.tag.getMany({}),
    ]);

    return {
      contentTypes: { num: contentTypes.total, text: 'Content Types', data: contentTypes, type: 'contentTypes' },
      entries: { num: entries.total, text: 'Entries', data: entries, type: 'entries' },
      publishedEntries: { num: publishedEntries.total, text: 'Published Entries', data: publishedEntries, type: 'publishedEntries' },
      assets: { num: assets.total, text: 'Assets', data: assets, type: 'assets' },
      locales: { num: locales.total, text: 'Locales', data: locales, type: 'locales' },
      tags: { num: tags.total, text: 'Tags', data: tags, type: 'tags' },
    };
  }, [cma]);

  const { result: statResult, loading: statLoading } = useAsync(getStats, []);
  return (
    <>
      <Text fontColor="blue900" fontSize="fontSize2Xl" fontWeight="fontWeightDemiBold">
        Summary of the current state of this environment:
      </Text>
      {statLoading ? (
        <Flex marginTop="spacingXl">
          <LoadingStats />
        </Flex>
      ) : (
        <Grid
          marginTop="spacingXl"
          columns="1fr 1fr 1fr 1fr"
          rowGap="spacingM"
          columnGap="spacingM">
          {statResult &&
            Object.entries(statResult).map(([key, value]) => (
              <Grid.Item key={key}>
                <StatCard count={value.num} title={value.text} data={value.data} type={value.type} />
              </Grid.Item>
            ))}
        </Grid>
      )}
    </>
  );
};

export default Stats;
