import { Card, Flex, DisplayText, Text, Button, Collapse, Heading, Modal, Paragraph } from '@contentful/f36-components';
import React, { useState } from 'react';

interface StatCardProps {
  count: number;
  title: string;
  data: any;
  type: string;
}

export const StatCard = ({ count, title, data, type }: StatCardProps) => {
  const [isShown, setShown] = useState(false);

  return (
  <Card padding="large">
    <Flex flexDirection="column" alignItems="center">
      <DisplayText as="h2" marginBottom="none" size="large">
        {count}
      </DisplayText>
      <Text fontColor="gray700" fontSize="fontSizeXl">
        {title}
      </Text>
      <Button onClick={() => setShown(true)}>Open modal</Button>
      <Modal onClose={() => setShown(false)} isShown={isShown}>
        {() => (
          <>
            <Modal.Header
              title={title}
              subtitle={"["+count+"]"}
              onClose={() => setShown(false)}
            />
            <Modal.Content>
              <Heading>
                First entry published! It can now be fetched via the APIs
              </Heading>
              <Paragraph>
                To discover more about how to consume content from the APIs, go
                to Space Home.
              </Paragraph>
            </Modal.Content>
          </>
        )}
      </Modal>
    </Flex>
  </Card>
)};
