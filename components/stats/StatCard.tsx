import { Card, Flex, DisplayText, Text } from '@contentful/f36-components';
import React from 'react';

interface StatCardProps {
  count: number;
  title: string;
}

export const StatCard = ({ count, title }: StatCardProps) => (
  <Card padding="large">
    <Flex flexDirection="column" alignItems="center">
      <DisplayText as="h2" marginBottom="none" size="large">
        {count}
      </DisplayText>
      <Text fontColor="gray700" fontSize="fontSizeXl">
        {title}
      </Text>
    </Flex>
  </Card>
);
