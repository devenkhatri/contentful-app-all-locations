import { Card, Flex, DisplayText, Text, Button, Collapse, Heading, Modal, Paragraph, IconButton, Table } from '@contentful/f36-components';
import React, { useState, useEffect } from 'react';
import { ArrowDownTrimmedIcon, ExternalLinkTrimmedIcon } from '@contentful/f36-icons';
import _ from 'lodash';

interface StatCardProps {
  count: number;
  title: string;
  data: any;
  type: string;
}

export const StatCard = ({ count, title, data, type }: StatCardProps) => {
  const [isShown, setShown] = useState(false);
  const [isOpenLinkEnabled, setIsOpenLinkEnabled] = useState(false);
  const [isDetailsEnabled, setIsDetailsEnabled] = useState(false);

  useEffect(() => {
    // if(type=="entries") {
    // setIsOpenLinkEnabled(true);
    setIsDetailsEnabled(true);
    // }
  }, []);

  const getModelContent = (type: string) => {
    console.log("****** data", data)
    if (type == "contentTypes") return getContentTypesDetails(data);
    if (type == "entries") return getEntriesDetails(data);
    if (type == "publishedEntries") return getPublishedEntriesDetails(data);
    if (type == "unPublishedEntries") return getUnPublishedEntriesDetails(data);
    if (type == "assets") return getAssetsDetails(data);
    if (type == "tags") return getTagsDetails(data);
    return <Heading>Work in progress...</Heading>
  }

  const getContentTypesDetails = (data: any) => {
    return (
      <React.Fragment>
        <Heading>ContentTypes Details</Heading>
        <Table>
          <Table.Head>
            <Table.Cell>Name</Table.Cell>
            <Table.Cell>Total Fields</Table.Cell>
            <Table.Cell>Display Field</Table.Cell>
          </Table.Head>
          <Table.Body>
            {data && data.items.map((item: any) => (
              <Table.Row>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.fields.length}</Table.Cell>
                <Table.Cell>{item.displayField}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }

  const getEntriesDetails = (data: any) => {
    const groupbyContenttype = _.groupBy(data.items, item => item.sys.contentType.sys.id)
    return (
      <React.Fragment>
        <Heading>Entries Details</Heading>
        <Table>
          <Table.Head>
            <Table.Cell>ContentType Name</Table.Cell>
            <Table.Cell>Total Records</Table.Cell>
          </Table.Head>
          <Table.Body>
            {groupbyContenttype && Object.keys(groupbyContenttype).map((item: any) => (
              <Table.Row>
                <Table.Cell>{item}</Table.Cell>
                <Table.Cell>{groupbyContenttype[item].length}</Table.Cell>                
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }

  const getPublishedEntriesDetails = (data: any) => {
    return getEntriesDetails(data);
  }

  const getUnPublishedEntriesDetails = (data: any) => {
    const unpublishedEntries = _.filter(data.items, item => item.sys.publishedCounter <= 0 )    
    return getEntriesDetails({items: unpublishedEntries});
  }

  const getAssetsDetails = (data: any) => {
    return (
      <Heading>Assets Details</Heading>
    );
  }

  const getTagsDetails = (data: any) => {
    return (
      <Heading>Tags Details</Heading>
    );
  }

  return (
    <Card padding='none' margin='none'>
      <IconButton
        variant="transparent"
        aria-label="Open details"
        icon={<ExternalLinkTrimmedIcon size="tiny" variant="primary" />}
        size='small'
        // onClick={() => setShown(true)}
        style={{ float: 'right' }}
        isDisabled={!isOpenLinkEnabled}
      />
      <Card padding="large" style={{ border: "0px" }} alignItems="center">
        <Flex flexDirection="column" alignItems="center">
          <DisplayText as="h2" marginBottom="none" size="large">
            {count}
          </DisplayText>
          <Text fontColor="gray700" fontSize="fontSizeL">
            {title}
          </Text>
        </Flex>
      </Card>
      <IconButton
        variant="transparent"
        aria-label="Open details"
        icon={<ArrowDownTrimmedIcon variant="primary" />}
        size='small'
        onClick={() => setShown(true)}
        style={{ float: 'right' }}
        isDisabled={!isDetailsEnabled}
      />
      <Modal onClose={() => setShown(false)} isShown={isShown}>
        {() => (
          <>
            <Modal.Header
              title={title}
              subtitle={"[" + count + "]"}
              onClose={() => setShown(false)}
            />
            <Modal.Content>
              {getModelContent(type)}
            </Modal.Content>
          </>
        )}
      </Modal>
    </Card>
  )
};
