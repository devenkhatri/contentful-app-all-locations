import { Card, Flex, DisplayText, Text, Button, Collapse, Heading, Modal, Paragraph, IconButton, Table, Spinner, Note } from '@contentful/f36-components';
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDownTrimmedIcon, ExternalLinkTrimmedIcon } from '@contentful/f36-icons';
import _ from 'lodash';
import { HomeAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useAsync } from 'react-async-hook';

interface StatCardProps {
  count: number;
  title: string;
  data: any;
  type: string;
}

export const StatCard = ({ count, title, data, type }: StatCardProps) => {
  const sdk = useSDK<HomeAppSDK>();
  const cma = sdk.cma;

  const [isShown, setShown] = useState(false);
  const [isOpenLinkEnabled, setIsOpenLinkEnabled] = useState(false);
  const [isDetailsEnabled, setIsDetailsEnabled] = useState(false);

  useEffect(() => {
    if (type == "entries" || type == "assets") {
      setIsOpenLinkEnabled(true);
    }
    setIsDetailsEnabled(true);
  }, []);

  const getModelContent = (type: string) => {
    if (type == "contentTypes") return getContentTypesDetails(data);
    if (type == "entries") return getEntriesDetails("Entries Details", "");
    if (type == "publishedEntries") return getPublishedEntriesDetails();
    if (type == "unPublishedEntries") return getUnPublishedEntriesDetails();
    if (type == "assets") return getAssetsDetails();
    if (type == "tags") return getTagsDetails(data);
    return <Heading>Work in progress...</Heading>
  }

  const processOpenLinkClick = (type: string) => {
    if (type == "contentTypes") return getContentTypesDetails(data);
    if (type == "entries") sdk.navigator.openEntriesList();
    if (type == "publishedEntries") return getPublishedEntriesDetails();
    if (type == "unPublishedEntries") return getUnPublishedEntriesDetails();
    if (type == "assets") sdk.navigator.openAssetsList();
    if (type == "tags") return getTagsDetails(data);
  }

  const getContentTypesDetails = (data: any) => {
    return (
      <React.Fragment>
        <Heading>ContentTypes Details</Heading>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Total Fields</Table.Cell>
              <Table.Cell>Display Field</Table.Cell>
            </Table.Row>
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

  const getAllEntries = useCallback(async () => {
    //get all entries if its more than 1000
    let data = await cma.entry.getMany({ query: { limit: 1000 } });
    while (data.total > data.items.length) {
      const newentries = await cma.entry.getMany({ query: { skip: data.items.length, limit: 1000 } });
      data.items = _.concat(data.items, newentries.items)
    }
    return data;
  }, [])

  const getEntriesDetails = (title: string, filter: string) => {
    const { result, loading } = useAsync(getAllEntries, []);
    if (loading) return <Spinner />;
    let finalData: any = result && result.items;
    if (result && filter == "unpublished") {
      finalData = _.filter(result.items, item => item.sys.publishedCounter <= 0)
    } else if (result && filter == "published") {
      finalData = _.filter(result.items, item => item.sys.version == item.sys.publishedVersion + 1)
    }
    if (finalData && finalData.length <= 0) {
      return (
        <Note variant="neutral">
          No Result Found!
        </Note>
      )
    }

    const groupbyContenttype = _.groupBy(finalData, item => item.sys.contentType.sys.id)
    return (
      <React.Fragment>
        <Heading>{title}</Heading>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>ContentType Name</Table.Cell>
              <Table.Cell>Total Records</Table.Cell>
            </Table.Row>
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

  const getPublishedEntriesDetails = () => {
    return getEntriesDetails("Published Entries Details", "published");
  }

  const getUnPublishedEntriesDetails = () => {
    return getEntriesDetails("UnPublished Entries Details", "unpublished");
  }

  const getAllAssets = useCallback(async () => {
    //get all assets if its more than 1000
    let data = await cma.asset.getMany({ query: { limit: 1000 } });
    while (data.total > data.items.length) {
      const newassets = await cma.asset.getMany({ query: { skip: data.items.length, limit: 1000 } });
      data.items = _.concat(data.items, newassets.items)
    }
    return data;
  }, [])


  const getAssetsDetails = () => {
    const { result, loading } = useAsync(getAllAssets, []);
    if (loading) return <Spinner />;
    if (result && result.items && result.items.length <= 0) {
      return (
        <Note variant="neutral">
          No Result Found!
        </Note>
      )
    }
    const groupbyAssettype = _.groupBy(result && result.items, item => item.fields.file["en-US"].contentType)
    return (
      <React.Fragment>
        <Heading>Asset Details</Heading>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Asset Type</Table.Cell>
              <Table.Cell>Total Records</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {groupbyAssettype && Object.keys(groupbyAssettype).map((item: any) => (
              <Table.Row>
                <Table.Cell>{item}</Table.Cell>
                <Table.Cell>{groupbyAssettype[item].length}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }

  const getTagsDetails = (data: any) => {
    const sortedData = _.sortBy(data.items, item => item.name)
    return (
      <React.Fragment>
        <Heading>Asset Details</Heading>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Tag Name</Table.Cell>
              <Table.Cell>Tag ID</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {sortedData && sortedData.map((item: any) => (
              <Table.Row>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.sys.id}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }

  return (
    <Card padding='none' margin='none'>
      <IconButton
        variant="transparent"
        aria-label="Open details"
        icon={<ExternalLinkTrimmedIcon size="tiny" variant="primary" />}
        size='small'
        onClick={() => processOpenLinkClick(type)}
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